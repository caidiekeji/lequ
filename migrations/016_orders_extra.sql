-- 迁移 016: orders 补充字段 + 优惠券关联字段
-- 说明: 补充 007 遗漏的 discount_amount 和 invoice_id 字段

ALTER TABLE orders ADD COLUMN discount_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN invoice_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_orders_coupon ON orders(coupon_id);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel_code);
