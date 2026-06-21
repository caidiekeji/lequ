-- 迁移 014: 数据分析域表
-- 说明: 访问统计日聚合、业务事件流（漏斗分析）

CREATE TABLE IF NOT EXISTS visit_daily_stats (
  date TEXT NOT NULL,
  path TEXT NOT NULL,
  pv INTEGER DEFAULT 0,
  uv INTEGER DEFAULT 0,
  country_breakdown TEXT,
  PRIMARY KEY (date, path)
);

CREATE TABLE IF NOT EXISTS feature_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  anonymous_id TEXT,
  event_name TEXT NOT NULL,
  event_properties TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_feature_events_name_time ON feature_events(event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_feature_events_user ON feature_events(user_id);
