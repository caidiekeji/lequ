-- 迁移 011: 授权策略 + 升级记录
-- 说明: 支持灵活配置 bind_mode / 离线宽限期 / 心跳周期；记录授权升降级历史

CREATE TABLE IF NOT EXISTS license_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  bind_mode TEXT DEFAULT 'strict',
  offline_grace_days INTEGER DEFAULT 7,
  heartbeat_period_minutes INTEGER DEFAULT 30,
  heartbeat_fail_threshold INTEGER DEFAULT 3,
  description TEXT
);

CREATE TABLE IF NOT EXISTS license_upgrades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_id INTEGER NOT NULL REFERENCES licenses(id),
  from_edition TEXT,
  to_edition TEXT,
  order_id INTEGER REFERENCES orders(id),
  price_diff INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_license_upgrades_license ON license_upgrades(license_id);

-- 默认策略
INSERT OR IGNORE INTO license_policies (name, bind_mode, offline_grace_days, heartbeat_period_minutes, heartbeat_fail_threshold, description)
VALUES ('默认策略', 'strict', 7, 30, 3, '硬件指纹严格绑定，离线宽限7天，心跳间隔30分钟');
