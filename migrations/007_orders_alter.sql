-- 迁移 007: orders 表扩字段
-- 说明: 支付超时关闭、确认人留痕、退款金额、优惠券/渠道归因
-- D1/SQLite 的 ALTER TABLE ADD COLUMN 不支持 IF NOT EXISTS，需逐条独立执行；
-- 若字段已存在则该条会报错，可忽略（re-runnable 通过应用层兜底）。

-- pending 订单超时关闭时间（cron 扫描 expires_at < now 且 status=pending）
ALTER TABLE orders ADD COLUMN expires_at TEXT;

-- 手动确认收款的操作管理员 ID（审计留痕）
ALTER TABLE orders ADD COLUMN confirm_admin_id INTEGER;

-- 累计已退款金额（分），支持部分退款
ALTER TABLE orders ADD COLUMN refunded_amount INTEGER DEFAULT 0;

-- 优惠券关联（Phase D 优惠券模块启用）
ALTER TABLE orders ADD COLUMN coupon_id INTEGER;

-- 渠道归因码（Phase E 渠道模块启用）
ALTER TABLE orders ADD COLUMN channel_code TEXT;

-- 订单超时关闭索引
CREATE INDEX IF NOT EXISTS idx_orders_expires ON orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_confirm_admin ON orders(confirm_admin_id);
