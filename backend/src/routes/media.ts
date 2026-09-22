import { FastifyInstance } from 'fastify';
import { supabase } from '../plugins/supabase.js';

export async function mediaRoutes(fastify: FastifyInstance) {
  fastify.post('/api/v1/media/upload', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'Nenhum arquivo enviado' });
    }

    const catId = (data.fields.cat_id as any)?.value || 'unknown';
    const buffer = await data.toBuffer();
    const filePath = `cats/${catId}.jpg`;

    const { error } = await supabase.storage
      .from('cat-photos')
      .upload(filePath, buffer, {
        contentType: data.mimetype,
        upsert: true,
      });

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    const { data: publicData } = supabase.storage
      .from('cat-photos')
      .getPublicUrl(filePath);

    return reply.status(201).send({
      cat_id: catId,
      remote_photo_url: publicData.publicUrl,
    });
  });
}
