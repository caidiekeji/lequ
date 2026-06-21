-- 授权系统迁移 002: 用户体系 + 套餐 + 订单
-- 说明: 新增用户表、套餐表、订单表，支持在线购买授权

-- 用户表（客户账号）
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  nickname TEXT DEFAULT '',
  company TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- 产品套餐表
CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  original_price INTEGER DEFAULT 0,
  duration_days INTEGER NOT NULL,
  max_stores INTEGER DEFAULT 1,
  max_terminals INTEGER DEFAULT 1,
  max_products INTEGER DEFAULT 5000,
  max_members INTEGER DEFAULT 2000,
  features TEXT DEFAULT '[]',
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  amount INTEGER NOT NULL,
  original_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_no TEXT,
  paid_at TEXT,
  license_id INTEGER REFERENCES licenses(id),
  remark TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- 密码重置表
CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_plans_code ON plans(code);
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_license_id ON orders(license_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- 插入默认套餐
INSERT OR IGNORE INTO plans (name, code, price, original_price, duration_days, max_stores, max_terminals, max_products, max_members, features, description, sort_order) VALUES
('基础版', 'basic', 9900, 12900, 365, 1, 1, 5000, 2000, '["基础收银","商品管理","会员管理","销售报表"]', '适合单店小型商户', 1),
('专业版', 'pro', 29900, 39900, 365, 3, 5, 20000, 10000, '["基础收银","商品管理","会员管理","销售报表","多门店","供应链","员工管理","数据分析"]', '适合连锁门店', 2),
('企业版', 'enterprise', 99900, 129900, 365, 10, 20, 100000, 50000, '["全部功能","API接口","专属客服","定制开发","私有部署"]', '适合大型企业', 3);
