import { FastifyInstance } from "fastify";

export async function adminRoutes(app: FastifyInstance) {
    app.get("/health", async (req, reply) => reply.status(200).send({ status: "ok" }));
    // app.get("/listings/flagged", )
}