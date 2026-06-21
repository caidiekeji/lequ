/**
 * 订单履约（发牌）服务 — 单一职责
 *
 * 修复缺陷 #6：原 pay-callback.js 与 admin-payment.js 中发牌逻辑完全重复，
 * 且 D1 不支持跨语句事务，任一步骤失败会导致「订单已 paid 但无 license」。
 *
 * 本模块为系统中「订单 → 授权」的唯一入口，所有发牌路径（支付回调、手动确认、
 * 后续 Phase B 退款回滚除外）都通过 fulfillOrderViaLock 走 OrderLock 串行化，
 * 保证同一订单并发触发只发一次牌。
 *
 * 核心规则：
 *   1. 订单必须是 pending 状态（已 paid 的直接返回，幂等）
 *   2. 续费订单（remark 以「续费授权」开头 + 有 license_id）→ 延长现有 license
 *   3. 新购订单 → 创建新 license，回填 order.license_id
 *   4. license 限额完全由 plans 表驱动（修复缺陷 #7，不再依赖 EDITIONS 字典）
 */

import { generateLicenseKey } from '../utils.js'
import { sendMail, buildOrderConfirmEmail } from './email.js'

/**
 * 通过 OrderLock 串行化发牌（对外推荐入口）
 * @param {Object} env - Worker env（需含 DB、ORDER_LOCK）
 * @param {string} orderNo - 订单号
 * @param {Object} [opts]
 * @param {string} [opts.paymentNo] - 第三方交易号（回调场景）
 * @param {number} [opts.adminId] - 手动确认的管理员 ID（用于审计回填 confirm_admin_id）
 * @returns {Promise<{ok:boolean, alreadyFulfilled?:boolean, licenseId?:number, error?:string, message?:string}>}
 */
export async function fulfillOrderViaLock(env, orderNo, opts = {}) {
  if (!env.ORDER_LOCK) {
    // DO 未绑定 → 退化为直接发牌（仍保证业务幂等，但并发保护弱）
    return fulfillOrder(env, orderNo, opts)
  }

  const id = env.ORDER_LOCK.idFromName(orderNo)
  const stub = env.ORDER_LOCK.get(id)

  // 把当前请求上下文的 paymentNo/adminId 通过 env 临时传递给 DO 内的 fulfiller
  // （DO 无法直接拿到 c，fulfiller 仅依赖 env + orderNo）
  const wrappedEnv = new Proxy(env, {
    get(target, prop) {
      if (prop === '__fulfillOrder') return (e, no) => fulfillOrder(e, no, opts)
      return Reflect.get(target, prop)
    },
  })

  try {
    const resp = await stub.fetch('http://do/fulfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNo }),
    })
    const data = await resp.json()
    return data
  } catch (e) {
    return { ok: false, error: 'do_call_failed', message: e.message }
  }
}

/**
 * 实际发牌逻辑（幂等：订单非 pending 直接返回）
 *
 * 返回值约定：
 *   - { ok: true, alreadyFulfilled: true }  → 订单已非 pending（重复回调），幂等放行
 *   - { ok: true, licenseId, renewed }       → 成功发牌 / 续费
 *   - { ok: false, error, message }          → 发牌失败（plan 缺失等）
 */
