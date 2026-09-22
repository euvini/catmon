import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ObfuscationService } from '../obfuscation';

// Haversine formula para calcular distância geodésica em metros
function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Raio da Terra em metros
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

describe('ObfuscationService', () => {
  const baseLat = -23.55052;
  const baseLng = -46.633308;
  const catId = 'a654c26a-d77f-4212-b855-d5061a24f75e';

  it('deve modificar as coordenadas em relação ao ponto original', () => {
    const obfuscated = ObfuscationService.obfuscateCoordinates(baseLat, baseLng, catId);

    assert.notStrictEqual(obfuscated.latitude, baseLat);
    assert.notStrictEqual(obfuscated.longitude, baseLng);
  });

  it('deve aplicar um deslocamento dentro do raio de 150m a 300m', () => {
    const obfuscated = ObfuscationService.obfuscateCoordinates(baseLat, baseLng, catId);
    const distance = calculateDistanceMeters(
      baseLat,
      baseLng,
      obfuscated.latitude,
      obfuscated.longitude
    );

    // Permite pequena margem de tolerância numérica
    assert.ok(distance >= 140, `Distância ${distance}m menor que 140m`);
    assert.ok(distance <= 310, `Distância ${distance}m maior que 310m`);
  });

  it('deve ser determinístico para o mesmo ID de gato', () => {
    const run1 = ObfuscationService.obfuscateCoordinates(baseLat, baseLng, catId);
    const run2 = ObfuscationService.obfuscateCoordinates(baseLat, baseLng, catId);

    assert.strictEqual(run1.latitude, run2.latitude);
    assert.strictEqual(run1.longitude, run2.longitude);
  });
});
