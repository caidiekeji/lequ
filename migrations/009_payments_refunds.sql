-- 迁移 009: 支付流水 + 退款 + 发票
-- 说明: 交易专业化（Phase B），独立支付流水记录，支持多次支付尝试与部分退款

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  payment_no TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL,
  channel_trade_no TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  raw_notify TEXT,
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_channel_trade ON payments(channel_trade_no);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS refunds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  refund_no TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  operator_id INTEGER,
  operated_at TEXT,
  channel_refund_no TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  title_type TEXT NOT NULL,
  title TEXT NOT NULL,
  tax_no TEXT,
  email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  pdf_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
