/**
 * 认证路由（管理员登录）
 * POST /api/auth/login
 * GET  /api/auth/me
 */

import { Hono } from 'hono'
import { hashPassword, verifyPassword, createJWT } from '../utils.js'

const router = new Hono()

/**
 * 管理员登录
 */
router.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  if (!username || !password) {
    return c.json({ code: 40000, message: '请输入用户名和密码' }, 400)
  }

  const db = c.env.DB
  const admin = await db.prepare(
    "SELECT * FROM admins WHERE username = ? AND status = 'active'"
  ).bind(username).first()

  if (!admin) {
    return c.json({ code: 40100, message: '用户名或密码错误' }, 401)
  }

  const valid = await verifyPassword(password, admin.password_hash)
  if (!valid) {
    return c.json({ code: 40100, message: '用户名或密码错误' }, 401)
  }

  // 更新最后登录时间
  await db.prepare("UPDATE admins SET last_login = datetime('now') WHERE id = ?").bind(admin.id).run()

  // 签发 JWT
  const token = await createJWT(
    { id: admin.id, username: admin.username, role: admin.role },
    c.env.JWT_SECRET
  )

  return c.json({
    data: {
      token,
      admin: { id: admin.id, username: admin.username, role: admin.role },
    },
    message: '登录成功',
  })
})

/**
 * 获取当前登录管理员信息
 */
router.get('/me', async (c) => {
  // 从认证中间件设置的数据中获取
  const admin = c.get('admin')
  if (!admin) return c.json({ code: 40100, message: '未登录' }, 401)
  return c.json({ data: admin })
})

export default router