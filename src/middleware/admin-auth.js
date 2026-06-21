/**
 * 管理员认证辅助（re-export 现有 authenticate 并提供便捷读取函数）
 *
 * 现有 src/middleware/auth.js 的 authenticate 已被全代码库引用，
 * 这里不改动它，仅补充便捷读取 + IP/UA 收集辅助，供审计与日志模块使用。
 */

export { authenticate } from './auth.js'

/**
 * 取当前 admin（已由 authenticate 写入）
 */
export function getAdmin(c) {
  return c.get('admin') || null
}

/**
 * 取请求 IP（Cloudflare 头优先）
 */
export function getRequestIp(c) {
  return c.req.header('CF-Connecting-IP')
    || (c.req.header('X-Forwarded-For') || '').split(',')[0].trim()
    || ''
}

/**
 * 取 UA（截断长度，避免日志膨胀）
 */
export function getRequestUa(c, maxLen = 300) {
  const ua = c.req.header('User-Agent') || ''
  return ua.length > maxLen ? ua.substring(0, maxLen) : ua
}
