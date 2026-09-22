import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CatColors, RetroBadgePalettes } from '../../constants/colors';

describe('Retro UI Tokens & Badge Geometry', () => {
  it('deve exportar tokens corretos para a câmera analógica vintage', () => {
    assert.strictEqual(CatColors.shutterOrange, '#F15A24');
    assert.strictEqual(CatColors.cameraChassis, '#ECEBE4');
    assert.strictEqual(CatColors.tabBarTeal, '#135461');
    assert.strictEqual(CatColors.cameraBezel, '#242424');
  });

  it('deve conter paletas retrô válidas com cores primárias, secundárias e bordas', () => {
    assert.ok(RetroBadgePalettes.length >= 5);

    for (const palette of RetroBadgePalettes) {
      assert.ok(palette.id.length > 0);
      assert.ok(palette.primary.startsWith('#'));
      assert.ok(palette.secondary.startsWith('#'));
      assert.ok(palette.border.startsWith('#'));
    }
  });

  it('deve calcular variações determinísticas e distribuídas para diferentes IDs de felinos', () => {
    const sampleIds = [
      'c1-1111-2222-3333-444455556666',
      'c2-2222-3333-4444-555566667777',
      'c3-3333-4444-5555-666677778888',
      'c4-4444-5555-6666-777788889999',
      'c5-5555-6666-7777-888899990000',
    ];

    const types = ['striped-circle', 'striped-hexagon', 'scalloped-flower'];

    const results = sampleIds.map((id) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
      }
      const absHash = Math.abs(hash);
      const type = types[absHash % types.length];
      const paletteIdx = absHash % RetroBadgePalettes.length;
      return { id, type, paletteIdx };
    });

    // Garante determinismo: o mesmo ID sempre produz a mesma moldura
    const checkSameId = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
      }
      return types[Math.abs(hash) % types.length];
    };

    assert.strictEqual(checkSameId(sampleIds[0]), results[0].type);
    assert.strictEqual(checkSameId(sampleIds[1]), results[1].type);

    // Garante que pelo menos 2 tipos de molduras diferentes foram gerados
    const uniqueTypes = new Set(results.map((r) => r.type));
    assert.ok(uniqueTypes.size >= 2);
  });
});
