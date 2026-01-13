import fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import { listingRoutes } from './modules/listing/listing.controller';

const app = fastify();

app.register(multipart, {
  attachFieldsToBody: false, // stream directement le disque
  limits: {
    fileSize: 10 * 1024 * 1024, // 5MB par fichier
    files: 10 // Max 10 fichiers
  }
});

app.register(cors, {
  origin: true, // Reflète l'origine de la requête (équivalent dynamique)
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