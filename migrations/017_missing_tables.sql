-- 迁移 017: 补充PRD中缺失的表
-- 说明: 补充 coupons / plan_versions / order_items / email_verifications 表
--       以及 users.tags 字段（用于用户标签功能）

-- ============ 商品域：优惠券 ============
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,              -- discount(折扣%) / amount(减免金额分)
  value INTEGER NOT NULL,          -- 折扣比例或减免金额(分)
  min_amount INTEGER DEFAULT 0,    -- 最低订单金额(分)
  max_uses INTEGER DEFAULT 0,      -- 最大使用次数(0=不限)
  used_count INTEGER DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  status TEXT DEFAULT 'active',    -- active / inactive / expired
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);

-- ============ 商品域：套餐价格版本 ============
-- 同一套餐的历史价格版本（涨价后保留存量旧价）
CREATE TABLE IF NOT EXISTS plan_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  plan_code TEXT,
  plan_name TEXT,
  price INTEGER NOT NULL,          -- 售价(分)
  original_price INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 30,
  note TEXT DEFAULT '',
  effective_from TEXT DEFAULT (datetime('now')),
  effective_until TEXT,            -- NULL 表示当前有效
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_plan_versions_plan ON plan_versions(plan_id);

-- ============ 交易域：订单明细 ============
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  item_type TEXT NOT NULL,         -- plan / upgrade / renewal / coupon
  item_id INTEGER,                 -- 关联ID(plan_id / license_id / coupon_id)
  item_name TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER NOT NULL,     -- 单价(分)
  amount INTEGER NOT NULL,         -- 小计金额(分)
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============ 账户域：邮箱验证 ============
CREATE TABLE IF NOT EXISTS email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'register',  -- register / change_email
  used INTEGER DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);

-- ============ 账户域：用户标签字段 ============
ALTER TABLE users ADD COLUMN tags TEXT DEFAULT '[]';
