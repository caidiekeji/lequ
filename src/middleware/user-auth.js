/**
 * 用户认证中间件（JWT Bearer Token）
 * 验证请求头中的 Bearer Token，通过后将用户 ID 附加到上下文。
 * 供 orders、user-center 等路由共享使用。
 */
import { verifyJWT } from '../utils.js'

export async function userAuth(c, next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ code: 40100, message: '未登录' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const payload = await verifyJWT(token, c.env.JWT_SECRET)
  if (!payload || payload.type !== 'user') {
    return c.json({ code: 40101, message: '登录已过期' }, 401)
  }

  c.set('userId', payload.id)
  await next()
}
