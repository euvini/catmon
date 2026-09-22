import * as Location from 'expo-location';
import { GeoCoordinates } from '@/types/domain';

// Coordenadas padrão de fallback (ex: marco zero) caso não haja GPS
const DEFAULT_COORDINATES: GeoCoordinates = {
  latitude: -23.55052,
  longitude: -46.633308,
  accuracyMeters: 100,
  isObfuscated: false,
};

export const LocationService = {
  /**
   * Obtém as coordenadas GPS atuais com alta precisão e timeout de 5 segundos.
   */
  async getCurrentLocation(): Promise<GeoCoordinates> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== 'granted') {
          return DEFAULT_COORDINATES;
        }
      }

      // Tenta posição de alta precisão
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);

      if (location) {
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracyMeters: location.coords.accuracy ?? undefined,
          isObfuscated: false,
        };
      }

      // Fallback para última posição conhecida se timeout expirar
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        return {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          accuracyMeters: lastKnown.coords.accuracy ?? undefined,
          isObfuscated: false,
        };
      }

      return DEFAULT_COORDINATES;
    } catch {
      return DEFAULT_COORDINATES;
    }
  },

  /**
   * Converte coordenadas em nome de bairro/cidade (Geocodificação Reversa).
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<{ neighborhood?: string; city?: string }> {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const item = results[0];
        return {
          neighborhood: item.district || item.subregion || undefined,
          city: item.city || item.region || undefined,
        };
      }
      return {};
    } catch {
      return {};
    }
  },
};
