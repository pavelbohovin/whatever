/**
 * SQLite persistence layer via sql.js (WASM)
 * Persists to IndexedDB for durability across sessions
 */

import type { User, MiniApp, DataRecord } from '@/types';
import { SCHEMA } from './schema';

const IDB_NAME = 'whatever_db';
const IDB_STORE = 'sqlite';
const IDB_KEY = 'db';

export interface PersistenceLayer {
  getUser(): Promise<User | null>;
  saveUser(user: User): Promise<void>;
  getMiniApps(): Promise<MiniApp[]>;
  saveMiniApp(app: MiniApp): Promise<void>;
  deleteMiniApp(id: string): Promise<void>;
  getRecords(tableId: string): Promise<DataRecord[]>;
  getRecord(recordId: string): Promise<DataRecord | null>;
  createRecord(tableId: string, data: Record<string, unknown>): Promise<DataRecord>;
  updateRecord(recordId: string, data: Record<string, unknown>): Promise<DataRecord>;
  deleteRecord(recordId: string): Promise<void>;
  audit(action: string, miniAppId?: string, details?: string): Promise<void>;
}

function redactSecrets(s: string): string {
  return s
    .replace(/(Bearer\s+)[^\s]+/gi, '$1[REDACTED]')
    .replace(/(api[_-]?key["\s:=]+)[^\s"',}]+/gi, '$1[REDACTED]')
    .replace(/(token["\s:=]+)[^\s"',}]+/gi, '$1[REDACTED]');
}

function migrateFromLocalStorage(db: import('sql.js').Database): void {
  try {
    const users = JSON.parse(localStorage.getItem('whatever_users') ?? '[]') as Array<{
      id: string;
      name: string;
      avatarUrl?: string;
      createdAt: string;
      cloudId?: string;
      language?: string;
    }>;
    for (const u of users) {
      db.run(
        'INSERT OR REPLACE INTO users (id, name, avatar_url, created_at, cloud_id, language) VALUES (?, ?, ?, ?, ?, ?)',
        [u.id, u.name, u.avatarUrl ?? null, u.createdAt, u.cloudId ?? null, u.language ?? null]
      );
    }

    const apps = JSON.parse(localStorage.getItem('whatever_mini_apps') ?? '[]') as Array<MiniApp>;
    const now = new Date().toISOString();
    for (const app of apps) {
      db.run(
        'INSERT OR REPLACE INTO mini_apps (id, definition, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [app.id, JSON.stringify(app), app.createdAt ?? now, app.updatedAt ?? now]
      );
    }

    const records = JSON.parse(localStorage.getItem('whatever_records') ?? '[]') as Array<DataRecord>;
    for (const r of records) {
      db.run(
        'INSERT INTO records (id, table_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [r.id, r.tableId, JSON.stringify(r.data), r.createdAt, r.updatedAt]
      );
    }
  } catch (e) {
    console.warn('localStorage migration failed:', e);
  }
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onerror = () => resolve(null);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.close();
        resolve(null);
        return;
      }
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const getReq = store.get(IDB_KEY);
      getReq.onsuccess = () => {
        db.close();
        resolve(getReq.result ?? null);
      };
      getReq.onerror = () => {
        db.close();
        resolve(null);
      };
    };
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
  });
}

async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(data, IDB_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
  });
}

type SqlValue = number | string | Uint8Array | null;

function runSelect(db: import('sql.js').Database, sql: string, params: SqlValue[] = []): unknown[][] {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows: unknown[][] = [];
  while (stmt.step()) rows.push(stmt.get());
  stmt.free();
  return rows;
}

