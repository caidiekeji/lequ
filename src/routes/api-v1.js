/**
 * 对外 API 路由（供主收银系统调用，无需认证）
 * POST /api/v1/activate     - 在线激活
 * POST /api/v1/heartbeat     - 心跳上报
 * GET  /api/v1/status/:id    - 查询实例状态
 */

import { Hono } from 'hono'
import { activateLicense, heartbeatLicense, getInstanceStatus } from '../db.js'

const router = new Hono()

/**
 * 在线激活授权
 */
router.post('/v1/activate', async (c) => {
  const { license_key, hardware_fingerprint, fingerprint_detail, store_name } = await c.req.json()
  if (!license_key || !hardware_fingerprint) {
    return c.json({ code: 40000, message: '缺少必要参数' }, 400)
  }

  const result = await activateLicense(
    c.env.DB,
    license_key,
    hardware_fingerprint,
    fingerprint_detail || {},
    store_name || '默认门店'
  )

  if (result.error) {
    return c.json({ code: result.code, message: result.message }, result.status)
  }

  return c.json({ data: result })
})

/**
 * 心跳上报
 */
router.post('/v1/heartbeat', async (c) => {
  const { instance_id, hardware_fingerprint } = await c.req.json()
  if (!instance_id) {
    return c.json({ code: 40000, message: '缺少实例 ID' }, 400)
  }

  const result = await heartbeatLicense(c.env.DB, instance_id, hardware_fingerprint || '')
  return c.json({ data: result })
})

/**
 * 查询实例授权状态
 */
router.get('/v1/status/:instanceId', async (c) => {
  const instanceId = c.req.param('instanceId')
  const result = await getInstanceStatus(c.env.DB, instanceId)
  return c.json({ data: result })
})

export default router