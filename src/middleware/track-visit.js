/**
 * 访问统计中间件
 * 记录每个页面请求到 site_visits 表
 *
 * 修复缺陷 #11：原实现同步 await INSERT 拖慢主请求 TTFB。
 * 现改为 c.executionCtx.waitUntil() 异步写入，不阻塞响应。
 */

const TRACKED_PATHS = ['/', '/features', '/pricing', '/docs', '/login', '/register']

export async function trackVisit(c, next) {
  await next()

  const path = c.req.path
  if (!TRACKED_PATHS.includes(path) && !path.startsWith('/api/')) return

  // 异步写入，不阻塞响应
  c.executionCtx.waitUntil(
    (async () => {
      try {
        const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || ''
        const userAgent = c.req.header('User-Agent') || ''
        const referer = c.req.header('Referer') || ''
        const country = c.req.header('CF-IPCountry') || ''

        await c.env.DB.prepare(
          'INSERT INTO site_visits (path, ip, user_agent, referer, country) VALUES (?, ?, ?, ?, ?)'
        ).bind(path, ip, userAgent.substring(0, 500), referer.substring(0, 500), country).run()
      } catch (e) {
        // 静默失败，不影响主请求
      }
    })()
  )
}