function createPersistenceLayer(db: import('sql.js').Database): PersistenceLayer {
  const persist = () => {
    const data = db.export();
    saveToIndexedDB(data).catch(console.error);
  };

  return {
    async getUser(): Promise<User | null> {
      const rows = runSelect(db, 'SELECT id, name, avatar_url, created_at, cloud_id, language FROM users LIMIT 1');
      if (!rows.length) return null;
      const [id, name, avatarUrl, createdAt, cloudId, language] = rows[0];
      return {
        id: String(id),
        name: String(name),
        avatarUrl: avatarUrl ? String(avatarUrl) : undefined,
        createdAt: String(createdAt),
        cloudId: cloudId ? String(cloudId) : undefined,
        language: language ? (String(language) as User['language']) : undefined,
      };
    },

    async saveUser(user: User): Promise<void> {
      db.run(
        `INSERT INTO users (id, name, avatar_url, created_at, cloud_id, language)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name=?, avatar_url=?, cloud_id=?, language=?`,
        [
          user.id,
          user.name,
          user.avatarUrl ?? null,
          user.createdAt,
          user.cloudId ?? null,
          user.language ?? null,
          user.name,
          user.avatarUrl ?? null,
          user.cloudId ?? null,
          user.language ?? null,
        ]
      );
      persist();
    },

    async getMiniApps(): Promise<MiniApp[]> {
      const rows = runSelect(db, 'SELECT id, definition, created_at, updated_at FROM mini_apps ORDER BY updated_at DESC');
      return rows.map((row) => {
        const def = JSON.parse(String(row[1])) as MiniApp;
        return {
          ...def,
          id: String(row[0]),
          createdAt: String(row[2]),
          updatedAt: String(row[3]),
        };
      });
    },

    async saveMiniApp(app: MiniApp): Promise<void> {
      const now = new Date().toISOString();
      const definition = JSON.stringify(app);
      db.run(
        `INSERT INTO mini_apps (id, definition, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET definition=?, updated_at=?`,
        [app.id, definition, now, now, definition, now]
      );
      persist();
    },

    async deleteMiniApp(id: string): Promise<void> {
      const app = (await this.getMiniApps()).find((a) => a.id === id);
      const tableIds = app?.tables.map((t) => t.id) ?? [];
      for (const tid of tableIds) {
        db.run('DELETE FROM records WHERE table_id = ?', [tid]);
      }
      db.run('DELETE FROM mini_apps WHERE id = ?', [id]);
      persist();
    },

    async getRecords(tableId: string): Promise<DataRecord[]> {
      const rows = runSelect(
        db,
        'SELECT id, table_id, data, created_at, updated_at FROM records WHERE table_id = ? ORDER BY created_at DESC',
        [tableId]
      );
      return rows.map((row) => ({
        id: String(row[0]),
        tableId: String(row[1]),
        data: JSON.parse(String(row[2])) as Record<string, unknown>,
        createdAt: String(row[3]),
        updatedAt: String(row[4]),
      }));
    },

    async getRecord(recordId: string): Promise<DataRecord | null> {
      const rows = runSelect(
        db,
        'SELECT id, table_id, data, created_at, updated_at FROM records WHERE id = ?',
        [recordId]
      );
      if (!rows.length) return null;
      const row = rows[0];
      return {
        id: String(row[0]),
        tableId: String(row[1]),
        data: JSON.parse(String(row[2])) as Record<string, unknown>,
        createdAt: String(row[3]),
        updatedAt: String(row[4]),
      };
    },

    async createRecord(tableId: string, data: Record<string, unknown>): Promise<DataRecord> {
      const now = new Date().toISOString();
      const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      db.run(
        'INSERT INTO records (id, table_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [id, tableId, JSON.stringify(data), now, now]
      );
      persist();
      return { id, tableId, data, createdAt: now, updatedAt: now };
    },

    async updateRecord(recordId: string, data: Record<string, unknown>): Promise<DataRecord> {
      const existing = await this.getRecord(recordId);
      if (!existing) throw new Error(`Record not found: ${recordId}`);
      const merged = { ...existing.data, ...data };
      const now = new Date().toISOString();
      db.run('UPDATE records SET data = ?, updated_at = ? WHERE id = ?', [
        JSON.stringify(merged),
        now,
        recordId,
      ]);
      persist();
      return { ...existing, data: merged, updatedAt: now };
    },

    async deleteRecord(recordId: string): Promise<void> {
      db.run('DELETE FROM records WHERE id = ?', [recordId]);
      persist();
    },

    async audit(action: string, miniAppId?: string, details?: string): Promise<void> {
      const id = `audit_${Date.now()}`;
      const now = new Date().toISOString();
      const detailsSafe = redactSecrets(details ?? '');
      db.run(
        'INSERT INTO audit_log (id, action, mini_app_id, details, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, action, miniAppId ?? null, detailsSafe, now]
      );
      // Trim old audit entries (keep last 500)
      const rows = runSelect(db, 'SELECT id FROM audit_log ORDER BY created_at ASC LIMIT 501');
      if (rows.length > 500) {
        const toDelete = rows.slice(0, rows.length - 500).map((r) => String(r[0]));
        for (const aid of toDelete) {
          db.run('DELETE FROM audit_log WHERE id = ?', [aid]);
        }
      }
      persist();
    },
  };
}

let dbPromise: Promise<PersistenceLayer> | null = null;

export async function getPersistence(): Promise<PersistenceLayer> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    if (typeof window === 'undefined') {
      throw new Error('SQLite persistence requires browser environment');
    }

    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs({
      locateFile: (file: string) => `/${file}`,
    });

    const saved = await loadFromIndexedDB();
    const db = saved ? new SQL.Database(saved) : new SQL.Database();
    db.run(SCHEMA);

    // Migrations for existing DBs
    try {
      db.run('ALTER TABLE users ADD COLUMN language TEXT');
    } catch {
      /* column may already exist */
    }

    // Migrate from localStorage if this is a fresh SQLite DB and localStorage has data
    if (!saved) {
      migrateFromLocalStorage(db);
    }

    return createPersistenceLayer(db);
  })();

  return dbPromise;
}

export { SCHEMA };
