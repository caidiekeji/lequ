-- 迁移 012: 运营域表（公告 + 通知模板 + 工单）
-- 说明: 站内公告、邮件/短信模板、客服工单

CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_type TEXT DEFAULT 'all',
  target_value TEXT,
  is_pinned INTEGER DEFAULT 0,
  publish_at TEXT,
  expire_at TEXT,
  status TEXT DEFAULT 'draft',
  created_by INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_publish ON notices(publish_at);

CREATE TABLE IF NOT EXISTS notify_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables TEXT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS notify_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_code TEXT,
  channel TEXT,
  target TEXT,
  user_id INTEGER,
  status TEXT,
  error_msg TEXT,
  content_snapshot TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notify_logs_user ON notify_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notify_logs_status ON notify_logs(status);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  assignee_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);

CREATE TABLE IF NOT EXISTS ticket_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  from_type TEXT NOT NULL,
  from_id INTEGER,
  content TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON ticket_replies(ticket_id);

-- 默认通知模板
INSERT OR IGNORE INTO notify_templates (code, channel, subject, content, variables) VALUES
  ('license_expiring', 'email', '授权即将到期', '您的授权码 {{license_key}} 将于 {{valid_until}} 到期，请及时续费。', '["license_key","valid_until"]'),
  ('order_paid', 'email', '订单支付成功', '订单 {{order_no}} 已支付成功，授权码：{{license_key}}。', '["order_no","license_key"]'),
  ('welcome', 'email', '欢迎加入 ShouYinPOS', '感谢注册 ShouYinPOS 授权管理系统，您的账号：{{email}}。', '["email"]');
