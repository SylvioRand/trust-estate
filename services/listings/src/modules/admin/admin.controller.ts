import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Flaghandler } from "./handlers/get-flag-handler";

export async function adminRoutes(app: FastifyInstance) {
  app.get("/health", async (req, reply) => reply.status(200).send({ status: "ok" }));
  app.get("/listings/flagged", Flaghandler); // pika
  app.get("listings/:id", async (req: FastifyRequest, reply: FastifyReply) => { reply.status(200).send({ status: "ok" }); }); // pika
  app.post("/listings/:id/action", async (req, reply) => { reply.status(200).send({ status: "ok" }); }); // srandria
  app.get("/actions", async (req, reply) => { reply.status(200).send({ status: "ok" }); }); // srandria
}