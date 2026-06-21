/**
 * 用户认证路由（客户登录/注册）
 *
 * 修复缺陷 #13：登录无频率限制，可被无限密码爆破。
 * 现基于 IP + 账号维度限流：5 次失败锁 15 分钟。
 *
 * POST /api/user/register   - 注册
 * POST /api/user/login      - 登录（限流）
 * POST /api/user/forgot     - 找回密码
 * GET  /api/user/me         - 当前用户信息（需登录）
 */

import { Hono } from 'hono'
import { hashPassword, verifyPassword, createJWT, validatePasswordStrength } from '../utils.js'
import { userAuth } from '../middleware/user-auth.js'
import { rateLimit } from '../middleware/rate-limit.js'
import { logLogin } from '../utils/audit.js'
import { sendMail, buildResetPasswordEmail, buildWelcomeEmail } from '../services/email.js'

const router = new Hono()

/**
 * 用户注册（IP 维度限流：5 次/小时）
 */
router.post('/register', rateLimit(c => c.req.header('CF-Connecting-IP') || 'unknown', 'user_register', 5, 3600), async (c) => {
  const { email, password, nickname, company, phone } = await c.req.json()

  if (!email || !password) {
    return c.json({ code: 40000, message: '请输入邮箱和密码' }, 400)
  }
  const pwdCheck = validatePasswordStrength(password)
  if (!pwdCheck.valid) {
    return c.json({ code: 40001, message: pwdCheck.message }, 400)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return c.json({ code: 40002, message: '邮箱格式不正确' }, 400)
  }

  const db = c.env.DB

  const exists = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (exists) {
    return c.json({ code: 40900, message: '该邮箱已注册' }, 409)
  }

  if (phone) {
    const phoneExists = await db.prepare('SELECT id FROM users WHERE phone = ?').bind(phone).first()
    if (phoneExists) {
      return c.json({ code: 40901, message: '该手机号已注册' }, 409)
    }
  }

  const passwordHash = await hashPassword(password)
  const result = await db.prepare(
    "INSERT INTO users (email, password_hash, nickname, company, phone) VALUES (?, ?, ?, ?, ?) RETURNING id, email, nickname, company, phone, created_at"
  ).bind(email, passwordHash, nickname || email.split('@')[0], company || '', phone || null).first()

  const token = await createJWT(
    { id: result.id, email: result.email, type: 'user' },
    c.env.JWT_SECRET,
    86400 * 7
  )

  await logLogin(c, 'user', email, 'success', 'register')

  // 异步发送欢迎邮件（不阻塞注册流程）
  sendMail(c.env, {
    to: email,
    ...buildWelcomeEmail(nickname || email.split('@')[0]),
  }).catch(e => { console.error('[email] 注册欢迎邮件发送失败:', e.message) })

  return c.json({
    data: { token, user: result },
    message: '注册成功'
  })
})

/**
 * 用户登录（账号 + IP 维度限流：5 次失败锁 15 分钟）
 */
router.post('/login', rateLimit(c => c.req.header('CF-Connecting-IP') || 'unknown', 'user_login', 5, 900), async (c) => {
  const { account, password } = await c.req.json()

  if (!account || !password) {
    return c.json({ code: 40000, message: '请输入账号和密码' }, 400)
  }

  const db = c.env.DB
  const user = await db.prepare(
    "SELECT * FROM users WHERE (email = ? OR phone = ?) AND status = 'active'"
  ).bind(account, account).first()

  if (!user) {
    await logLogin(c, 'user', account, 'failed', 'user_not_found')
    return c.json({ code: 40100, message: '账号或密码错误' }, 401)
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    await logLogin(c, 'user', account, 'failed', 'wrong_password')
    return c.json({ code: 40100, message: '账号或密码错误' }, 401)
  }

  await db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").bind(user.id).run()
  await logLogin(c, 'user', account, 'success')

  const token = await createJWT(
    { id: user.id, email: user.email, type: 'user' },
    c.env.JWT_SECRET,
    86400 * 7
  )

  return c.json({
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        company: user.company,
        phone: user.phone,
        avatar_url: user.avatar_url
      }
    },
    message: '登录成功'
  })
})

/**
 * 找回密码（发送重置链接）
 */
router.post('/forgot', async (c) => {
  // IP 维度限流：10 次/小时，防邮件轰炸
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || 'unknown'
  const rl = rateLimit(() => ip, 'user_forgot', 10, 3600)
  const blocked = await rl(c, async () => {})
  if (blocked) return blocked

  const { email } = await c.req.json()

  if (!email) {
    return c.json({ code: 40000, message: '请输入邮箱' }, 400)
  }

  const db = c.env.DB
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()

  if (!user) {
    return c.json({ data: null, message: '如果邮箱已注册，重置链接已发送' })
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 3600000).toISOString()

  await db.prepare(
    "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)"
  ).bind(user.id, token, expiresAt).run()

  // 发送找回密码邮件（异步，不泄漏用户是否存在）
  const siteUrl = c.env.SITE_URL || 'https://www.lequ.pw'
  sendMail(c.env, {
    to: email,
    ...buildResetPasswordEmail(`${siteUrl}/reset?token=${token}`),
  }).catch(e => { console.error('[email] 密码重置邮件发送失败:', e.message) })

  return c.json({
    data: null,
    message: '如果邮箱已注册，重置链接已发送'
  })
})

/**
 * 重置密码
 */
router.post('/reset', async (c) => {
  // IP 维度限流：5 次/小时，防暴力破解
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || 'unknown'
  const rl = rateLimit(() => ip, 'user_reset', 5, 3600)
  const blocked = await rl(c, async () => {})
  if (blocked) return blocked

  const { token, password } = await c.req.json()

  if (!token || !password) {
    return c.json({ code: 40000, message: '缺少必要参数' }, 400)
  }
  const pwdCheck = validatePasswordStrength(password)
  if (!pwdCheck.valid) {
    return c.json({ code: 40001, message: pwdCheck.message }, 400)
  }

  const db = c.env.DB
  const reset = await db.prepare(
    "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > datetime('now')"
  ).bind(token).first()

  if (!reset) {
    return c.json({ code: 40002, message: '重置链接无效或已过期' }, 400)
  }

  const passwordHash = await hashPassword(password)
  await db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .bind(passwordHash, reset.user_id).run()
  await db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').bind(reset.id).run()

  return c.json({ message: '密码重置成功' })
})

/**
 * 获取当前用户信息
 */
router.get('/me', userAuth, async (c) => {
  const db = c.env.DB
  const user = await db.prepare(
    'SELECT id, email, phone, nickname, company, avatar_url, created_at FROM users WHERE id = ?'
  ).bind(c.get('userId')).first()

  if (!user) {
    return c.json({ code: 40400, message: '用户不存在' }, 404)
  }

  return c.json({ data: user })
})

/**
 * 修改个人信息
 */
router.put('/me', userAuth, async (c) => {
  const { nickname, company, phone } = await c.req.json()
  const db = c.env.DB

  if (phone) {
    const phoneExists = await db.prepare('SELECT id FROM users WHERE phone = ? AND id != ?')
      .bind(phone, c.get('userId')).first()
    if (phoneExists) {
      return c.json({ code: 40900, message: '该手机号已被其他账号使用' }, 409)
    }
  }

  await db.prepare(
    "UPDATE users SET nickname = COALESCE(?, nickname), company = COALESCE(?, company), phone = COALESCE(?, phone), updated_at = datetime('now') WHERE id = ?"
  ).bind(nickname || null, company || null, phone || null, c.get('userId')).run()

  return c.json({ message: '修改成功' })
})

export default router