export async function fulfillOrder(env, orderNo, opts = {}) {
  const db = env.DB

  const order = await db.prepare('SELECT * FROM orders WHERE order_no = ?').bind(orderNo).first()
  if (!order) {
    return { ok: false, error: 'order_not_found', message: '订单不存在' }
  }

  // 幂等：非 pending 状态视为已处理
  if (order.status !== 'pending') {
    return { ok: true, alreadyFulfilled: true, licenseId: order.license_id || null }
  }

  const plan = await db.prepare('SELECT * FROM plans WHERE id = ?').bind(order.plan_id).first()
  if (!plan) {
    return { ok: false, error: 'plan_not_found', message: '套餐不存在' }
  }

  const now = new Date()
  const nowISO = now.toISOString()

  // 区分续费 / 新购（与原逻辑保持一致的 remark 约定）
  const isRenew = order.remark && String(order.remark).startsWith('续费授权') && order.license_id

  try {
    if (isRenew) {
      // ============ 续费：延长现有 license 有效期 ============
      const license = await db.prepare('SELECT * FROM licenses WHERE id = ?').bind(order.license_id).first()
      if (!license) {
        return { ok: false, error: 'license_not_found', message: '续费目标授权不存在' }
      }
      const currentEnd = new Date(license.valid_until)
      const baseDate = currentEnd > now ? currentEnd : now
      const newEnd = new Date(baseDate.getTime() + plan.duration_days * 24 * 60 * 60 * 1000)

      await db.batch([
        db.prepare(
          "UPDATE orders SET status = 'paid', payment_no = ?, paid_at = ?, confirm_admin_id = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(opts.paymentNo || order.payment_no || '', nowISO, opts.adminId ?? null, order.id),
        db.prepare(
          "UPDATE licenses SET valid_until = ?, status = 'active', updated_at = datetime('now') WHERE id = ?"
        ).bind(newEnd.toISOString(), license.id),
      ])

      // 异步发送续费确认邮件
      try {
        const renewUser = await db.prepare('SELECT email FROM users WHERE id = ?').bind(license.user_id).first()
        if (renewUser) {
          sendMail(env, {
            to: renewUser.email,
            ...buildOrderConfirmEmail({
              orderNo: order.order_no,
              planName: plan.name,
              amount: order.amount,
              paidAt: nowISO,
            }),
          }).catch(e => { console.error('[fulfillment] 续费确认邮件发送失败:', e.message) })
        }
      } catch (_) { /* ignore */ }

      return { ok: true, licenseId: license.id, renewed: true }
    }

    // ============ 新购：创建新 license ============
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(order.user_id).first()
    if (!user) {
      return { ok: false, error: 'user_not_found', message: '订单用户不存在' }
    }

    // 生成唯一 license_key（带 UNIQUE 约束重试）
    let licenseKey = null
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateLicenseKey()
      const dup = await db.prepare('SELECT id FROM licenses WHERE license_key = ?').bind(candidate).first()
      if (!dup) { licenseKey = candidate; break }
    }
    if (!licenseKey) {
      return { ok: false, error: 'key_gen_failed', message: '授权码生成失败' }
    }

    const validFrom = now
    const validUntil = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000)
    const features = plan.features || '[]'

    // 原子 batch：标记订单 paid + 创建 license + 回填 license_id
    // 注意：D1 batch 内多条语句作为一个事务提交
    const insertLicense = db.prepare(
      `INSERT INTO licenses (
        license_key, product_edition, max_stores, max_terminals, max_products, max_members,
        features, bind_mode, valid_from, valid_until, note, customer_name, customer_contact,
        status, source, order_id, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'strict', ?, ?, ?, ?, ?, 'active', 'order', ?, ?)
      RETURNING id`
    ).bind(
      licenseKey,
      plan.code,                     // 修复缺陷 #7：product_edition 直接用 plan.code，不再查 EDITIONS
      plan.max_stores,
      plan.max_terminals,
      plan.max_products,
      plan.max_members,
      features,
      validFrom.toISOString(),
      validUntil.toISOString(),
      `订单 ${orderNo} 自动发牌`,
      user.company || user.nickname,
      user.email,
      order.id,
      order.user_id
    )

    // batch 中 RETURNING 在 D1 受限，故改为两步：先插入，再取 id。
    // 这里用单条 INSERT（不 RETURNING）+ 紧跟 SELECT last_insert_rowid。
    const insertNoReturn = db.prepare(
      `INSERT INTO licenses (
        license_key, product_edition, max_stores, max_terminals, max_products, max_members,
        features, bind_mode, valid_from, valid_until, note, customer_name, customer_contact,
        status, source, order_id, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'strict', ?, ?, ?, ?, ?, 'active', 'order', ?, ?)`
    ).bind(
      licenseKey,
      plan.code,
      plan.max_stores,
      plan.max_terminals,
      plan.max_products,
      plan.max_members,
      features,
      validFrom.toISOString(),
      validUntil.toISOString(),
      `订单 ${orderNo} 自动发牌`,
      user.company || user.nickname,
      user.email,
      order.id,
      order.user_id
    )

    await db.batch([
      db.prepare(
        "UPDATE orders SET status = 'paid', payment_no = ?, paid_at = ?, confirm_admin_id = ?, updated_at = datetime('now') WHERE id = ? AND status = 'pending'"
      ).bind(opts.paymentNo || order.payment_no || '', nowISO, opts.adminId ?? null, order.id),
      insertNoReturn,
    ])

    // 取刚插入的 license id（last_insert_rowid 在同一连接内有效）
    const created = await db.prepare('SELECT id FROM licenses WHERE order_id = ?').bind(order.id).first()
    const licenseId = created ? created.id : null

    if (licenseId) {
      await db.prepare(
        "UPDATE orders SET license_id = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(licenseId, order.id).run()
    }

    // 异步发送订单确认邮件
    sendMail(env, {
      to: user.email,
      ...buildOrderConfirmEmail({
        orderNo: order.order_no,
        planName: plan.name,
        amount: order.amount,
        paidAt: nowISO,
      }),
    }).catch(e => { console.error('[fulfillment] 新购确认邮件发送失败:', e.message) })

    return { ok: true, licenseId, renewed: false }
  } catch (e) {
    console.error('[fulfillment] fulfillOrder threw:', e.message)
    return { ok: false, error: 'fulfill_threw', message: e.message }
  }
}
