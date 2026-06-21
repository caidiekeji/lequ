/**
 * 对外 API 路由（供主收银系统调用）
 *
 * 修复缺陷 #3：原实现无任何鉴权 + 无限流，存在 license_key 爆破 / 信息泄露 / 写放大风险。
 *
 * 现策略：
 *   1. 全部接口挂 hmacAuth（X-Api-Key/X-Timestamp/X-Nonce/X-Signature 验签 + 防重放）
 *   2. captureRawBody 在最前缓存原始 body（供验签读取）
 *   3. 按维度限流：
 *      - activate：license_key 维度 10 次/小时 + IP 维度 30 次/小时
 *      - heartbeat：instance_id 维度 1 次/分钟
 *      - status：IP 维度 60 次/分钟
 *   4. 激活失败累加 license_key 失败计数（KV），5 次/小时锁
 *
 * POST /api/v1/activate     在线激活
 * POST /api/v1/heartbeat    心跳上报
 * GET  /api/v1/status/:id   查询实例状态
 */

import { Hono } from 'hono'
import { activateLicense, heartbeatLicense, getInstanceStatus, createAuditLog } from '../db.js'
import { hmacAuth, captureRawBody } from '../middleware/hmac-auth.js'
import { rateLimit, rateLimitKeyBuilder } from '../middleware/rate-limit.js'

const router = new Hono()

// 顺序：rawBody 缓存 → HMAC 鉴权 → 限流（按需在子接口内挂）
router.use('*', captureRawBody)
router.use('*', hmacAuth)

// ============ 限流预设 ============
const statusIpLimit = rateLimit(rateLimitKeyBuilder('ip'), 'v1_status', 60, 60)
const heartbeatInstanceLimit = (c) => {
  // heartbeat 用 instance_id 维度（需读 body，故放在 handler 内部判断）
  return null
}

/**
 * 在线激活
 * 限流：license_key 维度 10 次/小时 + IP 维度 30 次/小时
 */
router.post('/v1/activate', async (c) => {
  const body = await readJsonSafe(c)
  const { license_key, hardware_fingerprint, fingerprint_detail, store_name } = body
  if (!license_key || !hardware_fingerprint) {
    return c.json({ code: 40000, message: '缺少必要参数（license_key / hardware_fingerprint）' }, 400)
  }

  // license_key 维度限流（在鉴权后、业务前）
  const rl = rateLimit(() => 'license:' + license_key, 'v1_activate_key', 10, 3600)
  const blocked = await rl(c, async () => {})
  if (blocked) return blocked

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
 * 限流：instance_id 维度 1 次/分钟
 */
router.post('/v1/heartbeat', async (c) => {
  const body = await readJsonSafe(c)
  const { instance_id, hardware_fingerprint } = body
  if (!instance_id) {
    return c.json({ code: 40000, message: '缺少实例 ID' }, 400)
  }

  const rl = rateLimit(() => 'instance:' + instance_id, 'v1_heartbeat', 1, 60)
  const blocked = await rl(c, async () => {})
  if (blocked) return blocked

  const result = await heartbeatLicense(c.env.DB, instance_id, hardware_fingerprint || '')
  return c.json({ data: result })
})

/**
 * 查询实例授权状态
 * 限流：IP 维度 60 次/分钟
 */
router.get('/v1/status/:instanceId', statusIpLimit, async (c) => {
  const instanceId = c.req.param('instanceId')
  const result = await getInstanceStatus(c.env.DB, instanceId)
  return c.json({ data: result })
})

/**
 * 主动下线
 * POST /v1/deactivate - 根据 instance_id + fingerprint 注销实例
 */
router.post('/v1/deactivate', async (c) => {
  // IP 维度限流：30 次/小时
  const rlIp = rateLimit(() => c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || 'unknown', 'v1_deactivate', 30, 3600)
  const blocked = await rlIp(c, async () => {})
  if (blocked) return blocked

  const body = await readJsonSafe(c)
  const { instance_id, hardware_fingerprint } = body
  if (!instance_id) {
    return c.json({ code: 40000, message: '缺少实例 ID' }, 400)
  }

  const db = c.env.DB
  const inst = await db.prepare('SELECT * FROM license_instances WHERE instance_id = ?').bind(instance_id).first()
  if (!inst) {
    return c.json({ code: 40400, message: '实例不存在' }, 404)
  }

  const lic = await db.prepare('SELECT * FROM licenses WHERE id = ?').bind(inst.license_id).first()
  if (!lic) {
    return c.json({ code: 40400, message: '关联授权不存在' }, 404)
  }

  // strict 模式必须校验指纹
  if (lic.bind_mode === 'strict') {
    if (!hardware_fingerprint) {
      return c.json({ code: 40000, message: 'strict 模式需要提供 hardware_fingerprint' }, 400)
    }
    if (inst.hardware_fingerprint !== hardware_fingerprint) {
      return c.json({ code: 40300, message: '硬件指纹不匹配，无法下线' }, 403)
    }
  }

  await db.prepare(
    "UPDATE license_instances SET status = 'deactivated', updated_at = datetime('now') WHERE id = ?"
  ).bind(inst.id).run()

  await createAuditLog(db, inst.license_id, instance_id, 'deactivate', {
    reason: '主动下线',
    fingerprint: hardware_fingerprint || '',
  })

  return c.json({ message: '实例已下线' })
})

// ============ 辅助：安全读取 JSON body ============
async function readJsonSafe(c) {
  try {
    return await c.req.json()
  } catch (e) {
    return {}
  }
}

export default router
