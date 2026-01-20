import { FastifyReply, FastifyRequest } from "fastify";
import { FlaggedListingsQuerySchema } from "../admin.schema";
import { AdminServices } from "../admin.service";

export async function Flaghandler(request: FastifyRequest, reply: FastifyReply) {

    try {
        const query = FlaggedListingsQuerySchema.parse(request.query);
        const result = await AdminServices.getFlagged(query);
        reply.status(200).send(result);
    }
    catch (error) {
        console.log("zod result error");
        reply.status(400).send({ error: "validation_error", message: "Invalid query parameters" });
    }
}