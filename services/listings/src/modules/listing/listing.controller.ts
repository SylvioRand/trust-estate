import { FastifyInstance } from "fastify";
import { handlePublish } from "./handlers/publish.handler";

export async function listingRoutes(app: FastifyInstance) {
  app.post('/publish', handlePublish);
  app.get("/health", async (req, reply) => reply.status(200).send({ status: "ok" }));
}
