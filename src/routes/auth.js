/**
 * 管理员认证路由
 *
 * POST /api/auth/login        - 管理员登录（限流 5次/15分钟）
 * GET  /api/auth/me           - 当前管理员信息
 * PUT  /api/auth/change-password - 修改密码
 */

import { Hono } from 'hono'
import { verifyPassword, createJWT, hashPassword, validatePasswordStrength } from '../utils.js'
import { authenticate } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rate-limit.js'
import { logLogin } from '../utils/audit.js'

const router = new Hono()

/**
 * 管理员登录（IP 维度限流：5 次失败锁 15 分钟 + KV 用户名维度失败锁定）
 */
router.post('/login', rateLimit(c => c.req.header('CF-Connecting-IP') || 'unknown', 'admin_login', 5, 900), async (c) => {
  const { username, password } = await c.req.json()

  if (!username || !password) {
    return c.json({ code: 40000, message: '请输入用户名和密码' }, 400)
  }

  // KV 失败计数锁定检查
  const kv = c.env.RATE_LIMIT
  const failKey = `login_fail:admin:${username}`
  if (kv) {
    const failCount = await kv.get(failKey)
    if (failCount && parseInt(failCount) >= 5) {
      await logLogin(c, 'admin', username, 'locked', '超过5次失败尝试')
      return c.json({ code: 42901, message: '账号已被锁定，请15分钟后重试' }, 429)
    }
  }

  const db = c.env.DB
  const admin = await db.prepare(
    "SELECT * FROM admins WHERE username = ? AND status = 'active'"
  ).bind(username).first()

  if (!admin) {
    await logLogin(c, 'admin', username, 'failed', 'admin_not_found')
    // 增加失败计数
    if (kv) {
      const current = parseInt(await kv.get(failKey) || '0')
      await kv.put(failKey, String(current + 1), { expirationTtl: 900 })
    }
    return c.json({ code: 40100, message: '用户名或密码错误' }, 401)
  }

  const valid = await verifyPassword(password, admin.password_hash)
  if (!valid) {
    await logLogin(c, 'admin', username, 'failed', 'wrong_password')
    // 增加失败计数
    if (kv) {
      const current = parseInt(await kv.get(failKey) || '0')
      await kv.put(failKey, String(current + 1), { expirationTtl: 900 })
    }
    return c.json({ code: 40100, message: '用户名或密码错误' }, 401)
  }

  // 登录成功，清除失败计数
  if (kv) {
    await kv.delete(failKey)
  }

  await db.prepare("UPDATE admins SET last_login = datetime('now') WHERE id = ?").bind(admin.id).run()
  await logLogin(c, 'admin', username, 'success')

  const token = await createJWT(
    { id: admin.id, username: admin.username, role: admin.role },
    c.env.JWT_SECRET,
    28800  // 管理员 token 8小时过期
  )

  return c.json({
    data: {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      }
    },
    message: '登录成功'
  })
})

/**
 * 获取当前管理员信息
 */
router.get('/me', authenticate, async (c) => {
  const admin = c.get('admin')
  return c.json({ data: admin })
})

/**
 * 修改密码
 */
router.put('/change-password', authenticate, async (c) => {
  const { old_password, new_password } = await c.req.json()
  const admin = c.get('admin')

  if (!old_password || !new_password) {
    return c.json({ code: 40000, message: '请输入旧密码和新密码' }, 400)
  }
  const pwdCheck = validatePasswordStrength(new_password)
  if (!pwdCheck.valid) {
    return c.json({ code: 40001, message: pwdCheck.message }, 400)
  }

  const db = c.env.DB
  const record = await db.prepare('SELECT password_hash FROM admins WHERE id = ?').bind(admin.id).first()
  if (!record) return c.json({ code: 40400, message: '管理员不存在' }, 404)

  const valid = await verifyPassword(old_password, record.password_hash)
  if (!valid) return c.json({ code: 40100, message: '旧密码错误' }, 401)

  const hash = await hashPassword(new_password)
  await db.prepare("UPDATE admins SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(hash, admin.id).run()

  return c.json({ message: '密码修改成功' })
})

export default router
