/**
 * D1 数据库辅助模块
 * 封装常用查询方法、初始化逻辑、审计日志创建。
 */

import { sha256, generateLicenseKey } from '../utils.js'

/**
 * 初始化数据库：创建默认管理员账号
 * @param {D1Database} db - D1 数据库实例
 * @param {Object} env - 环境变量
 */
export async function initDatabase(db, env) {
  // 检查是否需要创建管理员
  const adminCount = await db.prepare('SELECT COUNT(*) as cnt FROM admins').first()
  if (adminCount.cnt === 0) {
    const { hashPassword } = await import('../utils.js')
    const passwordHash = await hashPassword(env.ADMIN_PASSWORD || 'admin123')
    await db.prepare(
      "INSERT INTO admins (username, password_hash, role) VALUES (?, ?, 'super_admin')"
    ).bind('admin', passwordHash).run()
    console.log('[Init] 默认管理员已创建: admin')
  }
}

// ==================== 授权码管理 ====================

/**
 * 创建授权码
 * @param {D1Database} db
 * @param {Object} data - 授权信息
 */
export async function createLicense(db, data) {
  const edition = EDITIONS[data.product_edition] || EDITIONS.basic

  // 生成唯一授权码
  let licenseKey
  let exists = true
  while (exists) {
    licenseKey = generateLicenseKey()
    const check = await db.prepare('SELECT id FROM licenses WHERE license_key = ?').bind(licenseKey).first()
    exists = !!check
  }

  const validFrom = new Date()
  const validUntil = new Date(validFrom.getTime() + data.valid_days * 24 * 60 * 60 * 1000)
  const features = JSON.stringify(data.features || edition.features)
  const maxTerminals = data.max_terminals ?? edition.max_terminals
  const maxProducts = data.max_products ?? edition.max_products
  const maxMembers = data.max_members ?? edition.max_members

  const result = await db.prepare(`
    INSERT INTO licenses (license_key, product_edition, max_stores, max_terminals,
      max_products, max_members, features, bind_mode, valid_from, valid_until, note, customer_name, customer_contact, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    RETURNING *
  `).bind(
    licenseKey, data.product_edition, data.max_stores || 1, maxTerminals,
    maxProducts, maxMembers, features, data.bind_mode || 'strict',
    validFrom.toISOString(), validUntil.toISOString(),
    data.note || '', data.customer_name || '', data.customer_contact || ''
  ).first()

  return result
}

// ==================== 对外 API ====================

/**
 * 在线激活授权
 */
