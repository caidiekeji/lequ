-- 授权系统初始迁移 (D1 / SQLite)
-- 迁移编号: 001
-- 说明: 创建管理员表、授权码表、激活实例表、审计日志表

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  status TEXT DEFAULT 'active',
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- 授权码主表
CREATE TABLE IF NOT EXISTS licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_key TEXT NOT NULL UNIQUE,
  product_edition TEXT DEFAULT 'basic',
  max_stores INTEGER DEFAULT 1,
  max_terminals INTEGER DEFAULT 1,
  max_products INTEGER DEFAULT 5000,
  max_members INTEGER DEFAULT 2000,
  features TEXT DEFAULT '[]',
  bind_mode TEXT DEFAULT 'strict',
  valid_from TEXT,
  valid_until TEXT,
  status TEXT DEFAULT 'active',
  note TEXT DEFAULT '',
  customer_name TEXT DEFAULT '',
  customer_contact TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- 授权实例表
CREATE TABLE IF NOT EXISTS license_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_id INTEGER REFERENCES licenses(id),
  instance_id TEXT NOT NULL UNIQUE,
  store_name TEXT NOT NULL,
  hardware_fingerprint TEXT NOT NULL,
  fingerprint_detail TEXT DEFAULT '{}',
  activated_at TEXT,
  last_heartbeat TEXT,
  offline_expire_at TEXT,
  heartbeat_fail_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- 审计日志表（哈希链防篡改）
CREATE TABLE IF NOT EXISTS license_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_id INTEGER,
  instance_id TEXT,
  action TEXT NOT NULL,
  detail TEXT DEFAULT '{}',
  prev_hash TEXT,
  row_hash TEXT,
  created_at TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_instances_instance_id ON license_instances(instance_id);
CREATE INDEX IF NOT EXISTS idx_instances_license_id ON license_instances(license_id);
CREATE INDEX IF NOT EXISTS idx_instances_status ON license_instances(status);
CREATE INDEX IF NOT EXISTS idx_audit_license_id ON license_audit_logs(license_id);