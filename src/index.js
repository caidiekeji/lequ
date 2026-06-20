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
import { cors } from 'hono/cors'
import { initDatabase } from './db.js'

// 路由模块
import authRoutes from './routes/auth.js'
import licenseRoutes from './routes/licenses.js'
import apiV1Routes from './routes/api-v1.js'
import { homePage, featuresPage, pricingPage, docsPage } from './routes/website.js'

// 创建 Hono 应用
const app = new Hono()

// ==================== CORS 中间件 ====================
app.use('*', cors({
  origin: ['*'], // 生产环境应限制为具体域名
  credentials: true,
}))

// ==================== 官网页面（直接返回 HTML） ====================
app.get('/', (c) => c.html(homePage(c.env)))
app.get('/features', (c) => c.html(featuresPage(c.env)))
app.get('/pricing', (c) => c.html(pricingPage(c.env)))
app.get('/docs', (c) => c.html(docsPage(c.env)))

// ==================== 健康检查 ====================
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'shouquan', timestamp: new Date().toISOString() })
})

// ==================== API 路由 ====================
app.route('/api/auth', authRoutes)
app.route('/api', licenseRoutes)
app.route('/api', apiV1Routes)

// ==================== 404 处理 ====================
app.notFound((c) => {
  // API 404 返回 JSON
  if (c.req.path.startsWith('/api/')) {
    return c.json({ code: 40400, message: '接口不存在' }, 404)
  }
  // 页面 404 返回 HTML
  return c.html(`<!DOCTYPE html><html><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif"><div style="text-align:center"><h1 style="font-size:72px;color:#1a1a2e">404</h1><p style="color:#888">页面不存在</p><a href="/" style="color:#0f3460">返回首页</a></div></body></html>`)
})

// ==================== 错误处理 ====================
app.onError((err, c) => {
  console.error('[Error]', err.message)
  return c.json({ code: 50000, message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message }, 500)
})

// ==================== Worker 入口 ====================
export default {
  async fetch(request, env, ctx) {
    // 首次请求时初始化数据库（仅创建默认管理员）
    ctx.waitUntil(initDatabase(env.DB, env))
    return app.fetch(request, env, ctx)
  },
}