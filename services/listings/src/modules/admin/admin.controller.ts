import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Flaghandler } from "./handlers/get-flag-handler"
import { ListingPostHandler } from "./handlers/get-listing-post"

export async function adminRoutes(app: FastifyInstance) {
  app.get("/health", async (req, reply) => reply.status(200).send({ status: "ok" }));
  app.get("/listings/flagged", Flaghandler); // pika
  app.get("/listings/:id", ListingPostHandler); // pika
  app.post("/listings/:id/action", async (req, reply) => { reply.status(200).send({ status: "ok" }); }); // srandria
  app.get("/actions", async (req, reply) => { reply.status(200).send({ status: "ok" }); }); // srandria
}