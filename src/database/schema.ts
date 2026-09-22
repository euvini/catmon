import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const catsTable = sqliteTable('cats', {
  id: text('id').primaryKey(),
  name: text('name').notNull().default('Gato Misterioso'),
  breed: text('breed').notNull().default('SRD (Sem Raça Definida)'),
  context: text('context', { enum: ['stray', 'friend_pet', 'community', 'cat_cafe', 'other'] })
    .notNull()
    .default('stray'),
  color: text('color').notNull().default('#F39C12'),
  temperament: text('temperament', { enum: ['friendly', 'shy', 'playful', 'sleeper'] })
    .notNull()
    .default('friendly'),
  approxAge: text('approx_age', { enum: ['kitten', 'young', 'adult', 'senior'] })
    .notNull()
    .default('adult'),
  
  // Coordenadas Geoespaciais
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  isObfuscated: integer('is_obfuscated', { mode: 'boolean' }).notNull().default(false),
  
  // Mídia local e remota
  localPhotoUri: text('local_photo_uri').notNull(),
  localThumbnailUri: text('local_thumbnail_uri'),
  remotePhotoUrl: text('remote_photo_url'),
  
  // Metadados
  notes: text('notes'),
  
  // Sincronização
  isSynced: integer('is_synced', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export type CatRecord = typeof catsTable.$inferSelect;
export type NewCatRecord = typeof catsTable.$inferInsert;
