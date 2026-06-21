-- 迁移 004: 网站访问统计表
CREATE TABLE IF NOT EXISTS site_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  ip TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  referer TEXT DEFAULT '',
  country TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_visits_path ON site_visits(path);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON site_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_ip ON site_visits(ip);
