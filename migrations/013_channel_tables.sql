-- 迁移 013: 渠道/分销域表
-- 说明: 渠道商管理、推广链接、佣金结算（Phase E）

CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  commission_rate INTEGER DEFAULT 0,
  custom_prices TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_channels_code ON channels(code);

CREATE TABLE IF NOT EXISTS channel_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_code TEXT NOT NULL,
  landing_page TEXT DEFAULT '/',
  utm_source TEXT,
  utm_campaign TEXT,
  clicks INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_channel_links_channel ON channel_links(channel_code);

CREATE TABLE IF NOT EXISTS commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_code TEXT NOT NULL,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  settled_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_commissions_channel ON commissions(channel_code);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
