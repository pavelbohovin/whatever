/**
 * Persistence layer — SQLite via sql.js (WASM), persisted to IndexedDB
 * @see src/lib/db/sqlite-client.ts
 */

export {
  getPersistence,
  type PersistenceLayer,
  SCHEMA,
} from './sqlite-client';
