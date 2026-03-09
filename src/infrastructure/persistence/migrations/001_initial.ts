export const INITIAL_MIGRATION = `
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  ankama_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  type TEXT NOT NULL,
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'static',
  synced_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id),
  stat_type TEXT NOT NULL,
  min_value INTEGER NOT NULL,
  max_value INTEGER NOT NULL,
  UNIQUE(item_id, stat_type)
);

CREATE TABLE IF NOT EXISTS runes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  stat_type TEXT NOT NULL,
  tier TEXT NOT NULL,
  stat_value INTEGER NOT NULL,
  weight REAL NOT NULL,
  default_price INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS forge_sessions (
  id TEXT PRIMARY KEY,
  item_id INTEGER REFERENCES items(id),
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  ended_at TEXT,
  target_stats TEXT,
  current_stats TEXT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS forge_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT REFERENCES forge_sessions(id),
  rune_id INTEGER REFERENCES runes(id),
  success INTEGER NOT NULL,
  stat_changes TEXT,
  sink_before REAL,
  sink_after REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  items_synced INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  error TEXT,
  synced_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;
