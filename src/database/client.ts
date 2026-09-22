import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const DB_NAME = 'catmon.db';

export const expoDb = SQLite.openDatabaseSync(DB_NAME);
export const db = drizzle(expoDb, { schema });

/**
 * Garante que a tabela 'cats' e índices existam localmente na inicialização do app.
 */
export function initDatabase() {
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS cats (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL DEFAULT 'Gato Misterioso',
      breed TEXT NOT NULL DEFAULT 'SRD (Sem Raça Definida)',
      context TEXT NOT NULL DEFAULT 'stray',
      color TEXT NOT NULL DEFAULT '#F39C12',
      temperament TEXT NOT NULL DEFAULT 'friendly',
      approx_age TEXT NOT NULL DEFAULT 'adult',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      is_obfuscated INTEGER NOT NULL DEFAULT 0,
      local_photo_uri TEXT NOT NULL,
      local_thumbnail_uri TEXT,
      remote_photo_url TEXT,
      notes TEXT,
      is_synced INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE INDEX IF NOT EXISTS idx_cats_is_synced ON cats(is_synced);
    CREATE INDEX IF NOT EXISTS idx_cats_created_at ON cats(created_at);
  `);
}
