/**
 * 订单路由（创建订单/支付）
 * POST /api/orders              - 创建订单（需登录）
 * GET  /api/orders              - 我的订单列表（需登录）
 * GET  /api/orders/:orderNo     - 订单详情（需登录）
 * POST /api/orders/:orderNo/pay - 发起支付（需登录）
 */

import { Hono } from 'hono'
import { userAuth } from '../middleware/user-auth.js'

const router = new Hono()

router.use('*', userAuth)

function generateOrderNo() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD${y}${m}${d}${h}${mi}${s}${rand}`
}

router.post('/', async (c) => {
  const userId = c.get('userId')
  const { plan_code } = await c.req.json()

  if (!plan_code) {
    return c.json({ code: 40000, message: '请选择套餐' }, 400)
  }

  const db = c.env.DB

  const plan = await db.prepare(
    "SELECT * FROM plans WHERE code = ? AND status = 'active'"
  ).bind(plan_code).first()

  if (!plan) {
    return c.json({ code: 40400, message: '套餐不存在' }, 404)
  }

  const orderNo = generateOrderNo()
  const order = await db.prepare(
    `INSERT INTO orders (order_no, user_id, plan_id, amount, original_amount, status, expires_at)
     VALUES (?, ?, ?, ?, ?, 'pending', datetime('now', '+24 hours')) RETURNING *`
  ).bind(orderNo, userId, plan.id, plan.price, plan.original_price).first()

  return c.json({
    data: {
      order_no: order.order_no,
      amount: order.amount,
      plan_name: plan.name,
      duration_days: plan.duration_days,
      created_at: order.created_at
    },
    message: '订单创建成功'
  })
})

router.get('/', async (c) => {
  const userId = c.get('userId')
  const { page, pageSize, status } = c.req.query()

  const db = c.env.DB
  const p = Math.max(parseInt(page) || 1, 1)
  const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100)
  const offset = (p - 1) * ps

  let where = 'WHERE o.user_id = ?'
  const params = [userId]

  if (status) {
    where += ' AND o.status = ?'
    params.push(status)
  }

  const countResult = await db.prepare(
    `SELECT COUNT(*) as total FROM orders o ${where}`
  ).bind(...params).first()

  const orders = await db.prepare(
    `SELECT o.*, p.name as plan_name, p.code as plan_code
     FROM orders o
     LEFT JOIN plans p ON o.plan_id = p.id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...params, ps, offset).all()

  return c.json({
    data: {
      list: orders.results,
      total: countResult.total,
      page: p,
      pageSize: ps
    }
  })
})

router.get('/:orderNo', async (c) => {
  const userId = c.get('userId')
  const orderNo = c.req.param('orderNo')

  const db = c.env.DB
  const order = await db.prepare(
    `SELECT o.*, p.name as plan_name, p.code as plan_code, p.features,
            l.license_key
     FROM orders o
     LEFT JOIN plans p ON o.plan_id = p.id
     LEFT JOIN licenses l ON o.license_id = l.id
     WHERE o.order_no = ? AND o.user_id = ?`
  ).bind(orderNo, userId).first()

  if (!order) {
    return c.json({ code: 40400, message: '订单不存在' }, 404)
  }

  return c.json({ data: order })
})

router.post('/:orderNo/pay', async (c) => {
  const userId = c.get('userId')
  const orderNo = c.req.param('orderNo')
  const { payment_method } = await c.req.json()

  if (!payment_method || !['wechat', 'alipay', 'unionpay'].includes(payment_method)) {
    return c.json({ code: 40000, message: '请选择支付方式' }, 400)
  }

  const db = c.env.DB
  const order = await db.prepare(
    "SELECT * FROM orders WHERE order_no = ? AND user_id = ? AND status = 'pending'"
  ).bind(orderNo, userId).first()

  if (!order) {
    return c.json({ code: 40400, message: '订单不存在或已支付' }, 404)
  }

  await db.prepare(
    "UPDATE orders SET payment_method = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(payment_method, order.id).run()

  return c.json({
    data: generatePaymentInfo(payment_method, order),
    message: '支付信息已生成'
  })
})

function generatePaymentInfo(method, order) {
  const orderNo = order.order_no
  const amount = order.amount

  if (method === 'wechat') {
    return {
      method: 'wechat',
      code_url: `weixin://wxpay/bizpayurl?pr=${orderNo}`,
      amount,
      order_no: orderNo,
      message: '请使用微信扫码支付'
    }
  }

  if (method === 'alipay') {
    return {
      method: 'alipay',
      qr_code: `https://qr.alipay.com/fkx/${orderNo}`,
      amount,
      order_no: orderNo,
      message: '请使用支付宝扫码支付'
    }
  }

  if (method === 'unionpay') {
    return {
      method: 'unionpay',
      qr_code: `https://unionpay.com/qr/${orderNo}`,
      amount,
      order_no: orderNo,
      message: '请使用云闪付扫码支付'
    }
  }
}

export default router
