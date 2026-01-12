import fastify from 'fastify';
import { listingRoutes } from './modules/listing/listing.controller';

const app = fastify();

app.register(listingRoutes, { prefix: '/listings' });

app.listen({ port: 3002, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`listing Server listening on ${address}`);
});

