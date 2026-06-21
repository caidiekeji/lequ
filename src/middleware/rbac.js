/**
 * RBAC 权限中间件
 *
 * 修复缺陷 #8（管理后台 RBAC 形同虚设）。
 * 与 authenticate 中间件配合使用：authenticate 解析 JWT 并 set('admin')，
 * requirePermission(code) 进一步校验当前 admin 角色是否拥有指定权限点。
 *
 * 权限来源：roles / permissions / role_permissions 三张表。
 * 缓存：单请求内缓存角色权限集合到 c.var.__rolePerms，避免重复查询 D1。
 */

import { verifyJWT } from '../utils.js'

// 角色 → 兜底权限（迁移前的老 admins.role 值可能未在 roles 表登记）
// super_admin 默认放行全部，其余未登记角色按 viewer 兜底（仅 :read）。
const ROLE_FALLBACK = {
  super_admin: '*',
}

/**
 * 取当前请求 admin 的角色 code（已由 authenticate 写入 c.var.admin.role）
 */
function getRoleCode(c) {
  const admin = c.get('admin')
  return admin ? admin.role : null
}

/**
 * 加载某角色的权限点集合（含缓存）
 * @returns {Promise<Set<string>>} 权限 code 集合；'*' 表示全部
 */
async function loadRolePermissions(c, roleCode) {
  if (!roleCode) return new Set()
  if (ROLE_FALLBACK[roleCode] === '*') return new Set(['*'])

  // 请求级缓存
  if (c.var.__rolePerms && c.var.__rolePerms.has(roleCode)) {
    return c.var.__rolePerms.get(roleCode)
  }

  const db = c.env.DB
  let permsSet = new Set()
  try {
    const rows = await db.prepare(
      `SELECT p.code FROM permissions p
       INNER JOIN role_permissions rp ON rp.permission_id = p.id
       INNER JOIN roles r ON r.id = rp.role_id
       WHERE r.code = ?`
    ).bind(roleCode).all()
    permsSet = new Set((rows.results || []).map(r => r.code))
  } catch (e) {
    // 表未就绪 / 查询失败 → 保守起见按空集合（拒绝），避免误放行
    console.error('[RBAC] loadRolePermissions failed:', e.message)
  }

  if (!c.var.__rolePerms) c.set('__rolePerms', new Map())
  c.var.__rolePerms.set(roleCode, permsSet)
  return permsSet
}

/**
 * 要求当前管理员拥有指定权限点，否则 403
 * @param {string} code - 权限 code，如 'order:confirm'
 */
export function requirePermission(code) {
  return async (c, next) => {
    const admin = c.get('admin')
    if (!admin) {
      return c.json({ code: 40100, message: '未登录' }, 401)
    }

    const perms = await loadRolePermissions(c, admin.role)

    // 通配放行
    if (perms.has('*') || perms.has(code)) {
      return next()
    }

    // 兜底：未配置权限的角色（如 roles 表为空时的老管理员），
    // super_admin 放行；其余一律拒绝写操作（非 :read/:export）。
    if (admin.role === 'super_admin') return next()

    return c.json({ code: 40300, message: `无操作权限（需要 ${code}）` }, 403)
  }
}

/**
 * 要求指定角色（如仅 super_admin），否则 403
 */
export function requireRole(...roles) {
  return async (c, next) => {
    const admin = c.get('admin')
    if (!admin) return c.json({ code: 40100, message: '未登录' }, 401)
    if (!roles.includes(admin.role)) {
      return c.json({ code: 40300, message: '无操作权限' }, 403)
    }
    return next()
  }
}

/**
 * 判断当前 admin 是否拥有某权限（供路由内分支判断，不返回响应）
 */
export async function hasPermission(c, code) {
  const admin = c.get('admin')
  if (!admin) return false
  if (admin.role === 'super_admin') return true
  const perms = await loadRolePermissions(c, admin.role)
  return perms.has('*') || perms.has(code)
}
