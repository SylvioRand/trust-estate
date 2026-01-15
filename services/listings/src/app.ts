import fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import { AuthClient } from './modules/auth.client';
import { listingRoutes } from './modules/listing.controller';

const app = fastify();

app.register(fastifyCookie);

app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    const user = await AuthClient.verifyToken(request.headers.cookie);
    request.user = user;
  } catch (error) {
    reply.status(401).send({
      error: 'unauthorized',
      message: 'auth.unauthorized'
    });
  }
});

app.decorate('optionalAuthenticate', async (request: any, reply: any) => {
  try {
    const user = await AuthClient.verifyToken(request.headers.cookie);
    request.user = user;
  } catch (error) {
    request.user = undefined;
  }
});

app.register(multipart, {
  attachFieldsToBody: false, // stream directement le disque
  limits: {
    fileSize: 30 * 1024 * 1024, // 10MB par fichier
    files: 10 // Max 10 fichiers
  }
});

app.register(cors, {
  origin: true,
  credentials: true, // Permet l'envoi de cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

app.register(listingRoutes, { prefix: '/listings' });

app.listen({ port: 3002, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`listing Server listening on ${address}`);
});