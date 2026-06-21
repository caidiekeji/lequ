/**
 * 管理后台 - 支付配置和订单操作路由
 *
 * 修复缺陷 #8：加入 requirePermission 校验
 * 修复缺陷 #9：所有写操作落 admin_logs 审计日志
 *
 * GET  /api/admin/payment-config      [config:payment]
 * PUT  /api/admin/payment-config      [config:payment]
 * POST /api/admin/orders/:id/confirm  [order:confirm]
 * POST /api/admin/orders/:id/cancel   [order:cancel]
 */

import { Hono } from 'hono'
import { authenticate } from '../middleware/auth.js'
import { requirePermission } from '../middleware/rbac.js'
import { fulfillOrderViaLock } from '../services/fulfillment.js'
import { logAdminAction } from '../utils/audit.js'

const router = new Hono()
router.use('*', authenticate)

function generateRefundNo() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `REF${y}${m}${d}${h}${mi}${s}${rand}`
}

// 支付配置存储在 D1 的 system_config 表中
const CONFIG_KEY = 'payment_config'

const defaultConfig = {
  wechat_enabled: false,
  alipay_enabled: false,
  unionpay_enabled: false,
  manual_enabled: true,
  callback_domain: 'https://www.lequ.pw',
  wechat_mch_id: '',
  wechat_api_key: '',
  wechat_app_id: '',
  wechat_cert_serial: '',
  wechat_private_key: '',
  alipay_app_id: '',
  alipay_private_key: '',
  alipay_public_key: '',
  alipay_sign_type: 'RSA2',
  unionpay_mch_id: '',
  unionpay_cert_serial: '',
  unionpay_private_key: '',
  unionpay_public_key: '',
  unionpay_env: 'sandbox',
  unionpay_return_url: '',
  manual_payment_info: '',
  manual_expire_hours: 24,
}

router.get('/payment-config', requirePermission('config:payment'), async (c) => {
  const db = c.env.DB
  const row = await db.prepare('SELECT value FROM system_config WHERE key = ?').bind(CONFIG_KEY).first()
  const config = row ? JSON.parse(row.value) : defaultConfig
  return c.json({ data: config })
})

router.put('/payment-config', requirePermission('config:payment'), async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const config = { ...defaultConfig, ...body }

  const existing = await db.prepare('SELECT id FROM system_config WHERE key = ?').bind(CONFIG_KEY).first()
  if (existing) {
    await db.prepare('UPDATE system_config SET value = ?, updated_at = datetime(\'now\') WHERE key = ?')
      .bind(JSON.stringify(config), CONFIG_KEY).run()
  } else {
    await db.prepare('INSERT INTO system_config (key, value) VALUES (?, ?)')
      .bind(CONFIG_KEY, JSON.stringify(config)).run()
  }

  await logAdminAction(c, 'config.payment.update', 'config', null, {
    fields: Object.keys(body),
  })

  return c.json({ message: '支付配置已保存' })
})

router.post('/orders/:id/confirm', requirePermission('order:confirm'), async (c) => {
  const db = c.env.DB
  const orderId = parseInt(c.req.param('id'))
  const admin = c.get('admin')

  const order = await db.prepare("SELECT * FROM orders WHERE id = ? AND status = 'pending'").bind(orderId).first()
  if (!order) {
    return c.json({ code: 40400, message: '订单不存在或已处理' }, 404)
  }

  // 使用 fulfillOrderViaLock 统一发牌（修复缺陷 #6，不再重复发牌逻辑）
  const result = await fulfillOrderViaLock(c.env, order.order_no, { adminId: admin.id })

  if (!result.ok) {
    return c.json({ code: 50000, message: result.message || '发牌失败' }, 500)
  }

  await logAdminAction(c, 'order.confirm', 'order', orderId, {
    order_no: order.order_no,
    amount: order.amount,
    plan_id: order.plan_id,
    license_id: result.licenseId,
  })

  return c.json({ message: '已确认收款，授权码已分配', license_id: result.licenseId })
})

router.post('/orders/:id/cancel', requirePermission('order:cancel'), async (c) => {
  const db = c.env.DB
  const orderId = parseInt(c.req.param('id'))

  const order = await db.prepare("SELECT * FROM orders WHERE id = ? AND status = 'pending'").bind(orderId).first()
  if (!order) {
    return c.json({ code: 40400, message: '订单不存在或已处理' }, 404)
  }

  await db.prepare("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?")
    .bind(orderId).run()

  await logAdminAction(c, 'order.cancel', 'order', orderId, {
    order_no: order.order_no,
    amount: order.amount,
  })

  return c.json({ message: '订单已取消' })
})

/**
 * 退款
 * POST /admin/orders/:id/refund - 创建退款单（全额退款时自动吊销关联 license）
 */
router.post('/orders/:id/refund', requirePermission('order:refund'), async (c) => {
  const db = c.env.DB
  const admin = c.get('admin')
  const orderId = parseInt(c.req.param('id'))

  const order = await db.prepare("SELECT * FROM orders WHERE id = ? AND status = 'paid'").bind(orderId).first()
  if (!order) {
    return c.json({ code: 40400, message: '订单不存在或未支付' }, 404)
  }

  // 生成退款单号
  const refundNo = generateRefundNo()
  const now = new Date().toISOString()

  // 创建退款记录并更新订单状态
  await db.batch([
    db.prepare(
      `INSERT INTO refunds (order_id, refund_no, amount, reason, status, operator_id, operated_at)
       VALUES (?, ?, ?, ?, 'success', ?, ?)`
    ).bind(orderId, refundNo, order.amount, '全额退款', admin.id, now),
    db.prepare(
      "UPDATE orders SET status = 'refunded', updated_at = datetime('now') WHERE id = ?"
    ).bind(orderId),
  ])

  // 全额退款自动吊销关联 license
  let revokedLicenseId = null
  if (order.license_id) {
    const lic = await db.prepare('SELECT * FROM licenses WHERE id = ? AND status = ?').bind(order.license_id, 'active').first()
    if (lic) {
      await db.batch([
        db.prepare("UPDATE licenses SET status = 'revoked', updated_at = datetime('now') WHERE id = ?").bind(lic.id),
        db.prepare("UPDATE license_instances SET status = 'revoked', updated_at = datetime('now') WHERE license_id = ?").bind(lic.id),
      ])
      revokedLicenseId = lic.id
    }
  }

  await logAdminAction(c, 'order.refund', 'order', orderId, {
    order_no: order.order_no,
    refund_no: refundNo,
    amount: order.amount,
    license_id: revokedLicenseId,
  })

  return c.json({
    message: '退款成功',
    data: { refund_no: refundNo, license_revoked: !!revokedLicenseId },
  })
})

export default router
