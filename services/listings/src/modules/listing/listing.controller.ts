import { FastifyInstance } from "fastify";
import { handlePublish } from "./handlers/publish.handler";
import { handleGetMine } from "./handlers/get-mine.handler";
import { handleSearch } from "./handlers/search.handler";
import { handleUpdate } from "./handlers/update.handler";
import { handleArchive } from "./handlers/archive.handler";
import { handleReport } from "./handlers/report.handler";
import { handleGetOne } from "./handlers/get-one.handler";
import { handleGetSellerStats } from "./handlers/get-seller-stats.handler";

export async function listingRoutes(app: FastifyInstance) {
  app.get("/health", async (req, reply) => reply.status(200).send({ status: "ok" }));
  app.post('/publish', { preHandler: (app as any).authenticate }, handlePublish);
  app.get('/mine', { preHandler: (app as any).authenticate }, handleGetMine);
  app.get('/', { preHandler: (app as any).optionalAuthenticate }, handleSearch);
  app.put('/:id', { preHandler: (app as any).authenticate }, handleUpdate);
  app.post('/:id/archive', { preHandler: (app as any).authenticate }, handleArchive);
  app.post('/:id/report', { preHandler: (app as any).authenticate }, handleReport);
  app.get('/seller/:userId/stats', { preHandler: (app as any).internalAuthenticate }, handleGetSellerStats);
  app.get('/:id', { preHandler: (app as any).optionalAuthenticate }, handleGetOne);
  app.post('/:id/availability', { preHandler: (app as any).authenticate }, (req, reply) => { reply.status(200).send({ message: 'ok' }) });
  app.get('/:id/slots', { preHandler: (app as any).optionalAuthenticate }, (req, reply) => { reply.status(200).send({ message: 'ok' }) });
}
