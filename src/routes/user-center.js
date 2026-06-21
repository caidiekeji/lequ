/**
 * 用户中心路由
 * GET /api/my/licenses        - 我的授权列表（需登录）
 * GET /api/my/licenses/:id    - 授权详情（需登录）
 * POST /api/my/licenses/:id/renew - 续费（需登录）
 */

import { Hono } from 'hono'
import { userAuth } from '../middleware/user-auth.js'

const router = new Hono()

router.use('*', userAuth)

/**
 * 我的授权列表
 */
router.get('/licenses', async (c) => {
  const userId = c.get('userId')
  const db = c.env.DB

  const licenses = await db.prepare(
    `SELECT l.id, l.license_key, l.product_edition, l.max_stores, l.max_terminals,
            l.valid_from, l.valid_until, l.status, l.created_at,
            (SELECT COUNT(*) FROM license_instances li WHERE li.license_id = l.id AND li.status = 'active') as active_instances
     FROM licenses l
     INNER JOIN orders o ON o.license_id = l.id
     WHERE o.user_id = ?
     ORDER BY l.created_at DESC`
  ).bind(userId).all()

  return c.json({ data: licenses.results })
})

/**
 * 授权详情（含激活实例）
 */
router.get('/licenses/:id', async (c) => {
  const userId = c.get('userId')
  const licenseId = parseInt(c.req.param('id'))
  const db = c.env.DB

  const license = await db.prepare(
    `SELECT l.*, o.order_no, o.paid_at
     FROM licenses l
     INNER JOIN orders o ON o.license_id = l.id
     WHERE l.id = ? AND o.user_id = ?`
  ).bind(licenseId, userId).first()

  if (!license) {
    return c.json({ code: 40400, message: '授权不存在' }, 404)
  }

  const instances = await db.prepare(
    `SELECT instance_id, store_name, hardware_fingerprint, activated_at, last_heartbeat, status
     FROM license_instances
     WHERE license_id = ?
     ORDER BY activated_at DESC`
  ).bind(licenseId).all()

  return c.json({
    data: {
      ...license,
      features: JSON.parse(license.features || '[]'),
      instances: instances.results
    }
  })
})

/**
 * 续费（创建续费订单）
 */
router.post('/licenses/:id/renew', async (c) => {
  const userId = c.get('userId')
  const licenseId = parseInt(c.req.param('id'))
  const { plan_code } = await c.req.json()
  const db = c.env.DB

  if (!plan_code) {
    return c.json({ code: 40000, message: '请选择套餐' }, 400)
  }

  const license = await db.prepare(
    `SELECT l.id FROM licenses l
     INNER JOIN orders o ON o.license_id = l.id
     WHERE l.id = ? AND o.user_id = ?`
  ).bind(licenseId, userId).first()

  if (!license) {
    return c.json({ code: 40400, message: '授权不存在' }, 404)
  }

  const plan = await db.prepare(
    "SELECT * FROM plans WHERE code = ? AND status = 'active'"
  ).bind(plan_code).first()

  if (!plan) {
    return c.json({ code: 40401, message: '套餐不存在' }, 404)
  }

  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  const orderNo = `RENEW${y}${m}${d}${h}${mi}${s}${rand}`

  const order = await db.prepare(
    `INSERT INTO orders (order_no, user_id, plan_id, amount, original_amount, status, remark, license_id, expires_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, datetime('now', '+24 hours')) RETURNING *`
  ).bind(orderNo, userId, plan.id, plan.price, plan.original_price, `续费授权 ${licenseId}`, licenseId).first()

  return c.json({
    data: {
      order_no: order.order_no,
      amount: order.amount,
      plan_name: plan.name,
      duration_days: plan.duration_days,
      created_at: order.created_at
    },
    message: '续费订单创建成功'
  })
})

export default router
