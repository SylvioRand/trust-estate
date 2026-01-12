import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PublishListingSchema } from "./listing.schema";

export async function listingRoutes(app: FastifyInstance) {
  app.post("/publish", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const parsedBody = PublishListingSchema.parse(request.body);
      console.log("Received listing:", parsedBody);
      return reply.status(200).send({ message: "Listing published successfully" });
    } catch (error) {
      return reply.status(500).send({ error: "verifions si on a une erreur" });
    }
  });

  app.get("/health", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ status: "ok" });
  });
}
