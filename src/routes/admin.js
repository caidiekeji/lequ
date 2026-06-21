/**
 * 管理后台 API（需 JWT 认证 + RBAC 权限校验 + 审计日志）
 *
 * 修复缺陷 #8：原 RBAC 形同虚设 — 所有登录管理员权限等价。
 *   现在每个写操作挂 requirePermission(code)，读操作亦校验。
 *
 * 修复缺陷 #9：所有写操作落 admin_logs 审计日志（哈希链防篡改）。
 *
 * 权限点矩阵：
 *   GET  /users         [user:read]
 *   GET  /users/:id     [user:read]
 *   GET  /orders        [order:read]
 *   GET  /orders/stats  [order:read]
 *   GET  /orders/:id    [order:read]
 *   GET  /plans         [plan:read]
 *   GET  /plans/:id     [plan:read]
 *   POST /plans         [plan:create]
 *   PUT  /plans/:id     [plan:update]
 *   GET  /config        [config:system]
 *   PUT  /config        [config:system]
 *   GET  /admins        [admin:read]
 *   POST /admins        [admin:manage]
 *   DELETE /admins/:id  [admin:manage]
 *   GET  /logs          [audit:read]
 *   GET  /analytics     [analytics:read]
 */

import { Hono } from 'hono'
import { authenticate } from '../middleware/auth.js'
import { requirePermission } from '../middleware/rbac.js'
import { logAdminAction } from '../utils/audit.js'
import { hashPassword, generateLicenseKey } from '../utils.js'
import { fulfillOrderViaLock } from '../services/fulfillment.js'
import { sendMail } from '../services/email.js'

const router = new Hono()
router.use('*', authenticate)

// KV 缓存失效辅助（静默失败，无 KV 绑定时不处理）
async function invalidateCache(env, ...keys) {
  const kv = env.RATE_LIMIT
  if (!kv) return
  try { await Promise.all(keys.map(k => kv.delete(k).catch(() => {}))) } catch (_) { /* ignore */ }
}

// ==================== 用户管理 ====================

