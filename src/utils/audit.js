/**
 * 管理员操作审计工具（哈希链防篡改）
 *
 * 修复缺陷 #9：管理后台高危操作无任何审计痕迹。
 *
 * 算法与 license_audit_logs 一致：
 *   row_hash = sha256(prev_hash + action + timestamp + detail_json + target_id + admin_id)
 * 任何对历史记录的篡改都会导致后续 row_hash 校验失败。
 *
 * 用法：
 *   await logAdminAction(c, 'order.confirm', 'order', orderId, { amount, before_status })
 */

import { sha256 } from '../utils.js'
import { getAdmin, getRequestIp, getRequestUa } from '../middleware/admin-auth.js'

/**
 * 写一条管理员操作审计日志
 * @param {Context} c - Hono context（用于读 admin/IP/UA/DB/env）
 * @param {string} action - 操作 code，如 'order.confirm' / 'license.revoke'
 * @param {string} targetType - 资源类型，如 'order' / 'license' / 'user' / 'config'
 * @param {number|string} [targetId] - 资源 ID
 * @param {Object} [detail={}] - 操作细节（前后值等），JSON 序列化存储
 */
export async function logAdminAction(c, action, targetType, targetId, detail = {}) {
  const db = c.env && c.env.DB
  if (!db) return

  const admin = getAdmin(c) || {}
  const ip = getRequestIp(c)
  const ua = getRequestUa(c)

  try {
    // 取上一条记录的 hash 作为 prev_hash
    const prev = await db.prepare(
      'SELECT row_hash FROM admin_logs ORDER BY id DESC LIMIT 1'
    ).first()
    const prevHash = prev ? prev.row_hash : 'GENESIS'

    const timestamp = new Date().toISOString()
    const detailStr = JSON.stringify(detail)
    const hashInput = prevHash + action + timestamp + detailStr + String(targetId ?? '') + String(admin.id ?? '')
    const rowHash = await sha256(hashInput)

    await db.prepare(
      `INSERT INTO admin_logs (admin_id, admin_username, action, target_type, target_id, detail, prev_hash, row_hash, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      admin.id ?? null,
      admin.username ?? null,
      action,
      targetType || null,
      targetId ?? null,
      detailStr,
      prevHash,
      rowHash,
      ip,
      ua
    ).run()
  } catch (e) {
    // 审计写入失败不应阻断主流程，仅记录错误
    console.error('[audit] logAdminAction failed:', e.message)
  }
}

/**
 * 写一条登录日志
 * @param {Context} c
 * @param {'admin'|'user'} accountType
 * @param {string} account - 账号
 * @param {'success'|'failed'|'locked'} status
 * @param {string} [reason]
 */
export async function logLogin(c, accountType, account, status, reason = '') {
  const db = c.env && c.env.DB
  if (!db) return
  try {
    const ip = getRequestIp(c)
    const ua = getRequestUa(c)
    await db.prepare(
      'INSERT INTO login_logs (account_type, account, ip, user_agent, status, reason) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(accountType, account, ip, ua, status, reason).run()
  } catch (e) {
    console.error('[audit] logLogin failed:', e.message)
  }
}
