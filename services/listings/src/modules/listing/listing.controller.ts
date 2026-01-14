import { FastifyInstance } from "fastify";
import { handlePublish } from "./handlers/publish.handler";
import { handleGetMine } from "./handlers/get-mine.handler";
import { handleSearch } from "./handlers/search.handler";
import { handleUpdate } from "./handlers/update.handler";
import { handleArchive } from "./handlers/archive.handler";

export async function listingRoutes(app: FastifyInstance) {
  app.post('/publish', { preHandler: (app as any).authenticate }, handlePublish);
  app.get("/health", async (req, reply) => reply.status(200).send({ status: "ok" }));
  app.get('/mine', { preHandler: (app as any).authenticate }, handleGetMine);
  app.get('/', { preHandler: (app as any).optionalAuthenticate }, handleSearch);
  app.put('/:id', { preHandler: (app as any).authenticate }, handleUpdate);
  app.post('/:id/archive', { preHandler: (app as any).authenticate }, handleArchive);
}