router.get('/users', requirePermission('user:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 20, keyword } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  let where = ''
  const params = []
  if (keyword) {
    where = 'WHERE email LIKE ? OR nickname LIKE ? OR phone LIKE ?'
    const kw = '%' + keyword + '%'
    params.push(kw, kw, kw)
  }

  const total = await db.prepare(`SELECT COUNT(*) as cnt FROM users ${where}`).bind(...params).first()
  const list = await db.prepare(
    `SELECT id, email, nickname, phone, company, status, last_login, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.get('/users/:id', requirePermission('user:read'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const user = await db.prepare(
    'SELECT id, email, nickname, phone, company, avatar_url, status, last_login, created_at FROM users WHERE id = ?'
  ).bind(id).first()
  if (!user) return c.json({ code: 40400, message: '用户不存在' }, 404)

  const licenses = await db.prepare(
    `SELECT l.id, l.license_key, l.product_edition, l.status, l.valid_until, l.created_at
     FROM licenses l INNER JOIN orders o ON o.license_id = l.id WHERE o.user_id = ? ORDER BY l.created_at DESC`
  ).bind(id).all()

  const orders = await db.prepare(
    `SELECT o.*, p.name as plan_name FROM orders o LEFT JOIN plans p ON o.plan_id = p.id WHERE o.user_id = ? ORDER BY o.created_at DESC LIMIT 20`
  ).bind(id).all()

  return c.json({ data: { ...user, licenses: licenses.results, orders: orders.results } })
})

router.put('/users/:id/status', requirePermission('user:write'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const { status } = await c.req.json()
  if (!status || !['active', 'disabled'].includes(status)) {
    return c.json({ code: 40000, message: '状态值不合法，仅支持 active/disabled' }, 400)
  }
  const user = await db.prepare('SELECT id, email, status as old_status FROM users WHERE id = ?').bind(id).first()
  if (!user) return c.json({ code: 40400, message: '用户不存在' }, 404)

  await db.prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(status, id).run()
  await logAdminAction(c, 'user.status', 'user', id, { before: user.old_status, after: status, email: user.email })
  return c.json({ message: '用户状态已更新' })
})

router.post('/users/:id/reset-password', requirePermission('user:write'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const user = await db.prepare('SELECT id, email FROM users WHERE id = ?').bind(id).first()
  if (!user) return c.json({ code: 40400, message: '用户不存在' }, 404)

  const newPassword = crypto.randomUUID().slice(0, 12)
  const passwordHash = await hashPassword(newPassword)
  await db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").bind(passwordHash, id).run()

  await logAdminAction(c, 'user.reset_password', 'user', id, { email: user.email })
  return c.json({ data: { new_password: newPassword, email: user.email }, message: '密码已重置' })
})

router.post('/users/:id/tags', requirePermission('user:tag'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const { tags } = await c.req.json()
  if (!Array.isArray(tags)) return c.json({ code: 40000, message: 'tags 必须为数组' }, 400)

  const user = await db.prepare('SELECT id, email FROM users WHERE id = ?').bind(id).first()
  if (!user) return c.json({ code: 40400, message: '用户不存在' }, 404)

  const tagsStr = JSON.stringify(tags)
  await db.prepare("UPDATE users SET tags = ?, updated_at = datetime('now') WHERE id = ?").bind(tagsStr, id).run()
  await logAdminAction(c, 'user.tag', 'user', id, { email: user.email, tags })
  return c.json({ message: '标签已设置', data: { tags } })
})

router.post('/users/batch', requirePermission('user:write'), async (c) => {
  const db = c.env.DB
  const { action, ids, tag } = await c.req.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return c.json({ code: 40000, message: 'ids 必须为非空数组' }, 400)
  }
  if (!['disable', 'enable', 'tag'].includes(action)) {
    return c.json({ code: 40000, message: 'action 不合法' }, 400)
  }
  if (action === 'tag' && !tag) {
    return c.json({ code: 40000, message: 'tag 操作需要提供 tag 参数' }, 400)
  }

  const placeholders = ids.map(() => '?').join(',')
  if (action === 'disable') {
    await db.prepare(`UPDATE users SET status = 'disabled', updated_at = datetime('now') WHERE id IN (${placeholders})`).bind(...ids).run()
  } else if (action === 'enable') {
    await db.prepare(`UPDATE users SET status = 'active', updated_at = datetime('now') WHERE id IN (${placeholders})`).bind(...ids).run()
  } else if (action === 'tag') {
    const tagStr = JSON.stringify([tag])
    await db.prepare(`UPDATE users SET tags = ?, updated_at = datetime('now') WHERE id IN (${placeholders})`).bind(tagStr, ...ids).run()
  }

  await logAdminAction(c, 'user.batch', 'user', null, { action, ids, tag })
  return c.json({ message: `批量操作成功：${action} ${ids.length} 个用户` })
})

router.get('/users/export', requirePermission('user:export'), async (c) => {
  const db = c.env.DB
  const list = await db.prepare(
    'SELECT id, email, nickname, phone, company, status, created_at, updated_at FROM users ORDER BY created_at DESC'
  ).all()

  const header = 'ID,Email,Nickname,Phone,Company,Status,CreatedAt,UpdatedAt\r\n'
  const rows = (list.results || []).map(u =>
    `${u.id},"${(u.email||'').replace(/"/g,'""')}","${(u.nickname||'').replace(/"/g,'""')}","${(u.phone||'').replace(/"/g,'""')}","${(u.company||'').replace(/"/g,'""')}",${u.status},${u.created_at},${u.updated_at}`
  ).join('\r\n')

  return new Response(header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="users.csv"',
    },
  })
})

// ==================== 订单管理 ====================

router.get('/orders', requirePermission('order:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 20, status, keyword } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  const conditions = []
  const params = []
  if (status) { conditions.push('o.status = ?'); params.push(status) }
  if (keyword) { conditions.push('(o.order_no LIKE ? OR u.email LIKE ?)'); params.push('%' + keyword + '%', '%' + keyword + '%') }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const total = await db.prepare(
    `SELECT COUNT(*) as cnt FROM orders o LEFT JOIN users u ON o.user_id = u.id ${where}`
  ).bind(...params).first()

  const list = await db.prepare(
    `SELECT o.*, p.name as plan_name, p.code as plan_code, u.email as user_email
     FROM orders o LEFT JOIN plans p ON o.plan_id = p.id LEFT JOIN users u ON o.user_id = u.id
     ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.get('/orders/stats', requirePermission('order:read'), async (c) => {
  const db = c.env.DB
  const total = await db.prepare('SELECT COUNT(*) as cnt, COALESCE(SUM(amount),0) as total_amount FROM orders').first()
  const paid = await db.prepare("SELECT COUNT(*) as cnt FROM orders WHERE status = 'paid'").first()
  const pending = await db.prepare("SELECT COUNT(*) as cnt FROM orders WHERE status = 'pending'").first()
  const today = await db.prepare("SELECT COUNT(*) as cnt, COALESCE(SUM(amount),0) as amount FROM orders WHERE date(created_at) = date('now')").first()

  return c.json({
    data: {
      totalOrders: total.cnt,
      totalAmount: total.total_amount,
      paidOrders: paid.cnt,
      pendingOrders: pending.cnt,
      todayOrders: today.cnt,
      todayAmount: today.amount,
    }
  })
})

router.get('/orders/:id', requirePermission('order:read'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const order = await db.prepare(
    `SELECT o.*, p.name as plan_name, p.code as plan_code, u.email as user_email, u.phone as user_phone
     FROM orders o LEFT JOIN plans p ON o.plan_id = p.id LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`
  ).bind(id).first()
  if (!order) return c.json({ code: 40400, message: '订单不存在' }, 404)
  return c.json({ data: order })
})

// 注意：POST /orders/:id/confirm 和 POST /orders/:id/cancel 已在 admin-payment.js 中定义
// 此处不再重复注册，避免 Hono 路由覆盖

router.put('/orders/:id/price', requirePermission('order:update-price'), async (c) => {
  const db = c.env.DB
  const orderId = parseInt(c.req.param('id'))
  const { price } = await c.req.json()

  const order = await db.prepare("SELECT * FROM orders WHERE id = ? AND status = 'pending'").bind(orderId).first()
  if (!order) {
    return c.json({ code: 40400, message: '订单不存在或已处理' }, 404)
  }

  const oldPrice = order.amount
  await db.prepare("UPDATE orders SET amount = ?, updated_at = datetime('now') WHERE id = ?").bind(price, orderId).run()

  await logAdminAction(c, 'order.update_price', 'order', orderId, {
    order_no: order.order_no,
    before: oldPrice,
    after: price,
  })

  return c.json({ message: '价格已更新' })
})

// 注意：POST /orders/:id/refund 已在 admin-payment.js 中定义
// 此处不再重复注册，避免 Hono 路由覆盖

router.get('/orders/export', requirePermission('order:export'), async (c) => {
  const db = c.env.DB
  const { status } = c.req.query()
  let where = ''
  const params = []
  if (status) { where = 'WHERE o.status = ?'; params.push(status) }

  const list = await db.prepare(
    `SELECT o.id, o.order_no, o.amount, o.status, o.payment_method, o.paid_at, o.created_at, u.email as user_email, p.name as plan_name
     FROM orders o LEFT JOIN users u ON o.user_id = u.id LEFT JOIN plans p ON o.plan_id = p.id ${where} ORDER BY o.created_at DESC`
  ).bind(...params).all()

  const header = 'ID,OrderNo,Amount,Status,PaymentMethod,PaidAt,CreatedAt,UserEmail,PlanName\r\n'
  const rows = (list.results || []).map(o =>
    `${o.id},"${o.order_no}",${o.amount},${o.status},"${o.payment_method||''}","${o.paid_at||''}","${o.created_at}","${(o.user_email||'').replace(/"/g,'""')}","${(o.plan_name||'').replace(/"/g,'""')}"`
  ).join('\r\n')

  return new Response(header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="orders.csv"',
    },
  })
})

router.get('/orders/reconcile', requirePermission('order:reconcile'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 20, date_start, date_end } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  const conditions = []
  const params = []
  if (date_start) { conditions.push('o.created_at >= ?'); params.push(date_start) }
  if (date_end) { conditions.push('o.created_at <= ?'); params.push(date_end) }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const total = await db.prepare(`SELECT COUNT(*) as cnt FROM orders o ${where}`).bind(...params).first()
  const list = await db.prepare(
    `SELECT o.id, o.order_no, o.amount, o.status, o.payment_method, o.created_at, o.paid_at, u.email as user_email
     FROM orders o LEFT JOIN users u ON o.user_id = u.id ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

// ==================== 套餐管理 ====================

router.get('/plans', requirePermission('plan:read'), async (c) => {
  const db = c.env.DB
  const kv = c.env.RATE_LIMIT
  const cacheKey = 'cache:plans:list'

  if (kv) {
    try {
      const cached = await kv.get(cacheKey)
      if (cached) return c.json({ data: JSON.parse(cached) })
    } catch (_) { /* ignore */ }
  }

  const list = await db.prepare('SELECT * FROM plans ORDER BY sort_order ASC').all()
  const data = list.results

  if (kv) {
    try { await kv.put(cacheKey, JSON.stringify(data), { expirationTtl: 600 }) } catch (_) { /* ignore */ }
  }

  return c.json({ data })
})

router.get('/plans/:id', requirePermission('plan:read'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const plan = await db.prepare('SELECT * FROM plans WHERE id = ?').bind(id).first()
  if (!plan) return c.json({ code: 40400, message: '套餐不存在' }, 404)
  return c.json({ data: plan })
})

router.post('/plans', requirePermission('plan:create'), async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { name, code, price, duration_days } = body
  if (!name || !code || !price || !duration_days) {
    return c.json({ code: 40000, message: '缺少必要参数' }, 400)
  }

  const exists = await db.prepare('SELECT id FROM plans WHERE code = ?').bind(code).first()
  if (exists) return c.json({ code: 40900, message: '套餐编码已存在' }, 409)

  const result = await db.prepare(
    `INSERT INTO plans (name, code, price, original_price, duration_days, max_stores, max_terminals, max_products, max_members, features, description, sort_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
  ).bind(
    name, code, price, body.original_price || 0, duration_days,
    body.max_stores || 1, body.max_terminals || 1, body.max_products || 5000, body.max_members || 2000,
    JSON.stringify(body.features || []), body.description || '', body.sort_order || 0
  ).run()

  await logAdminAction(c, 'plan.create', 'plan', result.meta?.last_row_id, { name, code, price })

  await invalidateCache(c.env, 'cache:plans:list')

  return c.json({ message: '套餐创建成功' })
})

router.put('/plans/:id', requirePermission('plan:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const plan = await db.prepare('SELECT * FROM plans WHERE id = ?').bind(id).first()
  if (!plan) return c.json({ code: 40400, message: '套餐不存在' }, 404)

  await db.prepare(
    `UPDATE plans SET name = COALESCE(?, name), price = COALESCE(?, price), original_price = COALESCE(?, original_price),
     duration_days = COALESCE(?, duration_days), max_stores = COALESCE(?, max_stores), max_terminals = COALESCE(?, max_terminals),
     max_products = COALESCE(?, max_products), max_members = COALESCE(?, max_members),
     features = COALESCE(?, features), description = COALESCE(?, description),
     updated_at = datetime('now') WHERE id = ?`
  ).bind(
    body.name ?? null, body.price ?? null, body.original_price ?? null,
    body.duration_days ?? null, body.max_stores ?? null, body.max_terminals ?? null,
    body.max_products ?? null, body.max_members ?? null,
    body.features ? JSON.stringify(body.features) : null, body.description ?? null, id
  ).run()

  await logAdminAction(c, 'plan.update', 'plan', id, {
    before: { name: plan.name, price: plan.price },
    after: { name: body.name || plan.name, price: body.price || plan.price },
  })

  await invalidateCache(c.env, 'cache:plans:list')

  return c.json({ message: '套餐更新成功' })
})

router.put('/plans/:id/status', requirePermission('plan:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const { status } = await c.req.json()
  if (!status || !['active', 'inactive'].includes(status)) {
    return c.json({ code: 40000, message: '状态值不合法，仅支持 active/inactive' }, 400)
  }

  const plan = await db.prepare('SELECT id, name, status as old_status FROM plans WHERE id = ?').bind(id).first()
  if (!plan) return c.json({ code: 40400, message: '套餐不存在' }, 404)

  await db.prepare("UPDATE plans SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(status, id).run()
  await logAdminAction(c, 'plan.status', 'plan', id, { name: plan.name, before: plan.old_status, after: status })
  await invalidateCache(c.env, 'cache:plans:list')
  return c.json({ message: status === 'active' ? '套餐已上架' : '套餐已下架' })
})

router.post('/plans/:id/versions', requirePermission('plan:update'), async (c) => {
  const db = c.env.DB
  const planId = parseInt(c.req.param('id'))
  const body = await c.req.json()
  const { price, duration_days } = body

  const plan = await db.prepare('SELECT id, name, code FROM plans WHERE id = ?').bind(planId).first()
  if (!plan) return c.json({ code: 40400, message: '套餐不存在' }, 404)

  const result = await db.prepare(
    "INSERT INTO plan_versions (plan_id, plan_code, plan_name, price, duration_days, note) VALUES (?, ?, ?, ?, ?, ?) RETURNING id"
  ).bind(planId, plan.code, plan.name, price, duration_days, body.note || '').first()

  await logAdminAction(c, 'plan.version', 'plan', planId, { plan_code: plan.code, price, duration_days })
  return c.json({ message: '价格版本已创建', data: { id: result?.id } })
})

router.get('/features', requirePermission('plan:read'), async (c) => {
  const db = c.env.DB
  const list = await db.prepare('SELECT * FROM features ORDER BY sort_order ASC, id ASC').all()
  return c.json({ data: list.results })
})

router.post('/features', requirePermission('plan:create'), async (c) => {
  const db = c.env.DB
  const { code, name, description, sort_order } = await c.req.json()
  if (!code || !name) return c.json({ code: 40000, message: 'code 和 name 不能为空' }, 400)

  const exists = await db.prepare('SELECT id FROM features WHERE code = ?').bind(code).first()
  if (exists) return c.json({ code: 40900, message: '功能编码已存在' }, 409)

  const result = await db.prepare(
    'INSERT INTO features (code, name, description, sort_order) VALUES (?, ?, ?, ?) RETURNING id'
  ).bind(code, name, description || '', sort_order || 0).first()

  await logAdminAction(c, 'feature.create', 'feature', result?.id, { code, name })
  return c.json({ message: '功能已创建' })
})

router.put('/features/:id', requirePermission('plan:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const feature = await db.prepare('SELECT * FROM features WHERE id = ?').bind(id).first()
  if (!feature) return c.json({ code: 40400, message: '功能不存在' }, 404)

  await db.prepare(
    "UPDATE features SET name = COALESCE(?, name), description = COALESCE(?, description), sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE id = ?"
  ).bind(body.name ?? null, body.description ?? null, body.sort_order ?? null, id).run()

  await logAdminAction(c, 'feature.update', 'feature', id, { before: { name: feature.name }, after: { name: body.name || feature.name } })
  return c.json({ message: '功能已更新' })
})

// ==================== 优惠券 ====================

router.get('/coupons', requirePermission('coupon:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 20, status } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  let where = ''
  const params = []
  if (status) { where = 'WHERE status = ?'; params.push(status) }

  const total = await db.prepare(`SELECT COUNT(*) as cnt FROM coupons ${where}`).bind(...params).first()
  const list = await db.prepare(
    `SELECT * FROM coupons ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.post('/coupons', requirePermission('coupon:create'), async (c) => {
  const db = c.env.DB
  const { code, type, value, min_amount, max_uses, valid_from, valid_until } = await c.req.json()
  if (!code || !type || value === undefined) {
    return c.json({ code: 40000, message: '缺少必要参数' }, 400)
  }

  const result = await db.prepare(
    `INSERT INTO coupons (code, type, value, min_amount, max_uses, valid_from, valid_until)
     VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
  ).bind(code, type, value, min_amount || 0, max_uses || 0, valid_from || null, valid_until || null).first()

  await logAdminAction(c, 'coupon.create', 'coupon', result?.id, { code, type, value })
  return c.json({ message: '优惠券已创建' })
})

router.put('/coupons/:id', requirePermission('coupon:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const coupon = await db.prepare('SELECT * FROM coupons WHERE id = ?').bind(id).first()
  if (!coupon) return c.json({ code: 40400, message: '优惠券不存在' }, 404)

  await db.prepare(
    `UPDATE coupons SET value = COALESCE(?, value), min_amount = COALESCE(?, min_amount),
     max_uses = COALESCE(?, max_uses), valid_from = COALESCE(?, valid_from), valid_until = COALESCE(?, valid_until),
     status = COALESCE(?, status), updated_at = datetime('now') WHERE id = ?`
  ).bind(
    body.value ?? null, body.min_amount ?? null, body.max_uses ?? null,
    body.valid_from ?? null, body.valid_until ?? null, body.status ?? null, id
  ).run()

  await logAdminAction(c, 'coupon.update', 'coupon', id, { code: coupon.code })
  return c.json({ message: '优惠券已更新' })
})

// ==================== 系统配置 ====================

router.get('/config', requirePermission('config:system'), async (c) => {
  const db = c.env.DB
  const row = await db.prepare("SELECT value FROM system_config WHERE key = 'system'").first()
  const config = row ? JSON.parse(row.value) : { site_name: 'ShouYinPOS', site_description: '', contact_email: '', contact_phone: '', icp_number: '' }
  return c.json({ data: config })
})

router.put('/config', requirePermission('config:system'), async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const existing = await db.prepare("SELECT id FROM system_config WHERE key = 'system'").first()
  if (existing) {
    await db.prepare("UPDATE system_config SET value = ?, updated_at = datetime('now') WHERE key = 'system'").bind(JSON.stringify(body)).run()
  } else {
    await db.prepare("INSERT INTO system_config (key, value) VALUES ('system', ?)").bind(JSON.stringify(body)).run()
  }

  await logAdminAction(c, 'config.system.update', 'config', null, { fields: Object.keys(body) })

  return c.json({ message: '配置已保存' })
})

// ==================== 管理员管理 ====================

router.get('/admins', requirePermission('admin:read'), async (c) => {
  const db = c.env.DB
  const list = await db.prepare('SELECT id, username, role, status, last_login, created_at FROM admins ORDER BY created_at DESC').all()
  return c.json({ data: list.results })
})

router.post('/admins', requirePermission('admin:manage'), async (c) => {
  const db = c.env.DB
  const { username, password, role } = await c.req.json()
  if (!username || !password) return c.json({ code: 40000, message: '用户名和密码不能为空' }, 400)

  const exists = await db.prepare('SELECT id FROM admins WHERE username = ?').bind(username).first()
  if (exists) return c.json({ code: 40900, message: '用户名已存在' }, 409)

  const passwordHash = await hashPassword(password)
  const result = await db.prepare("INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)")
    .bind(username, passwordHash, role || 'admin').run()

  await logAdminAction(c, 'admin.create', 'admin', result.meta?.last_row_id, { username, role: role || 'admin' })

  return c.json({ message: '管理员创建成功' })
})

router.put('/admins/:id', requirePermission('admin:manage'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const admin = await db.prepare('SELECT id, username, role FROM admins WHERE id = ?').bind(id).first()
  if (!admin) return c.json({ code: 40400, message: '管理员不存在' }, 404)
  if (admin.role === 'super_admin' && body.role && body.role !== 'super_admin') {
    return c.json({ code: 40300, message: '不能修改超级管理员的角色' }, 403)
  }

  // 原子化批量更新，避免部分失败导致数据不一致
  const batchOps = []
  if (body.password) {
    const passwordHash = await hashPassword(body.password)
    batchOps.push(db.prepare("UPDATE admins SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").bind(passwordHash, id))
  }
  if (body.role) {
    batchOps.push(db.prepare("UPDATE admins SET role = ?, updated_at = datetime('now') WHERE id = ?").bind(body.role, id))
  }
  if (body.status) {
    batchOps.push(db.prepare("UPDATE admins SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(body.status, id))
  }
  if (batchOps.length > 0) {
    await db.batch(batchOps)
  }

  await logAdminAction(c, 'admin.update', 'admin', id, { username: admin.username, changes: Object.keys(body) })
  return c.json({ message: '管理员已更新' })
})

router.delete('/admins/:id', requirePermission('admin:manage'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const admin = await db.prepare('SELECT id, username, role FROM admins WHERE id = ?').bind(id).first()
  if (!admin) return c.json({ code: 40400, message: '管理员不存在' }, 404)
  if (admin.role === 'super_admin') return c.json({ code: 40300, message: '不能删除超级管理员' }, 403)

  await db.prepare('DELETE FROM admins WHERE id = ?').bind(id).run()

  await logAdminAction(c, 'admin.delete', 'admin', id, { username: admin.username, role: admin.role })

  return c.json({ message: '管理员已删除' })
})

// ==================== 角色管理 ====================

router.get('/roles', requirePermission('role:read'), async (c) => {
  const db = c.env.DB
  const list = await db.prepare('SELECT * FROM roles ORDER BY created_at ASC').all()
  return c.json({ data: list.results })
})

router.post('/roles', requirePermission('role:create'), async (c) => {
  const db = c.env.DB
  const { name, code, description } = await c.req.json()
  if (!name || !code) return c.json({ code: 40000, message: 'name 和 code 不能为空' }, 400)

  const exists = await db.prepare('SELECT id FROM roles WHERE code = ?').bind(code).first()
  if (exists) return c.json({ code: 40900, message: '角色编码已存在' }, 409)

  const result = await db.prepare(
    'INSERT INTO roles (name, code, description) VALUES (?, ?, ?) RETURNING id'
  ).bind(name, code, description || '').first()

  await logAdminAction(c, 'role.create', 'role', result?.id, { name, code })
  return c.json({ message: '角色已创建' })
})

router.put('/roles/:id/permissions', requirePermission('role:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const { permission_ids } = await c.req.json()
  if (!Array.isArray(permission_ids)) return c.json({ code: 40000, message: 'permission_ids 必须为数组' }, 400)

  const role = await db.prepare('SELECT * FROM roles WHERE id = ?').bind(id).first()
  if (!role) return c.json({ code: 40400, message: '角色不存在' }, 404)

  await db.prepare('DELETE FROM role_permissions WHERE role_id = ?').bind(id).run()

  if (permission_ids.length > 0) {
    const stmt = db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)')
    const batchOps = permission_ids.map(pid => stmt.bind(id, pid))
    await db.batch(batchOps)
  }

  await logAdminAction(c, 'role.permissions', 'role', id, { role_code: role.code, permission_ids })
  return c.json({ message: '角色权限已更新' })
})

// ==================== 操作日志 ====================

router.get('/logs', requirePermission('audit:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 50 } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 50, 1), 100)
  const offset = (p - 1) * ps

  const total = await db.prepare('SELECT COUNT(*) as cnt FROM license_audit_logs').first()
  const list = await db.prepare(
    `SELECT l.*, li.store_name, lic.license_key
     FROM license_audit_logs l
     LEFT JOIN license_instances li ON l.instance_id = li.instance_id
     LEFT JOIN licenses lic ON l.license_id = lic.id
     ORDER BY l.created_at DESC LIMIT ? OFFSET ?`
  ).bind(ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.get('/logs/admin', requirePermission('audit:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 50 } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 50, 1), 100)
  const offset = (p - 1) * ps

  const total = await db.prepare('SELECT COUNT(*) as cnt FROM admin_logs').first()
  const list = await db.prepare(
    'SELECT * FROM admin_logs ORDER BY id DESC LIMIT ? OFFSET ?'
  ).bind(ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.get('/logs/login', requirePermission('audit:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 50 } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 50, 1), 100)
  const offset = (p - 1) * ps

  const total = await db.prepare('SELECT COUNT(*) as cnt FROM login_logs').first()
  const list = await db.prepare(
    'SELECT * FROM login_logs ORDER BY id DESC LIMIT ? OFFSET ?'
  ).bind(ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

// ==================== 数据分析 ====================

router.get('/analytics', requirePermission('analytics:read'), async (c) => {
  const db = c.env.DB

  const revenueByDay = await db.prepare(
    `SELECT date(paid_at) as date, COUNT(*) as orders, SUM(amount) as revenue
     FROM orders WHERE status = 'paid' AND paid_at >= datetime('now', '-30 days')
     GROUP BY date(paid_at) ORDER BY date ASC`
  ).all()

  const editionStats = await db.prepare(
    'SELECT product_edition, COUNT(*) as cnt FROM licenses GROUP BY product_edition ORDER BY cnt DESC'
  ).all()

  const recentActivations = await db.prepare(
    `SELECT date(activated_at) as date, COUNT(*) as cnt
     FROM license_instances WHERE activated_at >= datetime('now', '-30 days')
     GROUP BY date(activated_at) ORDER BY date ASC`
  ).all()

  // 访问统计
  const totalVisits = await db.prepare('SELECT COUNT(*) as cnt FROM site_visits').first()
  const todayVisits = await db.prepare("SELECT COUNT(*) as cnt FROM site_visits WHERE date(created_at) = date('now')").first()
  const weekVisits = await db.prepare("SELECT COUNT(*) as cnt FROM site_visits WHERE created_at >= datetime('now', '-7 days')").first()

  const visitsByDay = await db.prepare(
    `SELECT date(created_at) as date, COUNT(*) as visits, COUNT(DISTINCT ip) as uv
     FROM site_visits WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at) ORDER BY date ASC`
  ).all()

  const visitsByPage = await db.prepare(
    `SELECT path, COUNT(*) as visits, COUNT(DISTINCT ip) as uv
     FROM site_visits WHERE created_at >= datetime('now', '-7 days')
     GROUP BY path ORDER BY visits DESC LIMIT 10`
  ).all()

  const topReferers = await db.prepare(
    `SELECT referer, COUNT(*) as cnt FROM site_visits
     WHERE referer != '' AND created_at >= datetime('now', '-7 days')
     GROUP BY referer ORDER BY cnt DESC LIMIT 10`
  ).all()

  return c.json({
    data: {
      revenueByDay: revenueByDay.results,
      editionStats: editionStats.results,
      recentActivations: recentActivations.results,
      visits: {
        total: totalVisits.cnt,
        today: todayVisits.cnt,
        week: weekVisits.cnt,
        byDay: visitsByDay.results,
        byPage: visitsByPage.results,
        topReferers: topReferers.results,
      }
    }
  })
})

router.get('/analytics/revenue', requirePermission('analytics:read'), async (c) => {
  const db = c.env.DB
  const { date_start, date_end } = c.req.query()
  const startParam = date_start || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const endParam = date_end || new Date().toISOString().slice(0, 10)

  const byDay = await db.prepare(
    `SELECT date(paid_at) as date, COUNT(*) as orders, SUM(amount) as revenue
     FROM orders WHERE status = 'paid' AND date(paid_at) >= ? AND date(paid_at) <= ?
     GROUP BY date(paid_at) ORDER BY date ASC`
  ).bind(startParam, endParam).all()

  const byPlan = await db.prepare(
    `SELECT p.name as plan_name, COUNT(*) as orders, SUM(o.amount) as revenue
     FROM orders o LEFT JOIN plans p ON o.plan_id = p.id
     WHERE o.status = 'paid' AND date(o.paid_at) >= ? AND date(o.paid_at) <= ?
     GROUP BY o.plan_id ORDER BY revenue DESC`
  ).bind(startParam, endParam).all()

  const totalRevenue = await db.prepare(
    `SELECT COUNT(*) as total_orders, COALESCE(SUM(amount),0) as total_revenue
     FROM orders WHERE status = 'paid' AND date(paid_at) >= ? AND date(paid_at) <= ?`
  ).bind(startParam, endParam).first()

  return c.json({
    data: {
      totalOrders: totalRevenue.total_orders,
      totalRevenue: totalRevenue.total_revenue,
      byDay: byDay.results,
      byPlan: byPlan.results,
    }
  })
})

router.get('/analytics/users', requirePermission('analytics:read'), async (c) => {
  const db = c.env.DB
  const totalUsers = await db.prepare('SELECT COUNT(*) as cnt FROM users').first()
  const todayNew = await db.prepare("SELECT COUNT(*) as cnt FROM users WHERE date(created_at) = date('now')").first()
  const weekNew = await db.prepare("SELECT COUNT(*) as cnt FROM users WHERE created_at >= datetime('now', '-7 days')").first()

  const byDay = await db.prepare(
    `SELECT date(created_at) as date, COUNT(*) as cnt
     FROM users WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at) ORDER BY date ASC`
  ).all()

  return c.json({
    data: {
      totalUsers: totalUsers.cnt,
      todayNew: todayNew.cnt,
      weekNew: weekNew.cnt,
      byDay: byDay.results,
    }
  })
})

router.get('/analytics/licenses', requirePermission('analytics:read'), async (c) => {
  const db = c.env.DB
  const total = await db.prepare('SELECT COUNT(*) as cnt FROM licenses').first()
  const active = await db.prepare("SELECT COUNT(*) as cnt FROM licenses WHERE status = 'active'").first()
  const expired = await db.prepare("SELECT COUNT(*) as cnt FROM licenses WHERE status = 'expired'").first()
  const revoked = await db.prepare("SELECT COUNT(*) as cnt FROM licenses WHERE status = 'revoked'").first()

  const byEdition = await db.prepare(
    'SELECT product_edition, COUNT(*) as cnt FROM licenses GROUP BY product_edition ORDER BY cnt DESC'
  ).all()

  const byDay = await db.prepare(
    `SELECT date(created_at) as date, COUNT(*) as cnt
     FROM licenses WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at) ORDER BY date ASC`
  ).all()

  return c.json({
    data: {
      total: total.cnt,
      active: active.cnt,
      expired: expired.cnt,
      revoked: revoked.cnt,
      byEdition: byEdition.results,
      byDay: byDay.results,
    }
  })
})

router.get('/analytics/funnel', requirePermission('analytics:read'), async (c) => {
  const db = c.env.DB
  const totalUsers = await db.prepare('SELECT COUNT(*) as cnt FROM users').first()
  const createdOrders = await db.prepare('SELECT COUNT(DISTINCT user_id) as cnt FROM orders').first()
  const paidOrders = await db.prepare("SELECT COUNT(DISTINCT user_id) as cnt FROM orders WHERE status = 'paid'").first()
  const activated = await db.prepare('SELECT COUNT(DISTINCT license_id) as cnt FROM license_instances').first()

  return c.json({
    data: {
      steps: [
        { name: '注册用户', count: totalUsers.cnt },
        { name: '创建订单', count: createdOrders.cnt },
        { name: '完成支付', count: paidOrders.cnt },
        { name: '激活授权', count: activated.cnt },
      ],
    }
  })
})

router.get('/analytics/channel', requirePermission('analytics:read'), async (c) => {
  const db = c.env.DB
  const list = await db.prepare(
    'SELECT ch.name as channel_name, ch.code, COUNT(o.id) as order_count, COALESCE(SUM(o.amount),0) as revenue, COUNT(DISTINCT o.user_id) as user_count FROM channels ch LEFT JOIN orders o ON o.channel = ch.code GROUP BY ch.id ORDER BY revenue DESC'
  ).all()

  return c.json({ data: list.results })
})

router.get('/analytics/traffic', requirePermission('analytics:read'), async (c) => {
  const db = c.env.DB
  const byDay = await db.prepare(
    `SELECT date(created_at) as date, COUNT(*) as visits, COUNT(DISTINCT ip) as uv
     FROM site_visits WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at) ORDER BY date ASC`
  ).all()

  const byPage = await db.prepare(
    `SELECT path, COUNT(*) as visits, COUNT(DISTINCT ip) as uv
     FROM site_visits WHERE created_at >= datetime('now', '-7 days')
     GROUP BY path ORDER BY visits DESC LIMIT 10`
  ).all()

  const topReferers = await db.prepare(
    `SELECT referer, COUNT(*) as cnt FROM site_visits
     WHERE referer IS NOT NULL AND referer != '' AND created_at >= datetime('now', '-7 days')
     GROUP BY referer ORDER BY cnt DESC LIMIT 10`
  ).all()

  return c.json({
    data: {
      byDay: byDay.results,
      byPage: byPage.results,
      topReferers: topReferers.results,
    }
  })
})

// ==================== 仪表盘 ====================

router.get('/dashboard/summary', requirePermission('dashboard:read'), async (c) => {
  const db = c.env.DB
  const kv = c.env.RATE_LIMIT
  const cacheKey = 'cache:dashboard:summary'

  // KV 缓存（5分钟），减少 D1 查询
  if (kv) {
    try {
      const cached = await kv.get(cacheKey)
      if (cached) return c.json({ data: JSON.parse(cached) })
    } catch (_) { /* ignore */ }
  }

  const todayGMV = await db.prepare(
    "SELECT COALESCE(SUM(amount),0) as amount, COUNT(*) as orders FROM orders WHERE status = 'paid' AND date(paid_at) = date('now')"
  ).first()

  const todayNewUsers = await db.prepare(
    "SELECT COUNT(*) as cnt FROM users WHERE date(created_at) = date('now')"
  ).first()

  const todayNewLicenses = await db.prepare(
    "SELECT COUNT(*) as cnt FROM licenses WHERE date(created_at) = date('now')"
  ).first()

  const activeInstances = await db.prepare(
    "SELECT COUNT(*) as cnt FROM license_instances WHERE status = 'active'"
  ).first()

  const data = {
    todayGMV: todayGMV.amount,
    todayOrders: todayGMV.orders,
    todayNewUsers: todayNewUsers.cnt,
    todayNewLicenses: todayNewLicenses.cnt,
    activeInstances: activeInstances.cnt,
  }

  if (kv) {
    try { await kv.put(cacheKey, JSON.stringify(data), { expirationTtl: 300 }) } catch (_) { /* ignore */ }
  }

  return c.json({ data })
})

router.get('/dashboard/trends', requirePermission('dashboard:read'), async (c) => {
  const db = c.env.DB

  const gmvTrend = await db.prepare(
    `SELECT date(paid_at) as date, COALESCE(SUM(amount),0) as value
     FROM orders WHERE status = 'paid' AND paid_at >= datetime('now', '-30 days')
     GROUP BY date(paid_at) ORDER BY date ASC`
  ).all()

  const userTrend = await db.prepare(
    `SELECT date(created_at) as date, COUNT(*) as value
     FROM users WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at) ORDER BY date ASC`
  ).all()

  const licenseTrend = await db.prepare(
    `SELECT date(created_at) as date, COUNT(*) as value
     FROM licenses WHERE created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at) ORDER BY date ASC`
  ).all()

  return c.json({
    data: {
      gmv: gmvTrend.results,
      users: userTrend.results,
      licenses: licenseTrend.results,
    }
  })
})

router.get('/dashboard/todos', requirePermission('dashboard:read'), async (c) => {
  const db = c.env.DB

  // 待确认收款（pending 状态的 manual 订单超过2小时）
  const pendingConfirm = await db.prepare(
    "SELECT COUNT(*) as cnt FROM orders WHERE status = 'pending' AND payment_method = 'manual' AND created_at <= datetime('now', '-2 hours')"
  ).first()

  // 即将到期（7天内）
  const expiringSoon = await db.prepare(
    "SELECT COUNT(*) as cnt FROM licenses WHERE status = 'active' AND valid_until BETWEEN datetime('now') AND datetime('now', '+7 days')"
  ).first()

  // 心跳异常（超过5分钟未上报）
  const heartbeatAnomaly = await db.prepare(
    "SELECT COUNT(*) as cnt FROM license_instances WHERE status = 'active' AND last_heartbeat <= datetime('now', '-5 minutes')"
  ).first()

  return c.json({
    data: {
      pendingConfirm: pendingConfirm.cnt,
      expiringSoon: expiringSoon.cnt,
      heartbeatAnomaly: heartbeatAnomaly.cnt,
    }
  })
})

// ==================== 发票管理 ====================

router.get('/invoices', requirePermission('invoice:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 20, status } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  let where = ''
  const params = []
  if (status) { where = 'WHERE status = ?'; params.push(status) }

  const total = await db.prepare(`SELECT COUNT(*) as cnt FROM invoices ${where}`).bind(...params).first()
  const list = await db.prepare(
    `SELECT i.*, u.email as user_email FROM invoices i LEFT JOIN users u ON i.user_id = u.id ${where} ORDER BY i.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.put('/invoices/:id', requirePermission('invoice:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const invoice = await db.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first()
  if (!invoice) return c.json({ code: 40400, message: '发票不存在' }, 404)

  await db.prepare(
    "UPDATE invoices SET status = COALESCE(?, status), invoice_no = COALESCE(?, invoice_no), remark = COALESCE(?, remark), updated_at = datetime('now') WHERE id = ?"
  ).bind(body.status ?? null, body.invoice_no ?? null, body.remark ?? null, id).run()

  await logAdminAction(c, 'invoice.update', 'invoice', id, { before_status: invoice.status, after_status: body.status || invoice.status })
  return c.json({ message: '发票已更新' })
})

// ==================== 授权管理 ====================

router.post('/licenses/batch', requirePermission('license:create'), async (c) => {
  const db = c.env.DB
  const { plan_id, count, valid_days } = await c.req.json()
  if (!plan_id || !count || !valid_days) {
    return c.json({ code: 40000, message: '缺少必要参数' }, 400)
  }
  if (count < 1 || count > 100) {
    return c.json({ code: 40000, message: '批量生成数量范围为 1-100' }, 400)
  }

  const plan = await db.prepare('SELECT * FROM plans WHERE id = ?').bind(plan_id).first()
  if (!plan) return c.json({ code: 40400, message: '套餐不存在' }, 404)

  const created = []
  for (let i = 0; i < count; i++) {
    let licenseKey = null
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateLicenseKey()
      const dup = await db.prepare('SELECT id FROM licenses WHERE license_key = ?').bind(candidate).first()
      if (!dup) { licenseKey = candidate; break }
    }
    if (!licenseKey) continue

    const result = await db.prepare(
      `INSERT INTO licenses (license_key, product_edition, max_stores, max_terminals, max_products, max_members, features, bind_mode, valid_from, valid_until, note, customer_name, customer_contact, status, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'strict', datetime('now'), datetime('now', '+' || ? || ' days'), ?, ?, ?, 'active', 'manual') RETURNING id`
    ).bind(
      licenseKey, plan.code, plan.max_stores, plan.max_terminals,
      plan.max_products, plan.max_members, plan.features,
      valid_days, '', '', ''
    ).first()

    created.push({ id: result?.id, license_key: licenseKey })
  }

  await logAdminAction(c, 'license.batch_create', 'license', null, { plan_id, plan_code: plan.code, count, valid_days, created: created.length })
  return c.json({ message: `成功生成 ${created.length} 个授权码`, data: { created } })
})

router.put('/licenses/:id/extend', requirePermission('license:extend'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const { days, reason } = await c.req.json()
  if (!days || days < 1) return c.json({ code: 40000, message: '延长天数必须大于0' }, 400)

  const lic = await db.prepare('SELECT * FROM licenses WHERE id = ?').bind(id).first()
  if (!lic) return c.json({ code: 40400, message: '授权码不存在' }, 404)

  const currentEnd = new Date(lic.valid_until)
  const now = new Date()
  const baseDate = currentEnd > now ? currentEnd : now
  const newEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)

  await db.prepare(
    "UPDATE licenses SET valid_until = ?, status = 'active', updated_at = datetime('now') WHERE id = ?"
  ).bind(newEnd.toISOString(), id).run()

  await logAdminAction(c, 'license.extend', 'license', id, {
    license_key: lic.license_key,
    old_valid_until: lic.valid_until,
    new_valid_until: newEnd.toISOString(),
    days_added: days,
    reason: reason || '',
  })

  return c.json({ message: '有效期已延长', data: { valid_until: newEnd.toISOString() } })
})

router.post('/licenses/:id/upgrade', requirePermission('license:upgrade'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const { plan_id, price_diff } = await c.req.json()

  const lic = await db.prepare('SELECT * FROM licenses WHERE id = ?').bind(id).first()
  if (!lic) return c.json({ code: 40400, message: '授权码不存在' }, 404)

  const newPlan = await db.prepare('SELECT * FROM plans WHERE id = ?').bind(plan_id).first()
  if (!newPlan) return c.json({ code: 40400, message: '目标套餐不存在' }, 404)

  await db.prepare(
    `UPDATE licenses SET product_edition = ?, max_stores = ?, max_terminals = ?, max_products = ?, max_members = ?, features = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(
    newPlan.code, newPlan.max_stores, newPlan.max_terminals,
    newPlan.max_products, newPlan.max_members, newPlan.features, id
  ).run()

  await logAdminAction(c, 'license.upgrade', 'license', id, {
    license_key: lic.license_key,
    old_edition: lic.product_edition,
    new_edition: newPlan.code,
    price_diff: price_diff || 0,
  })

  return c.json({ message: '授权已升级', data: { product_edition: newPlan.code } })
})

// ==================== 实例管理 ====================

router.get('/instances', requirePermission('instance:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 20, status } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  let where = ''
  const params = []
  if (status) { where = 'WHERE li.status = ?'; params.push(status) }

  const total = await db.prepare(
    `SELECT COUNT(*) as cnt FROM license_instances li ${where}`
  ).bind(...params).first()

  const list = await db.prepare(
    `SELECT li.*, l.license_key, l.product_edition, l.valid_until, l.status as license_status,
     CASE WHEN li.last_heartbeat <= datetime('now', '-5 minutes') THEN 'abnormal' ELSE 'normal' END as heartbeat_status
     FROM license_instances li LEFT JOIN licenses l ON li.license_id = l.id
     ${where} ORDER BY li.last_heartbeat DESC NULLS LAST, li.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.post('/instances/:id/kick', requirePermission('instance:kick'), async (c) => {
  const db = c.env.DB
  const { instance_id } = await c.req.json()
  const id = c.req.param('id')

  const instanceId = instance_id || id
  const inst = await db.prepare('SELECT * FROM license_instances WHERE instance_id = ?').bind(instanceId).first()
  if (!inst) return c.json({ code: 40400, message: '实例不存在' }, 404)

  await db.prepare("UPDATE license_instances SET status = 'kicked', updated_at = datetime('now') WHERE instance_id = ?").bind(instanceId).run()

  await logAdminAction(c, 'instance.kick', 'instance', inst.license_id, {
    instance_id: instanceId,
    store_name: inst.store_name,
  })

  return c.json({ message: '实例已强制下线' })
})

// ==================== 授权策略 ====================

router.get('/license-policies', requirePermission('policy:read'), async (c) => {
  const db = c.env.DB
  const list = await db.prepare('SELECT * FROM license_policies ORDER BY created_at DESC').all()
  return c.json({ data: list.results })
})

router.put('/license-policies/:id', requirePermission('policy:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const policy = await db.prepare('SELECT * FROM license_policies WHERE id = ?').bind(id).first()
  if (!policy) return c.json({ code: 40400, message: '策略不存在' }, 404)

  const updateFields = []
  const params = []
  for (const key of ['max_instances', 'bind_mode', 'heartbeat_interval', 'max_kick_count', 'allowed_domains', 'allowed_ips', 'note']) {
    if (body[key] !== undefined) {
      updateFields.push(`${key} = ?`)
      params.push(typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key])
    }
  }
  if (updateFields.length === 0) return c.json({ code: 40000, message: '没有需要更新的字段' }, 400)

  params.push(id)
  await db.prepare(`UPDATE license_policies SET ${updateFields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).bind(...params).run()

  await logAdminAction(c, 'policy.update', 'policy', id, { before: { note: policy.note }, changes: Object.keys(body) })
  return c.json({ message: '策略已更新' })
})

// ==================== 运营管理 ====================

router.get('/notices', requirePermission('notice:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 20 } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  const total = await db.prepare('SELECT COUNT(*) as cnt FROM notices').first()
  const list = await db.prepare(
    'SELECT * FROM notices ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?'
  ).bind(ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.post('/notices', requirePermission('notice:create'), async (c) => {
  const db = c.env.DB
  const { title, content, type, sort_order } = await c.req.json()
  if (!title || !content) return c.json({ code: 40000, message: '标题和内容不能为空' }, 400)

  const result = await db.prepare(
    'INSERT INTO notices (title, content, type, sort_order) VALUES (?, ?, ?, ?) RETURNING id'
  ).bind(title, content, type || 'info', sort_order || 0).first()

  await logAdminAction(c, 'notice.create', 'notice', result?.id, { title, type })
  return c.json({ message: '公告已创建' })
})

router.put('/notices/:id', requirePermission('notice:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const { title, content, type, status, sort_order } = await c.req.json()

  const notice = await db.prepare('SELECT * FROM notices WHERE id = ?').bind(id).first()
  if (!notice) return c.json({ code: 40400, message: '公告不存在' }, 404)

  await db.prepare(
    "UPDATE notices SET title = COALESCE(?, title), content = COALESCE(?, content), type = COALESCE(?, type), status = COALESCE(?, status), sort_order = COALESCE(?, sort_order), updated_at = datetime('now') WHERE id = ?"
  ).bind(title ?? null, content ?? null, type ?? null, status ?? null, sort_order ?? null, id).run()

  await logAdminAction(c, 'notice.update', 'notice', id, { before: { title: notice.title }, after: { title: title || notice.title } })
  return c.json({ message: '公告已更新' })
})

// ==================== 通知模板 ====================

router.get('/notify-templates', requirePermission('notify:read'), async (c) => {
  const db = c.env.DB
  const list = await db.prepare('SELECT * FROM notify_templates ORDER BY created_at DESC').all()
  return c.json({ data: list.results })
})

router.put('/notify-templates/:id', requirePermission('notify:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const tpl = await db.prepare('SELECT * FROM notify_templates WHERE id = ?').bind(id).first()
  if (!tpl) return c.json({ code: 40400, message: '模板不存在' }, 404)

  await db.prepare(
    "UPDATE notify_templates SET subject = COALESCE(?, subject), content = COALESCE(?, content), updated_at = datetime('now') WHERE id = ?"
  ).bind(body.subject ?? null, body.content ?? null, id).run()

  await logAdminAction(c, 'notify_template.update', 'notify_template', id, { changes: Object.keys(body) })
  return c.json({ message: '模板已更新' })
})

// ==================== 工单管理 ====================

router.get('/tickets', requirePermission('ticket:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 20, status } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  let where = ''
  const params = []
  if (status) { where = 'WHERE status = ?'; params.push(status) }

  const total = await db.prepare(`SELECT COUNT(*) as cnt FROM tickets ${where}`).bind(...params).first()
  const list = await db.prepare(
    `SELECT t.*, u.email as user_email FROM tickets t LEFT JOIN users u ON t.user_id = u.id ${where} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.post('/tickets/:id/reply', requirePermission('ticket:reply'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const admin = c.get('admin')
  const { content } = await c.req.json()
  if (!content) return c.json({ code: 40000, message: '回复内容不能为空' }, 400)

  const ticket = await db.prepare('SELECT * FROM tickets WHERE id = ?').bind(id).first()
  if (!ticket) return c.json({ code: 40400, message: '工单不存在' }, 404)

  await db.prepare(
    "INSERT INTO ticket_replies (ticket_id, admin_id, admin_username, content) VALUES (?, ?, ?, ?)"
  ).bind(id, admin.id, admin.username, content).run()

  await db.prepare("UPDATE tickets SET status = 'replied', updated_at = datetime('now') WHERE id = ?").bind(id).run()

  await logAdminAction(c, 'ticket.reply', 'ticket', id, { content_length: content.length })
  return c.json({ message: '回复成功' })
})

// ==================== 渠道管理 ====================

router.get('/channels', requirePermission('channel:read'), async (c) => {
  const db = c.env.DB
  const list = await db.prepare('SELECT * FROM channels ORDER BY created_at DESC').all()
  return c.json({ data: list.results })
})

router.post('/channels', requirePermission('channel:create'), async (c) => {
  const db = c.env.DB
  const { name, code, commission_rate, note } = await c.req.json()
  if (!name || !code) return c.json({ code: 40000, message: 'name 和 code 不能为空' }, 400)

  const exists = await db.prepare('SELECT id FROM channels WHERE code = ?').bind(code).first()
  if (exists) return c.json({ code: 40900, message: '渠道编码已存在' }, 409)

  const result = await db.prepare(
    'INSERT INTO channels (name, code, commission_rate, note) VALUES (?, ?, ?, ?) RETURNING id'
  ).bind(name, code, commission_rate || 0, note || '').first()

  await logAdminAction(c, 'channel.create', 'channel', result?.id, { name, code })
  return c.json({ message: '渠道已创建' })
})

router.put('/channels/:id', requirePermission('channel:update'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const { name, commission_rate, status, note } = await c.req.json()

  const channel = await db.prepare('SELECT * FROM channels WHERE id = ?').bind(id).first()
  if (!channel) return c.json({ code: 40400, message: '渠道不存在' }, 404)

  await db.prepare(
    "UPDATE channels SET name = COALESCE(?, name), commission_rate = COALESCE(?, commission_rate), status = COALESCE(?, status), note = COALESCE(?, note), updated_at = datetime('now') WHERE id = ?"
  ).bind(name ?? null, commission_rate ?? null, status ?? null, note ?? null, id).run()

  await logAdminAction(c, 'channel.update', 'channel', id, { changes: Object.keys({ name, commission_rate, status, note }) })
  return c.json({ message: '渠道已更新' })
})

router.get('/commissions', requirePermission('commission:read'), async (c) => {
  const db = c.env.DB
  const { page = 1, pageSize = 20, status } = c.req.query()
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  let where = ''
  const params = []
  if (status) { where = 'WHERE c.status = ?'; params.push(status) }

  const total = await db.prepare(`SELECT COUNT(*) as cnt FROM commissions c ${where}`).bind(...params).first()
  const list = await db.prepare(
    `SELECT c.*, ch.name as channel_name FROM commissions c LEFT JOIN channels ch ON c.channel_id = ch.id ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()

  return c.json({ data: { list: list.results, total: total.cnt, page: p, pageSize: ps } })
})

router.post('/commissions/:id/settle', requirePermission('commission:settle'), async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))

  const commission = await db.prepare("SELECT * FROM commissions WHERE id = ? AND status = 'pending'").bind(id).first()
  if (!commission) return c.json({ code: 40400, message: '佣金记录不存在或已结算' }, 404)

  await db.prepare("UPDATE commissions SET status = 'settled', settled_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").bind(id).run()

  await logAdminAction(c, 'commission.settle', 'commission', id, { channel_id: commission.channel_id, amount: commission.amount })
  return c.json({ message: '佣金已结算' })
})

// ==================== 基础设施 - 支付配置 ====================

router.get('/config/payment', requirePermission('config:payment'), async (c) => {
  const db = c.env.DB
  const row = await db.prepare("SELECT value FROM system_config WHERE key = 'payment_config'").first()
  const config = row ? JSON.parse(row.value) : {}
  return c.json({ data: config })
})

router.put('/config/payment', requirePermission('config:payment'), async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const existing = await db.prepare("SELECT id FROM system_config WHERE key = 'payment_config'").first()
  if (existing) {
    await db.prepare("UPDATE system_config SET value = ?, updated_at = datetime('now') WHERE key = 'payment_config'").bind(JSON.stringify(body)).run()
  } else {
    await db.prepare("INSERT INTO system_config (key, value) VALUES ('payment_config', ?)").bind(JSON.stringify(body)).run()
  }
  await logAdminAction(c, 'config.payment.update', 'config', null, { fields: Object.keys(body) })
  return c.json({ message: '支付配置已保存' })
})

// ==================== 基础设施 - 通知配置 ====================

router.get('/config/notify', requirePermission('config:notify'), async (c) => {
  const db = c.env.DB
  const row = await db.prepare("SELECT value FROM system_config WHERE key = 'notify_config'").first()
  const config = row ? JSON.parse(row.value) : {}
  return c.json({ data: config })
})

router.put('/config/notify', requirePermission('config:notify'), async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const existing = await db.prepare("SELECT id FROM system_config WHERE key = 'notify_config'").first()
  if (existing) {
    await db.prepare("UPDATE system_config SET value = ?, updated_at = datetime('now') WHERE key = 'notify_config'").bind(JSON.stringify(body)).run()
  } else {
    await db.prepare("INSERT INTO system_config (key, value) VALUES ('notify_config', ?)").bind(JSON.stringify(body)).run()
  }
  await logAdminAction(c, 'config.notify.update', 'config', null, { fields: Object.keys(body) })
  return c.json({ message: '通知配置已保存' })
})

// 测试发送通知
router.post('/config/notify/test', requirePermission('config:notify'), async (c) => {
  const { email } = await c.req.json()
  if (!email) return c.json({ code: 40000, message: '请输入测试邮箱' }, 400)

  const result = await sendMail(c.env, {
    to: email,
    subject: 'ShouYinPOS 通知配置测试',
    htmlContent: '<h2>测试邮件</h2><p>如果您收到此邮件，说明通知配置正确。</p><p>发送时间: ' + new Date().toLocaleString() + '</p>',
  })

  if (result.success) return c.json({ message: '测试邮件已发送，请查收' })
  return c.json({ code: 50000, message: result.error || '发送失败' }, 500)
})

// ==================== 基础设施 - 系统监控 ====================

router.get('/system/monitor', requirePermission('system:monitor'), async (c) => {
  const db = c.env.DB

  const dbSize = await db.prepare("SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table'").first()
  const totalUsers = await db.prepare('SELECT COUNT(*) as cnt FROM users').first()
  const totalOrders = await db.prepare('SELECT COUNT(*) as cnt FROM orders').first()
  const totalLicenses = await db.prepare('SELECT COUNT(*) as cnt FROM licenses').first()
  const totalAdmins = await db.prepare('SELECT COUNT(*) as cnt FROM admins').first()

  return c.json({
    data: {
      tables: dbSize.table_count,
      totalUsers: totalUsers.cnt,
      totalOrders: totalOrders.cnt,
      totalLicenses: totalLicenses.cnt,
      totalAdmins: totalAdmins.cnt,
      timestamp: new Date().toISOString(),
    }
  })
})

export default router