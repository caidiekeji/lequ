/**
 * 种子数据脚本
 * 用法: node seed.mjs
 * 生成 seed-data.sql 并插入测试数据
 */

import { createHash, randomBytes, pbkdf2Sync } from 'crypto'

function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = pbkdf2Sync(password, salt, 100000, 32, 'sha256')
  return salt.toString('hex') + ':' + hash.toString('hex')
}

const now = new Date().toISOString()
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString()
const daysFromNow = (d) => new Date(Date.now() + d * 86400000).toISOString()

// 测试用户密码统一为 Test@123456
const userPassword = hashPassword('Test@123456')
const adminPassword = hashPassword('admin123')

const sql = `
-- ============================================
-- 种子数据 - 测试环境
-- 用法: npx wrangler d1 execute lequ --file=./migrations/seed-data.sql
-- ============================================

-- 清理旧数据（可选，谨慎使用）
-- DELETE FROM license_audit_logs;
-- DELETE FROM license_instances;
-- DELETE FROM orders;
-- DELETE FROM licenses;
-- DELETE FROM users;
-- DELETE FROM password_resets;

-- ==================== 管理员 ====================
INSERT OR IGNORE INTO admins (username, password_hash, role, status) VALUES
('admin', '${adminPassword}', 'super_admin', 'active'),
('operator', '${adminPassword}', 'admin', 'active');

-- ==================== 测试用户 ====================
INSERT OR IGNORE INTO users (email, phone, password_hash, nickname, company, status, created_at) VALUES
('zhangsan@example.com', '13800001111', '${userPassword}', '张三', '深圳星辰科技有限公司', 'active', '${daysAgo(30)}'),
('lisi@example.com', '13800002222', '${userPassword}', '李四', '广州惠民商贸', 'active', '${daysAgo(25)}'),
('wangwu@example.com', '13800003333', '${userPassword}', '王五', '杭州优品电商', 'active', '${daysAgo(20)}'),
('zhaoliu@example.com', '13800004444', '${userPassword}', '赵六', '成都好吃零食店', 'active', '${daysAgo(15)}'),
('chenqi@example.com', '13800005555', '${userPassword}', '陈七', '武汉鲜果连锁', 'active', '${daysAgo(10)}');

-- ==================== 授权码 ====================
INSERT OR IGNORE INTO licenses (license_key, product_edition, max_stores, max_terminals, max_products, max_members, features, bind_mode, valid_from, valid_until, status, note, customer_name, customer_contact, created_at) VALUES
('POS-ABCD-1234-EFGH', 'basic', 1, 1, 5000, 2000, '["基础收银","商品管理","会员管理","销售报表"]', 'strict', '${daysAgo(30)}', '${daysFromNow(335)}', 'active', '测试订单 ORD20260520001', '深圳星辰科技有限公司', 'zhangsan@example.com', '${daysAgo(30)}'),
('POS-IJKL-5678-MNOP', 'pro', 3, 5, 20000, 10000, '["基础收银","商品管理","会员管理","销售报表","多门店","供应链","员工管理","数据分析"]', 'strict', '${daysAgo(25)}', '${daysFromNow(340)}', 'active', '测试订单 ORD20260526001', '广州惠民商贸', 'lisi@example.com', '${daysAgo(25)}'),
('POS-QRST-9012-UVWX', 'enterprise', 10, 20, 100000, 50000, '["全部功能","API接口","专属客服","定制开发","私有部署"]', 'strict', '${daysAgo(20)}', '${daysFromNow(345)}', 'active', '测试订单 ORD20260531001', '杭州优品电商', 'wangwu@example.com', '${daysAgo(20)}'),
('POS-YZAB-3456-CDEF', 'basic', 1, 1, 5000, 2000, '["基础收银","商品管理","会员管理","销售报表"]', 'strict', '${daysAgo(15)}', '${daysAgo(5)}', 'expired', '已过期测试', '成都好吃零食店', 'zhaoliu@example.com', '${daysAgo(15)}'),
('POS-GHIJ-7890-KLMN', 'pro', 3, 5, 20000, 10000, '["基础收银","商品管理","会员管理","销售报表","多门店","供应链","员工管理","数据分析"]', 'strict', '${daysAgo(10)}', '${daysFromNow(355)}', 'revoked', '已吊销测试', '武汉鲜果连锁', 'chenqi@example.com', '${daysAgo(10)}');

-- ==================== 激活实例 ====================
INSERT OR IGNORE INTO license_instances (license_id, instance_id, store_name, hardware_fingerprint, fingerprint_detail, activated_at, last_heartbeat, status) VALUES
(1, '550e8400-e29b-41d4-a716-446655440001', '星辰总店', 'sha256:abc123def456', '{"os":"Windows 11","cpu":"Intel i7-12700","ram":"16GB"}', '${daysAgo(29)}', '${daysAgo(0)}', 'active'),
(1, '550e8400-e29b-41d4-a716-446655440002', '星辰分店', 'sha256:xyz789uvw012', '{"os":"Windows 10","cpu":"Intel i5-10400","ram":"8GB"}', '${daysAgo(20)}', '${daysAgo(1)}', 'active'),
(2, '550e8400-e29b-41d4-a716-446655440003', '惠民总店', 'sha256:mno345pqr678', '{"os":"macOS 14","cpu":"Apple M2","ram":"8GB"}', '${daysAgo(24)}', '${daysAgo(0)}', 'active'),
(2, '550e8400-e29b-41d4-a716-446655440004', '惠民天河店', 'sha256:stu901vwx234', '{"os":"Windows 11","cpu":"AMD Ryzen 5","ram":"16GB"}', '${daysAgo(18)}', '${daysAgo(2)}', 'active'),
(2, '550e8400-e29b-41d4-a716-446655440005', '惠民白云店', 'sha256:abc456def789', '{"os":"Windows 10","cpu":"Intel i3-10100","ram":"4GB"}', '${daysAgo(10)}', '${daysAgo(3)}', 'active'),
(3, '550e8400-e29b-41d4-a716-446655440006', '优品总部', 'sha256:ghi789jkl012', '{"os":"Windows 11","cpu":"Intel i9-13900","ram":"32GB"}', '${daysAgo(19)}', '${daysAgo(0)}', 'active'),
(3, '550e8400-e29b-41d4-a716-446655440007', '优品西湖店', 'sha256:mno012pqr345', '{"os":"macOS 14","cpu":"Apple M3 Pro","ram":"18GB"}', '${daysAgo(15)}', '${daysAgo(1)}', 'active'),
(3, '550e8400-e29b-41d4-a716-446655440008', '优品滨江店', 'sha256:stu345vwx678', '{"os":"Windows 11","cpu":"AMD Ryzen 7","ram":"16GB"}', '${daysAgo(12)}', '${daysAgo(0)}', 'active');

-- ==================== 订单 ====================
INSERT OR IGNORE INTO orders (order_no, user_id, plan_id, amount, original_amount, status, payment_method, payment_no, paid_at, license_id, remark, created_at) VALUES
('ORD20260520001', 1, 1, 9900, 12900, 'paid', 'wechat', 'wx20260520001', '${daysAgo(29)}', 1, '', '${daysAgo(30)}'),
('ORD20260526001', 2, 2, 29900, 39900, 'paid', 'alipay', 'alipay20260526001', '${daysAgo(24)}', 2, '', '${daysAgo(25)}'),
('ORD20260531001', 3, 3, 99900, 129900, 'paid', 'wechat', 'wx20260531001', '${daysAgo(19)}', 3, '', '${daysAgo(20)}'),
('ORD20260601001', 4, 1, 9900, 12900, 'paid', 'manual', 'MANUAL-001', '${daysAgo(14)}', 4, '', '${daysAgo(15)}'),
('ORD20260605001', 5, 2, 29900, 39900, 'paid', 'wechat', 'wx20260605001', '${daysAgo(9)}', 5, '', '${daysAgo(10)}'),
('ORD20260610001', 1, 2, 29900, 39900, 'pending', NULL, NULL, NULL, NULL, '续费授权 1', '${daysAgo(5)}'),
('ORD20260615001', 2, 1, 9900, 12900, 'pending', NULL, NULL, NULL, NULL, '', '${daysAgo(2)}'),
('ORD20260618001', 3, 2, 29900, 39900, 'cancelled', NULL, NULL, NULL, NULL, '', '${daysAgo(1)}');

-- ==================== 审计日志 ====================
INSERT OR IGNORE INTO license_audit_logs (license_id, instance_id, action, detail, prev_hash, row_hash, created_at) VALUES
(1, '550e8400-e29b-41d4-a716-446655440001', 'activate', '{"store_name":"星辰总店","fingerprint":"sha256:abc123def456"}', 'GENESIS', 'hash_001', '${daysAgo(29)}'),
(1, '550e8400-e29b-41d4-a716-446655440002', 'activate', '{"store_name":"星辰分店","fingerprint":"sha256:xyz789uvw012"}', 'hash_001', 'hash_002', '${daysAgo(20)}'),
(2, '550e8400-e29b-41d4-a716-446655440003', 'activate', '{"store_name":"惠民总店","fingerprint":"sha256:mno345pqr678"}', 'hash_002', 'hash_003', '${daysAgo(24)}'),
(2, '550e8400-e29b-41d4-a716-446655440004', 'activate', '{"store_name":"惠民天河店","fingerprint":"sha256:stu901vwx234"}', 'hash_003', 'hash_004', '${daysAgo(18)}'),
(3, '550e8400-e29b-41d4-a716-446655440006', 'activate', '{"store_name":"优品总部","fingerprint":"sha256:ghi789jkl012"}', 'hash_004', 'hash_005', '${daysAgo(19)}'),
(5, NULL, 'revoke', '{"reason":"管理员吊销"}', 'hash_005', 'hash_006', '${daysAgo(5)}');
`

console.log(sql)
