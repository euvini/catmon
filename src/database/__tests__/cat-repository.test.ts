import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CatSchema, CreateCatInputSchema } from '../../types/domain';

describe('Cat Domain Schema & Validation', () => {
  it('deve validar com sucesso um modelo completo de gato', () => {
    const validCat = {
      id: 'a654c26a-d77f-4212-b855-d5061a24f75e',
      name: 'Mingau',
      breed: 'Siamês',
      context: 'stray',
      color: '#F39C12',
      temperament: 'friendly',
      approxAge: 'young',
      latitude: -23.55052,
      longitude: -46.633308,
      isObfuscated: false,
      localPhotoUri: 'file:///sandbox/cat-photos/test.jpg',
      localThumbnailUri: 'file:///sandbox/cat-photos/test-thumb.jpg',
      remotePhotoUrl: null,
      notes: 'Gatinho dormindo no sol',
      isSynced: false,
      createdAt: '2026-09-18T17:30:00Z',
      updatedAt: '2026-09-18T17:30:00Z',
    };

    const parsed = CatSchema.safeParse(validCat);
    assert.strictEqual(parsed.success, true);
  });

  it('deve rejeitar registros com contexto inválido', () => {
    const invalidCat = {
      id: 'a654c26a-d77f-4212-b855-d5061a24f75e',
      name: 'Mingau',
      context: 'invalid_context',
      latitude: -23.55052,
      longitude: -46.633308,
      localPhotoUri: 'file:///sandbox/cat-photos/test.jpg',
    };

    const parsed = CreateCatInputSchema.safeParse(invalidCat);
    assert.strictEqual(parsed.success, false);
  });
});
