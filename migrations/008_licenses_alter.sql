-- 迁移 008: licenses 表扩字段
-- 说明: 授权来源、关联订单/用户/策略，便于反查与统计
-- 注意: ALTER TABLE ADD COLUMN 在 D1 中不可重入，重复执行会报错；应用层兜底。

-- 授权来源: manual(手动建) / order(订单自动) / upgrade(升级)
ALTER TABLE licenses ADD COLUMN source TEXT DEFAULT 'manual';

-- 关联订单 ID（订单自动发牌时写入）
ALTER TABLE licenses ADD COLUMN order_id INTEGER REFERENCES orders(id);

-- 关联用户 ID（订单发牌时按 order.user_id 回填）
ALTER TABLE licenses ADD COLUMN user_id INTEGER REFERENCES users(id);

-- 授权策略 ID（Phase C license_policies 表启用后关联）
ALTER TABLE licenses ADD COLUMN policy_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_licenses_order ON licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_user ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_source ON licenses(source);
