import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase.js';

export async function catsRoutes(fastify: FastifyInstance) {
  // Busca espacial de proximidade via PostGIS RPC
  fastify.get('/api/v1/cats/nearby', async (request, reply) => {
    const { lat, lng, radius = '1000' } = request.query as {
      lat?: string;
      lng?: string;
      radius?: string;
    };

    if (!lat || !lng) {
      return reply.status(400).send({ error: 'Parâmetros lat e lng são obrigatórios' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseFloat(radius);

    const { data, error } = await supabase.rpc('get_cats_within_radius', {
      center_lat: latitude,
      center_lng: longitude,
      radius_meters: radiusMeters,
    });

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({
      total: data?.length ?? 0,
      data: data ?? [],
    });
  });
}
