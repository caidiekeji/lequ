/**
 * OrderLock Durable Object
 *
 * 修复缺陷 #6：发牌逻辑两处重复且无事务，并发回调或"回调+手动确认"并发时
 * 可能重复发牌（订单 paid 但生成多张 license）或资金与授权脱钩。
 *
 * 用途：对「同一订单的发牌流程」做全局串行化。
 *   - 同一 orderNo 的 fulfillOrder 在 DO 内排队执行，天然互斥。
 *   - fulfilled 标志位 + storage 持久化，避免 DO 重启后重复发牌。
 *
 * 使用（fulfillment.js）：
 *   const id = env.ORDER_LOCK.idFromName(orderNo)
 *   const stub = env.ORDER_LOCK.get(id)
 *   const result = await stub.fetch('http://do/fulfill', { method:'POST', body: JSON.stringify({orderNo}) })
 */

export class OrderLock {
  constructor(state, env) {
    this.state = state
    this.env = env
  }

  /**
   * 通过 DO fetch 调用，串行执行发牌
   * 请求：POST /fulfill  body: { orderNo, fulfiller: 'callback'|'manual' }
   * 响应：{ ok, alreadyFulfilled, licenseId?, error? }
   */
  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname !== '/fulfill') {
      return new Response(JSON.stringify({ ok: false, error: 'not_found' }), { status: 404 })
    }

    let body
    try {
      body = await request.json()
    } catch (e) {
      return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 })
    }
    const { orderNo } = body
    if (!orderNo) {
      return Response.json({ ok: false, error: 'missing_order_no' }, { status: 400 })
    }

    // 幂等：检查该订单是否已发牌（持久化标志）
    const fulfilledKey = `fulfilled:${orderNo}`
    const already = await this.state.storage.get(fulfilledKey)
    if (already) {
      return Response.json({ ok: true, alreadyFulfilled: true, licenseId: already.licenseId || null })
    }

    // 执行发牌（实际逻辑由 env 注入的 fulfiller 完成）
    const fulfiller = this.env.__fulfillOrder
    if (typeof fulfiller !== 'function') {
      return Response.json({ ok: false, error: 'fulfiller_not_bound' }, { status: 500 })
    }

    let result
    try {
      result = await fulfiller(this.env, orderNo)
    } catch (e) {
      return Response.json({ ok: false, error: 'fulfill_threw', message: e.message }, { status: 500 })
    }

    if (result && result.error) {
      return Response.json({ ok: false, error: result.error, message: result.message })
    }

    // 成功发牌 → 持久化标志，防止后续重复回调再次发牌
    await this.state.storage.put(fulfilledKey, {
      licenseId: result && result.licenseId,
      at: new Date().toISOString(),
    })

    return Response.json({ ok: true, alreadyFulfilled: false, licenseId: result && result.licenseId })
  }
}
