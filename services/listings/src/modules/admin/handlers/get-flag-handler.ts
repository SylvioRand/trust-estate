import { FastifyReply, FastifyRequest } from "fastify";
import { FlaggedListingsQuerySchema } from "../admin.schema";
import { AdminServices } from "../admin.service";

export async function Flaghandler(request: FastifyRequest, reply: FastifyReply) {

    try {
        const query = FlaggedListingsQuerySchema.parse(request.query);
        const result = await AdminServices.getFlagged(query);
        if (!result) {
            reply.status(404).send({ error: "flagged_listings.not_found" });
            return;
        }
        //need to manage the error 401 -> non connecter
        //need to manage the error 403 -> non moderator or non admin 
        reply.status(200).send(result);
    }
    catch (error) {
        reply.status(500).send(error);
    }
}