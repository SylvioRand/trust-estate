import fastify from 'fastify';

const app = fastify();

app.register(async (fastify) => {
  fastify.get('/health', (req, res) => {
    res.send({ status: 'ok' });
  });

  fastify.get('/publish', (req, res) => {
    res.send('BOnjour fastify');
  });
}, { prefix: '/listings' });

app.listen({ port: 3002, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});

