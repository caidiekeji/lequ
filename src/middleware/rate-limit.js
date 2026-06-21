/**
 * 限流中间件（基于 Cloudflare KV 的固定窗口计数器）
 *
 * 修复缺陷 #3 / #13：对外 API 与登录接口无频率限制，存在爆破 / 写放大风险。
 *
 * 设计：
 * - 每个限流 key 在 KV 中维护一个计数（窗口内累加）。
 * - 窗口结束前所有命中均累加，超阈值返回 429。
 * - KV 写入最终一致（跨边缘节点有秒级延迟），适合反爆破这种"够用即可"的场景。
 * - 若 KV 未绑定（RATE_LIMIT），降级为放行（不影响主流程），仅打日志。
 *
 * 用法：
 *   router.post('/login', rateLimit(c => `login:${c.req.body.account}`, 5, 900), handler)
 */

const RATE_LIMIT_KV = 'RATE_LIMIT'

/**
 * 构造限流 key 维度。常见维度：
 * - 'ip'        请求 IP
 * - 'account'   账号（需调用方提供 body）
 * - 'license'   授权码
 * - 'instance'  实例 ID
 */
export function rateLimitKeyBuilder(dim) {
  return (c, extra) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    switch (dim) {
      case 'ip': return ip
      case 'account': return extra || ip
      case 'license': return extra || ip
      case 'instance': return extra || ip
      default: return ip
    }
  }
}

/**
 * 通用限流器
 * @param {(c:any, extra?:string) => string} keyFn - 返回限流维度标识
 * @param {string} namespace - 命名空间，避免不同接口计数串扰
 * @param {number} limit - 窗口内最大次数
 * @param {number} windowSec - 窗口秒数
 * @returns {HonoMiddleware}
 */
export function rateLimit(keyFn, namespace, limit, windowSec) {
  return async (c, next) => {
    const kv = c.env && c.env[RATE_LIMIT_KV]
    if (!kv) {
      // KV 未配置 → 降级放行
      return next()
    }

    const dim = keyFn(c)
    const windowStart = Math.floor(Date.now() / 1000 / windowSec) * windowSec
    const key = `rl:${namespace}:${dim}:${windowStart}`

    let count = 0
    try {
      const raw = await kv.get(key)
      count = raw ? parseInt(raw) : 0
    } catch (e) {
      // 读失败 → 放行（fail-open，限流非安全核心）
      return next()
    }

    if (count >= limit) {
      const retryAfter = windowStart + windowSec - Math.floor(Date.now() / 1000)
      c.header('Retry-After', String(Math.max(retryAfter, 1)))
      return c.json({ code: 42900, message: '请求过于频繁，请稍后再试' }, 429)
    }

    try {
      // 计数 +1，TTL 覆盖窗口长度 + 缓冲
      await kv.put(key, String(count + 1), { expirationTtl: windowSec + 60 })
    } catch (e) {
      // 写失败 → 放行
    }

    return next()
  }
}

// ============ 常用预设 ============

/** IP 维度限流：登录失败/通用接口 */
export const limitByIp = (namespace, limit, windowSec) =>
  rateLimit(rateLimitKeyBuilder('ip'), namespace, limit, windowSec)

/** 账号维度限流（需在 handler 内已读 body 时通过 extra 传入） */
export const limitByAccount = (namespace, limit, windowSec) =>
  rateLimit(rateLimitKeyBuilder('account'), namespace, limit, windowSec)
