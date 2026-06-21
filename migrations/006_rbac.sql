-- 迁移 006: RBAC 角色权限矩阵
-- 说明: 落地 P0 缺陷 #8（现有 RBAC 形同虚设），建立角色-权限点关系

-- 角色定义
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,           -- super_admin / admin / finance / operator / viewer
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_system INTEGER DEFAULT 0,         -- 1=系统内置不可删
  created_at TEXT DEFAULT (datetime('now'))
);

-- 权限点字典
CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,           -- 如 order:confirm
  name TEXT NOT NULL,
  module TEXT NOT NULL,                -- user / order / license / plan / analytics / config / audit / system / channel
  description TEXT DEFAULT ''
);

-- 角色-权限关联
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ============ 种子: 角色 ============
INSERT OR IGNORE INTO roles (code, name, description, is_system) VALUES
  ('super_admin', '超级管理员', '拥有全部权限，系统内置', 1),
  ('admin',       '运营管理员', '除角色/管理员管理外的全部业务权限', 1),
  ('finance',     '财务',       '订单/退款/对账/发票，无授权与配置权限', 1),
  ('operator',    '客服',       '用户查看 + 工单 + 公告，只读其余', 1),
  ('viewer',      '只读',       '全量只读，无任何写权限', 1);

-- ============ 种子: 权限点 ============
-- 仪表盘
INSERT OR IGNORE INTO permissions (code, name, module) VALUES
  ('dashboard:read', '查看仪表盘', 'dashboard');

-- 账户域
INSERT OR IGNORE INTO permissions (code, name, module) VALUES
  ('user:read',       '查看用户', 'user'),
  ('user:update',     '编辑用户', 'user'),
  ('user:block',      '启用/禁用用户', 'user'),
  ('user:reset_pwd',  '重置用户密码', 'user'),
  ('user:tag',        '管理用户标签', 'user'),
  ('user:batch',      '批量操作用户', 'user'),
  ('user:export',     '导出用户', 'user');

-- 商品域
INSERT OR IGNORE INTO permissions (code, name, module) VALUES
  ('plan:read',    '查看套餐', 'plan'),
  ('plan:create',  '创建套餐', 'plan'),
  ('plan:update',  '编辑套餐', 'plan'),
  ('plan:toggle',  '套餐上下架', 'plan'),
  ('plan:version', '管理套餐价格版本', 'plan'),
  ('plan:feature', '管理功能开关库', 'plan'),
  ('promo:manage', '管理优惠券', 'plan');

-- 交易域
INSERT OR IGNORE INTO permissions (code, name, module) VALUES
  ('order:read',      '查看订单', 'order'),
  ('order:confirm',   '手动确认收款', 'order'),
  ('order:cancel',    '取消订单', 'order'),
  ('order:price',     '订单改价', 'order'),
  ('order:refund',    '订单退款', 'order'),
  ('order:export',    '导出订单', 'order'),
  ('order:reconcile', '对账', 'order'),
  ('invoice:manage',  '发票管理', 'order');

-- 授权域
INSERT OR IGNORE INTO permissions (code, name, module) VALUES
  ('license:read',    '查看授权', 'license'),
  ('license:create',  '创建授权', 'license'),
  ('license:batch',   '批量生成授权', 'license'),
  ('license:extend',  '延长授权有效期', 'license'),
  ('license:revoke',  '吊销授权', 'license'),
  ('license:upgrade', '授权升降级', 'license'),
  ('license:policy',  '管理授权策略', 'license'),
  ('instance:monitor','查看激活实例', 'license'),
  ('instance:manage', '强制下线实例', 'license');

-- 数据域
INSERT OR IGNORE INTO permissions (code, name, module) VALUES
  ('analytics:read',  '查看数据分析', 'analytics'),
  ('analytics:export','导出分析报表', 'analytics');

-- 基础设施域
INSERT OR IGNORE INTO permissions (code, name, module) VALUES
  ('admin:read',      '查看管理员', 'system'),
  ('admin:manage',    '管理管理员', 'system'),
  ('role:read',       '查看角色', 'system'),
  ('role:manage',     '管理角色权限', 'system'),
  ('config:system',   '系统配置', 'config'),
  ('config:payment',  '支付配置', 'config'),
  ('config:notify',   '通知配置', 'config'),
  ('audit:read',      '查看审计日志', 'config'),
  ('system:monitor',  '系统监控', 'config');

-- 运营域
INSERT OR IGNORE INTO permissions (code, name, module) VALUES
  ('notice:manage',    '管理公告', 'operation'),
  ('notify:template',  '管理通知模板', 'operation'),
  ('ticket:manage',    '管理工单', 'operation');

-- 渠道域
INSERT OR IGNORE INTO permissions (code, name, module) VALUES
  ('channel:manage',    '管理渠道商', 'channel'),
  ('channel:link',      '生成推广链接', 'channel'),
  ('channel:commission','管理佣金', 'channel'),
  ('channel:settle',    '佣金结算', 'channel');

-- ============ 种子: 角色-权限映射 ============
-- helper: 通过子查询关联，避免硬编码 id
-- super_admin: 全部权限
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.code = 'super_admin';

-- admin: 除 role:manage / admin:manage 外的全部
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p
  WHERE r.code = 'admin'
    AND p.code NOT IN ('role:manage', 'admin:manage');

-- finance: 订单/退款/对账/发票 + 仪表盘 + 只读用户/授权/分析
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p
  WHERE r.code = 'finance'
    AND p.code IN (
      'dashboard:read',
      'user:read', 'order:read', 'order:confirm', 'order:cancel', 'order:price',
      'order:refund', 'order:export', 'order:reconcile', 'invoice:manage',
      'license:read', 'analytics:read', 'analytics:export'
    );

-- operator: 只读全量 + 工单/公告 + 用户只读
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p
  WHERE r.code = 'operator'
    AND (p.code LIKE '%:read' OR p.code IN ('notice:manage', 'notify:template', 'ticket:manage'));

-- viewer: 全部只读权限
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p
  WHERE r.code = 'viewer' AND p.code LIKE '%:read';

-- ============ 同步: 既有 admin.role 字段值校准 ============
-- 旧 admins 表 role 文本可能是 super_admin/admin；本迁移不改动既有数据，
-- 后端 RBAC 中间件对 role 文本做白名单映射，未命中权限点的角色一律按 viewer 兜底。
