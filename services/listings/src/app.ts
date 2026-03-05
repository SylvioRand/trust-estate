import fastify from 'fastify';
import jwt from 'jsonwebtoken';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import { AuthClient } from './infrastructure/auth.client';
import { listingRoutes } from './modules/listing/listing.controller';
import { moderatorRoutes } from './modules/moderator/moderator.controller';

const app = fastify();

app.register(fastifyCookie);

app.decorate('moderatorAuthentificate', async (request: any, reply: any) => {
  try {
    const user = await AuthClient.isModerator(request.headers.cookie, reply);
    request.user = user;
  } catch (error) {
    reply.status(401).send({
      error: 'unauthorized',
      message: 'auth.unauthorized'
    });
  }
});


app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    const user = await AuthClient.verifyToken(request.headers.cookie, reply);
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
    const user = await AuthClient.verifyToken(request.headers.cookie, reply);
    request.user = user;
  } catch (error) {
    request.user = undefined;
  }
});

app.decorate('internalAuthenticate', async (request: any, reply: any) => {
  const internalKey = request.headers['x-internal-key'];
  const secret = process.env.INTERNAL_KEY_SECRET || "INTERNAL_KEY";

  if (!internalKey) {
    return reply.status(401).send({ error: 'unauthorized', message: 'Missing internal key' });
  }

  try {
    jwt.verify(internalKey as string, secret);
  } catch (error) {
    return reply.status(401).send({ error: 'unauthorized', message: 'Invalid internal key' });
  }
});

app.register(multipart, {
  attachFieldsToBody: false, // stream directement le disque
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB par fichier
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
app.register(moderatorRoutes, { prefix: '/moderator' });

app.listen({ port: 3002, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`listing Server listening on ${address}`);
});
