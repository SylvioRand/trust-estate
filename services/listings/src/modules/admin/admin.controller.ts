import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Flaghandler } from "./handlers/get-flag-handler"
import { ListingPostHandler } from "./handlers/get-listing-post"
import { HandleApplyAction } from "./handlers/apply-action.handler";
import { AuthClient } from "../../infrastructure/auth.client";
import { GetActionsHandler } from "./handlers/get-actions-handler";

export async function adminRoutes(app: FastifyInstance) {
  app.get("/health", async (req: FastifyRequest, reply: FastifyReply) => reply.status(200).send({ status: "ok" }));
  app.get("/listings/flagged", { preHandler: (app as any).moderatorAuthentificate }, Flaghandler); // pika
  app.get("/listings/:id", { preHandler: (app as any).moderatorAuthentificate }, ListingPostHandler); // pika
  app.post("/listings/:id/action", { preHandler: (app as any).moderatorAuthentificate }, HandleApplyAction);
  app.get("/actions", { preHandler: (app as any).moderatorAuthentificate }, GetActionsHandler);
}
