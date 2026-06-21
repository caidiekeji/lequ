-- 迁移 005: 管理员操作审计日志 + 登录日志
-- 说明: 补建 P0 缺陷，所有管理员高危操作必须落审计；含哈希链防篡改

-- 管理员操作审计（哈希链防篡改，算法同 license_audit_logs）
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER,
  admin_username TEXT,
  action TEXT NOT NULL,            -- 如 order.confirm / license.revoke / config.payment.update
  target_type TEXT,                -- order / license / user / plan / config / admin / role
  target_id INTEGER,
  detail TEXT DEFAULT '{}',        -- 操作前后值 JSON
  prev_hash TEXT,
  row_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);

-- 登录日志（管理员 + 用户）
CREATE TABLE IF NOT EXISTS login_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_type TEXT NOT NULL,      -- admin / user
  account TEXT NOT NULL,
  ip TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  status TEXT NOT NULL,            -- success / failed / locked
  reason TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_logs_account ON login_logs(account_type, account);
CREATE INDEX IF NOT EXISTS idx_login_logs_status ON login_logs(status);
CREATE INDEX IF NOT EXISTS idx_login_logs_created ON login_logs(created_at);
