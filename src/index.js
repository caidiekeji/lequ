/**
 * 授权管理系统 - Cloudflare Worker 入口
 *
 * 功能：
 * 1. 官网页面（首页 / 功能 / 定价 / 文档）
 * 2. 管理后台 API（JWT 保护）
 * 3. 对外授权 API（主系统调用）
 *
 * 部署方式：
 *   npx wrangler deploy
 *
 * 本地开发：
 *   npm run dev
 *
 * 数据库迁移（首次部署执行）：
 *   npx wrangler d1 migrations apply shouquan-db
 */

import { Hono } from 'hono'
import { initDatabase } from './db.js'
import { trackVisit } from './middleware/track-visit.js'

// 路由模块
import authRoutes from './routes/auth.js'
import licenseRoutes from './routes/licenses.js'
import apiV1Routes from './routes/api-v1.js'
import userAuthRoutes from './routes/user-auth.js'
import plansRoutes from './routes/plans.js'
import ordersRoutes from './routes/orders.js'
import payCallbackRoutes from './routes/pay-callback.js'
import adminPaymentRoutes from './routes/admin-payment.js'
import adminRoutes from './routes/admin.js'
import userCenterRoutes from './routes/user-center.js'
import { homePage, featuresPage, pricingPage, docsPage, loginPage, registerPage, dashboardPage, licensesPage, ordersPage, profilePage } from './routes/website.js'

// 创建 Hono 应用
const app = new Hono()

// ==================== CORS 中间件 ====================
// 修复缺陷 #4：白名单未匹配时直接拒绝（不返回 ACAO 头），严禁回退到 '*'
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin')
  const allowedOrigins = (c.env.CORS_ORIGINS || '').split(',').filter(Boolean)

  // 确定是否允许该 origin
  let allowOrigin = null
  if (origin && allowedOrigins.length > 0) {
    if (allowedOrigins.includes(origin)) {
      allowOrigin = origin
    }
    // 白名单已配置但 origin 不匹配 → allowOrigin = null，不返回 ACAO
  } else if (!origin) {
    // 无 Origin 头（同源请求 / 服务端调用）→ 放行
    allowOrigin = '*'
  }
  // CORS_ORIGINS 为空 + 有 Origin → allowOrigin = null，拒绝（禁止生产环境忘记配置）

  if (c.req.method === 'OPTIONS') {
    if (!allowOrigin) {
      return new Response(null, { status: 403 })
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key,X-Timestamp,X-Nonce,X-Signature',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  await next()
  if (allowOrigin) {
    c.res.headers.set('Access-Control-Allow-Origin', allowOrigin)
    c.res.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Api-Key,X-Timestamp,X-Nonce,X-Signature')
  }
})

// 访问统计
app.use('*', trackVisit)

// ==================== 官网页面（直接返回 HTML） ====================
app.get('/', (c) => c.html(homePage(c.env)))
app.get('/features', (c) => c.html(featuresPage(c.env)))
app.get('/pricing', (c) => c.html(pricingPage(c.env)))
app.get('/docs', (c) => c.html(docsPage(c.env)))

// 用户端页面
app.get('/login', (c) => c.html(loginPage(c.env)))
app.get('/register', (c) => c.html(registerPage(c.env)))
app.get('/forgot', (c) => c.html(loginPage(c.env)))
app.get('/dashboard', (c) => c.html(dashboardPage(c.env)))
app.get('/licenses', (c) => c.html(licensesPage(c.env)))
app.get('/licenses/:id', (c) => c.html(licensesPage(c.env)))
app.get('/orders', (c) => c.html(ordersPage(c.env)))
app.get('/orders/:orderNo', (c) => c.html(ordersPage(c.env)))
app.get('/profile', (c) => c.html(profilePage(c.env)))

// ==================== 健康检查 ====================
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'shouquan', timestamp: new Date().toISOString() })
})

// ==================== API 路由 ====================
app.route('/api/auth', authRoutes)
app.route('/api', licenseRoutes)
app.route('/api', apiV1Routes)

// 用户端 API
app.route('/api/user', userAuthRoutes)
app.route('/api/plans', plansRoutes)
app.route('/api/orders', ordersRoutes)
app.route('/api/orders', payCallbackRoutes)
app.route('/api/admin', adminPaymentRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/my', userCenterRoutes)

// ==================== 404 处理 ====================
app.notFound((c) => {
  // API 404 返回 JSON
  if (c.req.path.startsWith('/api/')) {
    return c.json({ code: 40400, message: '接口不存在' }, 404)
  }
  // 页面 404 返回品牌化 HTML
  return c.html(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>页面不存在 - ShouYinPOS</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet"><style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#f5f6f8;color:#1b1f2b;display:flex;align-items:center;justify-content:center;min-height:100dvh;-webkit-font-smoothing:antialiased}.box{text-align:center;padding:40px}.code{font-size:clamp(80px,15vw,140px);font-weight:800;letter-spacing:-6px;line-height:1;background:linear-gradient(135deg,#4361a8,#785ac8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:16px}.msg{font-size:18px;color:#555b6e;margin-bottom:32px;line-height:1.6}.btn{display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border-radius:6px;font-weight:600;font-size:14px;background:#4361a8;color:#fff;text-decoration:none;transition:all 0.2s;box-shadow:0 2px 8px rgba(67,97,168,0.2)}.btn:hover{background:#334d8a;transform:translateY(-1px);box-shadow:0 4px 16px rgba(67,97,168,0.25)}.btn:active{transform:scale(0.97)}</style></head><body><div class="box"><div class="code">404</div><p class="msg">你要找的页面不存在，可能已被移动或删除。</p><a href="/" class="btn">返回首页</a></div></body></html>`)
})

// ==================== 错误处理 ====================
app.onError((err, c) => {
  console.error('[Error]', err.message)
  const isProd = c.env.SITE_URL && !c.env.SITE_URL.includes('localhost')
  return c.json({ code: 50000, message: isProd ? '服务器内部错误' : err.message }, 500)
})

// ==================== Worker 入口 ====================
export default {
  async fetch(request, env, ctx) {
    // 首次请求时初始化数据库（仅创建默认管理员）
    ctx.waitUntil(initDatabase(env.DB, env))
    return app.fetch(request, env, ctx)
  },
  async scheduled(event, env, ctx) {
    switch (event.cron) {
      case '0 * * * *':
        const { handleOrderTimeout } = await import('./cron/order-timeout.js')
        await handleOrderTimeout(env)
        break
      case '0 8 * * *':
        const { handleExpiryReminders } = await import('./cron/expiry-reminder.js')
        await handleExpiryReminders(env)
        break
    }
  },
}