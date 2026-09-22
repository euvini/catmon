import { FastifyInstance } from 'fastify';
import { SyncPushPayloadSchema } from '../schemas/sync-dto.js';
import { supabase } from '../plugins/supabase.js';

export async function syncRoutes(fastify: FastifyInstance) {
  // Push de registros locais para a nuvem (Batch Upsert)
  fastify.post('/api/v1/sync/push', async (request, reply) => {
    const parseResult = SyncPushPayloadSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parseResult.error.format() });
    }

    const { cats } = parseResult.data;
    if (cats.length === 0) {
      return reply.send({ success: true, synced_ids: [], server_timestamp: new Date().toISOString() });
    }

    const syncedIds: string[] = [];

    for (const cat of cats) {
      const { error } = await supabase.from('cats').upsert(
        {
          id: cat.id,
          name: cat.name,
          breed: cat.breed,
          context: cat.context,
          color: cat.color,
          temperament: cat.temperament,
          approx_age: cat.approx_age,
          latitude: cat.latitude,
          longitude: cat.longitude,
          is_obfuscated: cat.is_obfuscated,
          remote_photo_url: cat.remote_photo_url,
          notes: cat.notes,
          is_synced: true,
          created_at: cat.created_at,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (!error) {
        syncedIds.push(cat.id);
      }
    }

    return reply.send({
      success: true,
      synced_ids: syncedIds,
      server_timestamp: new Date().toISOString(),
    });
  });

  // Pull de atualizações da nuvem após determinado timestamp
  fastify.get('/api/v1/sync/pull', async (request, reply) => {
    const { since, limit = '100' } = request.query as { since?: string; limit?: string };

    let query = supabase.from('cats').select('*').limit(parseInt(limit, 10));
    if (since) {
      query = query.gt('updated_at', since);
    }

    const { data, error } = await query;
    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({
      cats: data ?? [],
      has_more: false,
      server_timestamp: new Date().toISOString(),
    });
  });
}
