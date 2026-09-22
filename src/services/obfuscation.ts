/**
 * Serviço de Ofuscação Geoespacial Ética.
 * Adiciona ruído radial determinístico de 150m a 300m para resguardar a privacidade
 * de lares particulares (friend_pet) sem comprometer a estabilidade do marcador no mapa.
 */

// 1 grau de latitude em metros aproximadamente
const METERS_PER_DEGREE_LAT = 111320;

/**
 * Função hash simples baseada em string para gerar sementes determinísticas.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const ObfuscationService = {
  /**
   * Aplica um deslocamento de 150m a 300m em ângulo pseudo-aleatório baseado no ID do gato.
   */
  obfuscateCoordinates(
    latitude: number,
    longitude: number,
    catId: string,
    minDistanceMeters = 150,
    maxDistanceMeters = 300
  ): { latitude: number; longitude: number } {
    const seed = hashString(catId);

    // Ângulo entre 0 e 2*PI radianos
    const angle = ((seed % 360) * Math.PI) / 180;

    // Distância radial entre minDistanceMeters e maxDistanceMeters
    const distance = minDistanceMeters + ((seed >> 4) % (maxDistanceMeters - minDistanceMeters));

    // Conversão de metros para graus
    const deltaLat = (distance * Math.cos(angle)) / METERS_PER_DEGREE_LAT;
    const deltaLng =
      (distance * Math.sin(angle)) /
      (METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180));

    return {
      latitude: latitude + deltaLat,
      longitude: longitude + deltaLng,
    };
  },
};
