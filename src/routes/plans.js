/**
 * 套餐路由（产品展示）
 * GET /api/plans         - 获取套餐列表（公开）
 * GET /api/plans/:code   - 获取套餐详情（公开）
 */

import { Hono } from 'hono'

const router = new Hono()

/**
 * 获取套餐列表
 */
router.get('/', async (c) => {
  const db = c.env.DB
  const plans = await db.prepare(
    "SELECT * FROM plans WHERE status = 'active' ORDER BY sort_order ASC"
  ).all()

  return c.json({ data: plans.results })
})

/**
 * 获取套餐详情
 */
router.get('/:code', async (c) => {
  const code = c.req.param('code')
  const db = c.env.DB

  const plan = await db.prepare(
    "SELECT * FROM plans WHERE code = ? AND status = 'active'"
  ).bind(code).first()

  if (!plan) {
    return c.json({ code: 40400, message: '套餐不存在' }, 404)
  }

  return c.json({ data: plan })
})

export default router
