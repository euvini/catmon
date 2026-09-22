import NetInfo from '@react-native-community/netinfo';
import { CatRepository } from '@/database/cat-repository';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

export const SyncWorker = {
  isSyncing: false,

  /**
   * Inicia a escuta de conectividade para disparar sincronizações automáticas.
   */
  start(): () => void {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.runSync();
      }
    });

    return unsubscribe;
  },

  /**
   * Executa a esteira de sincronização de registros pendentes.
   */
  async runSync(): Promise<{ syncedCount: number; failedCount: number }> {
    if (this.isSyncing) return { syncedCount: 0, failedCount: 0 };

    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      const unsyncedCats = await CatRepository.getUnsynced();
      if (unsyncedCats.length === 0) {
        return { syncedCount: 0, failedCount: 0 };
      }

      for (const cat of unsyncedCats) {
        try {
          let remoteUrl = cat.remotePhotoUrl;

          // Etapa 1: Upload da foto se ainda não enviada
          if (!remoteUrl && cat.localPhotoUri) {
            const formData = new FormData();
            formData.append('file', {
              uri: cat.localPhotoUri,
              name: `${cat.id}.jpg`,
              type: 'image/jpeg',
            } as any);
            formData.append('cat_id', cat.id);

            const uploadRes = await fetch(`${API_BASE_URL}/api/v1/media/upload`, {
              method: 'POST',
              body: formData,
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              remoteUrl = uploadData.remote_photo_url;
            }
          }

          // Etapa 2: Push dos metadados
          const pushRes = await fetch(`${API_BASE_URL}/api/v1/sync/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cats: [
                {
                  id: cat.id,
                  name: cat.name,
                  breed: cat.breed,
                  context: cat.context,
                  color: cat.color,
                  temperament: cat.temperament,
                  approx_age: cat.approxAge,
                  latitude: cat.latitude,
                  longitude: cat.longitude,
                  is_obfuscated: cat.isObfuscated,
                  remote_photo_url: remoteUrl,
                  notes: cat.notes,
                  created_at: cat.createdAt,
                  updated_at: cat.updatedAt,
                },
              ],
            }),
          });

          if (pushRes.ok) {
            await CatRepository.markAsSynced(cat.id, remoteUrl || '');
            syncedCount++;
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      }
    } finally {
      this.isSyncing = false;
    }

    return { syncedCount, failedCount };
  },
};
