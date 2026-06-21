/**
 * 支付回调路由（公开，强制签名验证 — 失败关闭）
 *
 * 修复缺陷 #1 #2：原实现无任何签名校验，任意伪造即可发牌（资金损失）；
 * 且未校验回调金额与订单一致性。
 *
 * 安全策略：
 *   1. 商户密钥未配置 → 一律 FAIL（绝不发牌）
 *   2. 验签失败 → 返回 FAIL，要求第三方重试（绝不会发牌）
 *   3. 验签通过 → 校验金额 → 幂等检查 → OrderLock 串行发牌
 *   4. 第三方格式异常导致永远重试 → 记录告警日志
 *
 * 路由：
 *   POST /api/orders/callback/wechat   微信支付 V3
 *   POST /api/orders/callback/alipay   支付宝 RSA2
 *   POST /api/orders/callback/unionpay 云闪付（占位，失败关闭）
 */

import { Hono } from 'hono'
import { verifyWechatV3, verifyAlipayRSA2, verifyUnionpay, verifyAmount, yuanToFen } from '../utils/payment-verify.js'
import { fulfillOrderViaLock } from '../services/fulfillment.js'

const router = new Hono()

/**
 * 读取支付配置（system_config.payment_config）
 */
async function getPaymentConfig(env) {
  const db = env.DB
  try {
    const row = await db.prepare("SELECT value FROM system_config WHERE key = 'payment_config'").first()
    if (row && row.value) return JSON.parse(row.value)
  } catch (e) { /* fallthrough */ }
  return {}
}

/**
 * 金额校验失败 / 验签失败的统一日志（写入 admin_logs，target_type='payment_callback'）
 */
async function logCallbackFailure(env, channel, orderNo, reason, detail = {}) {
  try {
    const db = env.DB
    await db.prepare(
      `INSERT INTO admin_logs (admin_id, admin_username, action, target_type, target_id, detail, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(null, `(system:${channel})`, 'payment.callback.failed', 'order', null, JSON.stringify({ channel, orderNo, reason, ...detail }), '').run()
  } catch (e) { /* 静默 */ }
}

// ============ 微信支付 V3 回调 ============

router.post('/callback/wechat', async (c) => {
  const rawBody = await c.req.text()
  const conf = await getPaymentConfig(c.env)

  const verified = await verifyWechatV3(c.req.header(), rawBody, conf)
  if (!verified.ok) {
    // 解析 orderNo 失败也无法记录，但绝不会发牌
    let orderNo = null
    try { orderNo = JSON.parse(rawBody).out_trade_no || JSON.parse(rawBody).order_no } catch (e) { /* ignore */ }
    await logCallbackFailure(c.env, 'wechat', orderNo, verified.reason)
    // 微信期望非 2xx 时重试；验签失败属于"我方拒绝"，返回 FAIL 终止重试避免刷日志
    return c.text('FAIL')
  }

  const trade = verified.trade
  const orderNo = trade.out_trade_no
  const callbackAmountFen = trade.amount && (typeof trade.amount.total === 'number' ? trade.amount.total : parseInt(trade.amount.total))

  return runFulfill(c, 'wechat', orderNo, callbackAmountFen, trade.transaction_id)
})

// ============ 支付宝回调 ============

router.post('/callback/alipay', async (c) => {
  const rawBody = await c.req.text()
  const params = new URLSearchParams(rawBody)
  const conf = await getPaymentConfig(c.env)

  const verified = await verifyAlipayRSA2(params, conf.alipay_public_key_pem)
  if (!verified.ok) {
    await logCallbackFailure(c.env, 'alipay', params.get('out_trade_no'), verified.reason)
    return c.text('fail')
  }

  const trade = verified.trade
  const orderNo = trade.out_trade_no
  const callbackAmountFen = yuanToFen(trade.total_amount)

  return runFulfill(c, 'alipay', orderNo, callbackAmountFen, trade.trade_no)
})

// ============ 云闪付回调（占位，失败关闭） ============

router.post('/callback/unionpay', async (c) => {
  const rawBody = await c.req.text()
  const params = new URLSearchParams(rawBody)
  const conf = await getPaymentConfig(c.env)

  const verified = await verifyUnionpay(params, conf)
  await logCallbackFailure(c.env, 'unionpay', params.get('orderId') || params.get('orderId'), verified.reason || 'not_implemented')
  return c.text('fail')
})

// ============ 通用发牌流程 ============

async function runFulfill(c, channel, orderNo, callbackAmountFen, paymentNo) {
  if (!orderNo) {
    await logCallbackFailure(c.env, channel, null, 'missing_order_no')
    return channelSuccess(channel) // 终止第三方重试
  }

  const db = c.env.DB
  const order = await db.prepare('SELECT * FROM orders WHERE order_no = ?').bind(orderNo).first()
  if (!order) {
    await logCallbackFailure(c.env, channel, orderNo, 'order_not_found')
    return channelSuccess(channel) // 订单不存在，重试无意义
  }

  // 金额一致性校验（缺陷 #2）
  if (!Number.isNaN(callbackAmountFen) && !verifyAmount(order.amount, callbackAmountFen)) {
    await logCallbackFailure(c.env, channel, orderNo, 'amount_mismatch', {
      orderAmount: order.amount, callbackAmount: callbackAmountFen,
    })
    return channelFail(channel) // 金额不符，可能伪造，要求人工介入
  }

  // 幂等：已 paid 直接返回 SUCCESS，不发牌
  if (order.status === 'paid') {
    return channelSuccess(channel)
  }

  // OrderLock 串行发牌
  const result = await fulfillOrderViaLock(c.env, orderNo, { paymentNo })
  if (result.ok) {
    return channelSuccess(channel)
  }

  // 发牌失败（plan 缺失等业务异常）→ 告知第三方稍后重试
  await logCallbackFailure(c.env, channel, orderNo, result.error || 'fulfill_failed', { message: result.message })
  return channelFail(channel)
}

function channelSuccess(channel) {
  return channel === 'wechat' ? new Response('SUCCESS') : c_text('success')
}
function channelFail(channel) {
  return channel === 'wechat' ? new Response('FAIL', { status: 500 }) : c_text('fail', 500)
}
// 辅助：Hono 的 c.text 在外部函数中不可用，用 Response 兜底
function c_text(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain' } })
}

export default router