export async function activateLicense(db, licenseKey, hardwareFingerprint, fingerprintDetail, storeName) {
  const lic = await db.prepare('SELECT * FROM licenses WHERE license_key = ?').bind(licenseKey).first()
  if (!lic) {
    return { error: true, code: 40001, message: '授权码无效', status: 400 }
  }

  if (lic.status === 'revoked') {
    return { error: true, code: 40301, message: '该授权码已被吊销', status: 403 }
  }

  const now = new Date()
  if (lic.valid_until && new Date(lic.valid_until) < now) {
    await db.prepare("UPDATE licenses SET status = 'expired', updated_at = datetime('now') WHERE id = ?").bind(lic.id).run()
    return { error: true, code: 40302, message: '该授权码已过期', status: 403 }
  }

  // 检查激活次数
  const count = await db.prepare(
    "SELECT COUNT(*) as cnt FROM license_instances WHERE license_id = ? AND status = 'active'"
  ).bind(lic.id).first()
  if (lic.max_stores > 0 && count.cnt >= lic.max_stores) {
    return { error: true, code: 40303, message: `激活次数已达上限（${lic.max_stores}）`, status: 403 }
  }

  const instanceId = crypto.randomUUID()
  const nowISO = new Date().toISOString()

  await db.prepare(`
    INSERT INTO license_instances (license_id, instance_id, store_name,
      hardware_fingerprint, fingerprint_detail, activated_at, last_heartbeat, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).bind(
    lic.id, instanceId, storeName, hardwareFingerprint,
    JSON.stringify(fingerprintDetail), nowISO, nowISO
  ).run()

  await createAuditLog(db, lic.id, instanceId, 'activate', {
    store_name: storeName, fingerprint: hardwareFingerprint
  })

  return {
    license_id: lic.id,
    instance_id: instanceId,
    product_edition: lic.product_edition,
    features: JSON.parse(lic.features || '[]'),
    max_terminals: lic.max_terminals,
    max_products: lic.max_products,
    max_members: lic.max_members,
    valid_from: lic.valid_from,
    valid_until: lic.valid_until,
    bind_mode: lic.bind_mode,
  }
}

/**
 * 心跳上报
 */
export async function heartbeatLicense(db, instanceId, hardwareFingerprint) {
  const inst = await db.prepare('SELECT * FROM license_instances WHERE instance_id = ?').bind(instanceId).first()
  if (!inst) {
    return { success: false, message: '实例不存在' }
  }

  const lic = await db.prepare('SELECT * FROM licenses WHERE id = ?').bind(inst.license_id).first()
  if (!lic || lic.status === 'revoked') {
    await db.prepare("UPDATE license_instances SET status = 'revoked', updated_at = datetime('now') WHERE id = ?").bind(inst.id).run()
    return { success: false, status: 'revoked', message: '授权已被停用' }
  }

  if (lic.bind_mode === 'strict' && inst.hardware_fingerprint !== hardwareFingerprint) {
    return { success: false, status: 'fingerprint_mismatch', message: '硬件指纹不匹配，请重新激活' }
  }

  await db.prepare(
    "UPDATE license_instances SET last_heartbeat = datetime('now') WHERE id = ?"
  ).bind(inst.id).run()

  return { success: true }
}

/**
 * 查询实例状态
 */
export async function getInstanceStatus(db, instanceId) {
  const inst = await db.prepare(`
    SELECT li.*, l.license_key, l.product_edition, l.features, l.max_terminals,
      l.max_products, l.max_members, l.valid_from, l.valid_until, l.bind_mode, l.status as license_status
    FROM license_instances li
    LEFT JOIN licenses l ON li.license_id = l.id
    WHERE li.instance_id = ?
  `).bind(instanceId).first()

  if (!inst) return { activated: false, message: '实例不存在' }
  if (inst.license_status === 'revoked') return { activated: false, status: 'revoked', message: '授权已被停用' }

  return {
    activated: true,
    instance_id: inst.instance_id,
    store_name: inst.store_name,
    product_edition: inst.product_edition,
    features: JSON.parse(inst.features || '[]'),
    max_terminals: inst.max_terminals,
    max_products: inst.max_products,
    max_members: inst.max_members,
    valid_until: inst.valid_until,
    last_heartbeat: inst.last_heartbeat,
    status: inst.status,
  }
}

// ==================== 管理后台 API ====================

/**
 * 获取授权码列表（分页）
 */
export async function getLicenseList(db, { page = 1, pageSize = 20, status, keyword } = {}) {
  const conditions = []
  const params = []

  if (status) {
    conditions.push('l.status = ?')
    params.push(status)
  }
  if (keyword) {
    conditions.push('(l.license_key LIKE ? OR l.note LIKE ? OR l.customer_name LIKE ?)')
    const kw = '%' + keyword + '%'
    params.push(kw, kw, kw)
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  const offset = (page - 1) * pageSize

  const totalResult = await db.prepare('SELECT COUNT(*) as cnt FROM licenses l ' + where).bind(...params).first()
  const total = totalResult.cnt

  const list = await db.prepare(`
    SELECT l.*, COUNT(li.id) as instance_count
    FROM licenses l
    LEFT JOIN license_instances li ON li.license_id = l.id
    ${where}
    GROUP BY l.id
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, pageSize, offset).all()

  return { list: list.results, total }
}

/**
 * 获取授权码详情
 */
