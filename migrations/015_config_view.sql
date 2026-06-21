-- 迁移 015: system_config 字段名统一
-- 说明: 缺陷 #14 修复 — 现有代码用 key/value，方案文档写 config_key/config_value
-- 方案：保留原有 key/value 字段（代码兼容），创建视图提供别名映射
-- 注：D1 不支持 ALTER TABLE RENAME COLUMN，故用视图方式兼容

CREATE VIEW IF NOT EXISTS system_config_view AS
SELECT id, key AS config_key, value AS config_value, created_at, updated_at
FROM system_config;
