/**
 * 对外 API（/api/v1/*）HMAC 鉴权中间件
 *
 * 修复缺陷 #3：对外激活/心跳/状态接口无任何鉴权，存在爆破与信息泄露风险。
 *
 * 客户端签名规范：
 *   string_to_sign = METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + NONCE + "\n" + sha256_hex(BODY)
 *   signature       = base64( HMAC_SHA256(api_secret, string_to_sign) )
 *
 * 请求头：
 *   X-Api-Key:    客户 API Key（系统配置中维护 api_clients 表的 key→secret 映射）
 *   X-Timestamp:  秒级时间戳，与服务端偏差 ±5 分钟内有效
 *   X-Nonce:      随机串，进 KV 防重放（TTL 10 分钟）
 *   X-Signature:  base64 签名
 *
 * 密钥来源：system_config 表 key='api_clients'，value 为 JSON：
 *   { "clients": [ { "api_key": "...", "api_secret": "..." } ] }
 * 兼容：若未配置 api_clients 但配置了 V1_API_SECRET，则作为全局密钥。
 */

import { sha256, hmacSha256, timingSafeEqual } from '../utils.js'

const MAX_SKEW_SEC = 300
const NONCE_TTL = 600

async function loadApiSecret(c, apiKey) {
  const db = c.env.DB
  try {
    const row = await db.prepare("SELECT value FROM system_config WHERE key = 'api_clients'").first()
    if (row && row.value) {
      const conf = JSON.parse(row.value)
      const clients = conf.clients || conf
      const found = (Array.isArray(clients) ? clients : []).find(c => timingSafeEqual(c.api_key, apiKey))
      if (found) return found.api_secret
    }
  } catch (e) { /* fallthrough */ }

  // 兜底：环境变量配置的单一全局密钥
  const globalSecret = c.env.V1_API_SECRET
  if (globalSecret && apiKey === c.env.V1_API_KEY) return globalSecret

  return null
}

export async function hmacAuth(c, next) {
  const apiKey = c.req.header('X-Api-Key')
  const timestamp = c.req.header('X-Timestamp')
  const nonce = c.req.header('X-Nonce')
  const signature = c.req.header('X-Signature')

  if (!apiKey || !timestamp || !nonce || !signature) {
    return c.json({ code: 40100, message: '缺少鉴权头（X-Api-Key/X-Timestamp/X-Nonce/X-Signature）' }, 401)
  }

  // 时间戳校验（±5 分钟）
  const ts = parseInt(timestamp)
  const now = Math.floor(Date.now() / 1000)
  if (!ts || Math.abs(now - ts) > MAX_SKEW_SEC) {
    return c.json({ code: 40101, message: '请求时间戳无效或已超时' }, 401)
  }

  const secret = await loadApiSecret(c, apiKey)
  if (!secret) {
    return c.json({ code: 40102, message: 'API Key 无效' }, 401)
  }

  // Nonce 防重放
  const kv = c.env && c.env.RATE_LIMIT
  if (kv) {
    try {
      const seen = await kv.get(`nonce:${apiKey}:${nonce}`)
      if (seen) {
        return c.json({ code: 40103, message: '请求不可重放' }, 401)
      }
      await kv.put(`nonce:${apiKey}:${nonce}`, '1', { expirationTtl: NONCE_TTL })
    } catch (e) { /* KV 不可用降级 */ }
  }

  // 计算签名
  const method = c.req.method
  const path = new URL(c.req.url).pathname
  const rawBody = c.req.rawBody || ''
  const bodyHash = await sha256(rawBody)
  const stringToSign = [method, path, timestamp, nonce, bodyHash].join('\n')
  const expected = await hmacSha256(secret, stringToSign)

  if (!timingSafeEqual(expected, signature)) {
    return c.json({ code: 40104, message: '签名校验失败' }, 401)
  }

  c.set('apiKey', apiKey)
  return next()
}

/**
 * 在路由最前部挂载，用于缓存 raw body（Hono 默认消费 body 后无法回读）
 * 用法：router.use('*', captureRawBody)
 */
export async function captureRawBody(c, next) {
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    try {
      const cloned = c.req.raw.clone()
      c.req.rawBody = await cloned.text()
    } catch (e) {
      c.req.rawBody = ''
    }
  }
  await next()
}
