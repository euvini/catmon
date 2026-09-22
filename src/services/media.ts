import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_DIR = `${FileSystem.documentDirectory}cat-photos/`;

export const MediaService = {
  /**
   * Garante que o diretório seguro de fotos de gatos exista no sandbox do app.
   */
  async ensureDirectoryExists(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
    }
  },

  /**
   * Salva a foto temporária da câmera/galeria no sandbox permanente.
   * Retorna a URI local permanente.
   */
  async persistPhoto(tempUri: string, catId: string): Promise<string> {
    await this.ensureDirectoryExists();
    const destinationUri = `${PHOTOS_DIR}${catId}.jpg`;

    await FileSystem.copyAsync({
      from: tempUri,
      to: destinationUri,
    });

    return destinationUri;
  },

  /**
   * Remove uma foto local caso o registro seja deletado.
   */
  async deletePhoto(photoUri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(photoUri, { idempotent: true });
      }
    } catch {
      // Falha silenciosa na remoção
    }
  },
};
