/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token，通过后将管理员信息附加到上下文。
 */
import { verifyJWT } from '../utils.js'

export async function authenticate(c, next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ code: 40100, message: '未登录，请先登录' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const payload = await verifyJWT(token, c.env.JWT_SECRET)

  if (!payload) {
    return c.json({ code: 40101, message: '登录已过期或无效，请重新登录' }, 401)
  }

  // 将管理员信息附加到上下文
  c.set('admin', { id: payload.id, username: payload.username, role: payload.role })
  await next()
}