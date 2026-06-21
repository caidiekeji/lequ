-- 迁移 010: 功能字典 + 套餐功能关联 + 价格版本 + 优惠券
-- 说明: 替代 plans.features 中文数组，支持独立功能开关管理与套餐多版本定价

CREATE TABLE IF NOT EXISTS features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  group_name TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS plan_features (
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  feature_id INTEGER NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, feature_id)
);

CREATE TABLE IF NOT EXISTS plan_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  price INTEGER NOT NULL,
  original_price INTEGER DEFAULT 0,
  effective_from TEXT NOT NULL,
  effective_until TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_plan_versions_plan ON plan_versions(plan_id);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  value INTEGER NOT NULL,
  min_amount INTEGER DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  total_quota INTEGER,
  used_count INTEGER DEFAULT 0,
  plan_ids TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);

-- 种子数据：常用功能点
INSERT OR IGNORE INTO features (code, name, group_name, sort_order) VALUES
  ('base',          '基础收银', '基础', 1),
  ('member',        '会员管理', '会员', 2),
  ('promotion',     '营销促销', '营销', 3),
  ('multi_store',   '多门店', '高级', 4),
  ('api_access',    'API 接入', '高级', 5),
  ('supply_chain',  '供应链', '高级', 6),
  ('data_analytics','数据分析', '高级', 7),
  ('custom_report', '自定义报表', '高级', 8),
  ('pos_printer',   '小票打印', '基础', 9),
  ('inventory',     '库存管理', '基础', 10);
