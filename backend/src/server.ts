import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { syncRoutes } from './routes/sync.js';
import { mediaRoutes } from './routes/media.js';
import { catsRoutes } from './routes/cats.js';

export async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Healthcheck
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'catmon-backend', timestamp: new Date().toISOString() };
  });

  // Rotas
  await fastify.register(syncRoutes);
  await fastify.register(mediaRoutes);
  await fastify.register(catsRoutes);

  return fastify;
}

async function start() {
  const server = await buildServer();
  const port = parseInt(process.env.PORT || '3333', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`Catmon backend running on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}
