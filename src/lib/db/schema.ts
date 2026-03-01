/**
 * SQLite schema for Whatever
 * Uses sql.js in browser; can swap to better-sqlite3 for Node
 */

export const SCHEMA = `
-- Users (local device)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TEXT NOT NULL,
  cloud_id TEXT
);

-- Provider keys (encrypted ref only)
CREATE TABLE IF NOT EXISTS provider_keys (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  encrypted_ref TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT
);

-- Mini-apps (installed)
CREATE TABLE IF NOT EXISTS mini_apps (
  id TEXT PRIMARY KEY,
  definition TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Records (generic key-value per table)
CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  table_id TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_table ON records(table_id);
CREATE INDEX IF NOT EXISTS idx_records_created ON records(created_at);

-- Audit log (redacted)
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  mini_app_id TEXT,
  details TEXT,
  created_at TEXT NOT NULL
);
`;
