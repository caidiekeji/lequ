/**
 * 授权码管理路由（管理后台 API，需 JWT 认证）
 */

import { Hono } from 'hono'
import { authenticate } from '../middleware/auth.js'
import {
  createLicense,
  getLicenseList,
  getLicenseDetail,
  revokeLicense,
  getDashboardStats,
} from '../db.js'

const router = new Hono()

// 所有管理接口需 JWT 认证
router.use('*', authenticate)

/**
 * 仪表盘统计
 * GET /api/dashboard
 */
router.get('/dashboard', async (c) => {
  const stats = await getDashboardStats(c.env.DB)
  return c.json({ data: stats })
})

/**
 * 获取授权码列表
 * GET /api/licenses
 */
router.get('/licenses', async (c) => {
  const { page, pageSize, status, keyword } = c.req.query()
  const result = await getLicenseList(c.env.DB, {
    page: parseInt(page) || 1,
    pageSize: parseInt(pageSize) || 20,
    status,
    keyword,
  })
  return c.json({ data: result })
})

/**
 * 创建授权码
 * POST /api/licenses
 */
router.post('/licenses', async (c) => {
  const body = await c.req.json()
  const { product_edition, valid_days } = body
  if (!product_edition || !valid_days) {
    return c.json({ code: 40000, message: '缺少必要参数（产品版本、有效天数）' }, 400)
  }

  const result = await createLicense(c.env.DB, {
    product_edition,
    valid_days: parseInt(valid_days),
    max_stores: body.max_stores,
    max_terminals: body.max_terminals,
    max_products: body.max_products,
    max_members: body.max_members,
    features: body.features,
    note: body.note,
    customer_name: body.customer_name,
    customer_contact: body.customer_contact,
    bind_mode: body.bind_mode,
  })

  return c.json({ data: result, message: '授权码创建成功' })
})

/**
 * 获取授权码详情
 * GET /api/licenses/:id
 */
router.get('/licenses/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const result = await getLicenseDetail(c.env.DB, id)
  if (!result) {
    return c.json({ code: 40400, message: '授权码不存在' }, 404)
  }
  return c.json({ data: result })
})

/**
 * 吊销授权码
 * POST /api/licenses/:id/revoke
 */
router.post('/licenses/:id/revoke', async (c) => {
  const id = parseInt(c.req.param('id'))
  const result = await revokeLicense(c.env.DB, id)
  if (result.error) {
    return c.json({ code: 40400, message: result.message }, 404)
  }
  return c.json({ data: result, message: '授权码已吊销' })
})

export default router