export async function getLicenseDetail(db, id) {
  const lic = await db.prepare('SELECT * FROM licenses WHERE id = ?').bind(id).first()
  if (!lic) return null

  const instances = await db.prepare(
    'SELECT * FROM license_instances WHERE license_id = ? ORDER BY created_at DESC'
  ).bind(id).all()

  const auditLogs = await db.prepare(
    'SELECT * FROM license_audit_logs WHERE license_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(id).all()

  return { ...lic, instances: instances.results, audit_logs: auditLogs.results }
}

/**
 * 吊销授权码
 */
export async function revokeLicense(db, id) {
  const lic = await db.prepare('SELECT * FROM licenses WHERE id = ?').bind(id).first()
  if (!lic) return { error: true, message: '授权码不存在' }

  await db.prepare("UPDATE licenses SET status = 'revoked', updated_at = datetime('now') WHERE id = ?").bind(id).run()
  await db.prepare("UPDATE license_instances SET status = 'revoked', updated_at = datetime('now') WHERE license_id = ?").bind(id).run()

  const instances = await db.prepare('SELECT instance_id FROM license_instances WHERE license_id = ?').bind(id).all()
  for (const inst of instances.results) {
    await createAuditLog(db, id, inst.instance_id, 'revoke', { reason: '管理员吊销' })
  }
  return { success: true }
}

/**
 * 仪表盘统计
 */
export async function getDashboardStats(db) {
  const totalLicenses = await db.prepare('SELECT COUNT(*) as cnt FROM licenses').first().then(r => r.cnt)
  const activeLicenses = await db.prepare("SELECT COUNT(*) as cnt FROM licenses WHERE status = 'active'").first().then(r => r.cnt)
  const totalInstances = await db.prepare('SELECT COUNT(*) as cnt FROM license_instances').first().then(r => r.cnt)
  const activeInstances = await db.prepare("SELECT COUNT(*) as cnt FROM license_instances WHERE status = 'active'").first().then(r => r.cnt)
  const todayActivations = await db.prepare(
    "SELECT COUNT(*) as cnt FROM license_instances WHERE date(activated_at) = date('now')"
  ).first().then(r => r.cnt)
  const weeklyActivations = await db.prepare(
    "SELECT COUNT(*) as cnt FROM license_instances WHERE activated_at >= datetime('now', '-7 days')"
  ).first().then(r => r.cnt)
  const editionStats = await db.prepare(
    'SELECT product_edition, COUNT(*) as cnt FROM licenses GROUP BY product_edition ORDER BY cnt DESC'
  ).all()

  return {
    total_licenses: totalLicenses,
    active_licenses: activeLicenses,
    total_instances: totalInstances,
    active_instances: activeInstances,
    today_activations: todayActivations,
    weekly_activations: weeklyActivations,
    edition_stats: editionStats.results,
  }
}

// ==================== 审计日志 ====================

/**
 * 创建审计日志（哈希链防篡改）
 */
async function createAuditLog(db, licenseId, instanceId, action, detail) {
  const prev = await db.prepare(
    'SELECT row_hash FROM license_audit_logs ORDER BY id DESC LIMIT 1'
  ).first()
  const prevHash = prev ? prev.row_hash : 'GENESIS'

  const timestamp = new Date().toISOString()
  const detailStr = JSON.stringify(detail)
  const hashInput = prevHash + action + timestamp + detailStr + instanceId + String(licenseId)
  const rowHash = await sha256(hashInput)

  await db.prepare(`
    INSERT INTO license_audit_logs (license_id, instance_id, action, detail, prev_hash, row_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(licenseId, instanceId, action, detailStr, prevHash, rowHash, timestamp).run()
}

// ==================== 版本定义 ====================

const EDITIONS = {
  basic: { name: '基础版', max_terminals: 1, max_products: 5000, max_members: 2000, features: ['base'] },
  standard: { name: '标准版', max_terminals: 3, max_products: 10000, max_members: 5000, features: ['base', 'member', 'promotion'] },
  premium: { name: '高级版', max_terminals: 10, max_products: 50000, max_members: 20000, features: ['base', 'member', 'promotion', 'report', 'stock', 'supplier'] },
  enterprise: { name: '企业版', max_terminals: -1, max_products: -1, max_members: -1, features: ['*'] },
}