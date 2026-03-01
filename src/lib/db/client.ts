/**
 * Persistence layer — SQLite via IndexedDB abstraction for browser
 * For MVP: uses localStorage + in-memory for browser; can add sql.js WASM later
 *
 * Next steps: Integrate sql.js for full SQLite in browser, or use API route + better-sqlite3
 */

import type { User, MiniApp, DataRecord } from '@/types';
import { SCHEMA } from './schema';

const DB_KEY = 'whatever_db';
const USERS_KEY = 'whatever_users';
const MINI_APPS_KEY = 'whatever_mini_apps';
const RECORDS_KEY = 'whatever_records';
const AUDIT_KEY = 'whatever_audit';

function getStorage(): Storage {
  if (typeof window === 'undefined') {
    throw new Error('Persistence requires browser environment');
  }
  return localStorage;
}

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

function loadJson<T>(key: string, defaultVal: T): T {
  try {
    const s = getStorage().getItem(key);
    return s ? (JSON.parse(s) as T) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function saveJson(key: string, val: unknown): void {
  getStorage().setItem(key, JSON.stringify(val));
}

export function createPersistence(): PersistenceLayer {
  return {
    async getUser(): Promise<User | null> {
      const users = loadJson<User[]>(USERS_KEY, []);
      return users[0] ?? null;
    },

    async saveUser(user: User): Promise<void> {
      const users = loadJson<User[]>(USERS_KEY, []);
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) users[idx] = user;
      else users.push(user);
      saveJson(USERS_KEY, users);
    },

    async getMiniApps(): Promise<MiniApp[]> {
      return loadJson<MiniApp[]>(MINI_APPS_KEY, []);
    },

    async saveMiniApp(app: MiniApp): Promise<void> {
      const apps = loadJson<MiniApp[]>(MINI_APPS_KEY, []);
      const idx = apps.findIndex((a) => a.id === app.id);
      const now = new Date().toISOString();
      const updated = { ...app, updatedAt: now };
      if (idx >= 0) apps[idx] = updated;
      else apps.push({ ...updated, createdAt: now });
      saveJson(MINI_APPS_KEY, apps);
    },

    async deleteMiniApp(id: string): Promise<void> {
      const apps = loadJson<MiniApp[]>(MINI_APPS_KEY, []);
      saveJson(MINI_APPS_KEY, apps.filter((a) => a.id !== id));
      // Also remove records for this app's tables
      const allRecords = loadJson<DataRecord[]>(RECORDS_KEY, []);
      const app = apps.find((a) => a.id === id);
      const tableIds = app?.tables.map((t) => t.id) ?? [];
      saveJson(
        RECORDS_KEY,
        allRecords.filter((r) => !tableIds.includes(r.tableId))
      );
    },

    async getRecords(tableId: string): Promise<DataRecord[]> {
      const all = loadJson<DataRecord[]>(RECORDS_KEY, []);
      return all.filter((r) => r.tableId === tableId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async getRecord(recordId: string): Promise<DataRecord | null> {
      const all = loadJson<DataRecord[]>(RECORDS_KEY, []);
      return all.find((r) => r.id === recordId) ?? null;
    },

    async createRecord(tableId: string, data: Record<string, unknown>): Promise<DataRecord> {
      const all = loadJson<DataRecord[]>(RECORDS_KEY, []);
      const now = new Date().toISOString();
      const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const record: DataRecord = {
        id,
        tableId,
        data,
        createdAt: now,
        updatedAt: now,
      };
      all.push(record);
      saveJson(RECORDS_KEY, all);
      return record;
    },

    async updateRecord(recordId: string, data: Record<string, unknown>): Promise<DataRecord> {
      const all = loadJson<DataRecord[]>(RECORDS_KEY, []);
      const idx = all.findIndex((r) => r.id === recordId);
      if (idx < 0) throw new Error(`Record not found: ${recordId}`);
      const now = new Date().toISOString();
      const updated = { ...all[idx], data: { ...all[idx].data, ...data }, updatedAt: now };
      all[idx] = updated;
      saveJson(RECORDS_KEY, all);
      return updated;
    },

    async deleteRecord(recordId: string): Promise<void> {
      const all = loadJson<DataRecord[]>(RECORDS_KEY, []);
      saveJson(RECORDS_KEY, all.filter((r) => r.id !== recordId));
    },

    async audit(action: string, miniAppId?: string, details?: string): Promise<void> {
      const log = loadJson<Array<{ id: string; action: string; miniAppId?: string; details?: string; createdAt: string }>>(AUDIT_KEY, []);
      log.push({
        id: `audit_${Date.now()}`,
        action,
        miniAppId,
        details: redactSecrets(details ?? ''),
        createdAt: new Date().toISOString(),
      });
      if (log.length > 500) log.shift();
      saveJson(AUDIT_KEY, log);
    },
  };
}

function redactSecrets(s: string): string {
  return s
    .replace(/(Bearer\s+)[^\s]+/gi, '$1[REDACTED]')
    .replace(/(api[_-]?key["\s:=]+)[^\s"',}]+/gi, '$1[REDACTED]')
    .replace(/(token["\s:=]+)[^\s"',}]+/gi, '$1[REDACTED]');
}

// Export schema for reference (sql.js would use it)
export { SCHEMA };
