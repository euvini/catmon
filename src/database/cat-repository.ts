import { eq, desc } from 'drizzle-orm';
import { db } from './client';
import { catsTable, CatRecord, NewCatRecord } from './schema';

export const CatRepository = {
  /**
   * Salva um novo gato no banco local.
   */
  async create(data: NewCatRecord): Promise<CatRecord> {
    const result = db.insert(catsTable).values(data).returning().get();
    return result;
  },

  /**
   * Recupera todos os gatos cadastrados ordenados por data de avistamento mais recente.
   */
  async getAll(): Promise<CatRecord[]> {
    return db.select().from(catsTable).orderBy(desc(catsTable.createdAt)).all();
  },

  /**
   * Busca um gato por ID.
   */
  async getById(id: string): Promise<CatRecord | null> {
    const item = db.select().from(catsTable).where(eq(catsTable.id, id)).get();
    return item ?? null;
  },

  /**
   * Retorna os registros pendentes de sincronização com a nuvem.
   */
  async getUnsynced(): Promise<CatRecord[]> {
    return db.select().from(catsTable).where(eq(catsTable.isSynced, false)).all();
  },

  /**
   * Atualiza o status de sincronização e a URL remota.
   */
  async markAsSynced(id: string, remotePhotoUrl: string): Promise<void> {
    db.update(catsTable)
      .set({
        isSynced: true,
        remotePhotoUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(catsTable.id, id))
      .run();
  },

  /**
   * Remove um registro de gato.
   */
  async delete(id: string): Promise<void> {
    db.delete(catsTable).where(eq(catsTable.id, id)).run();
  },
};
