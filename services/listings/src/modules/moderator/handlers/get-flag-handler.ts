import { FastifyReply, FastifyRequest } from "fastify";
import { FlaggedListingsQuerySchema } from "../moderator.schema";
import { ModeratorServices } from "../moderator.service";

export async function Flaghandler(request: FastifyRequest, reply: FastifyReply) {

    try {
        const query = FlaggedListingsQuerySchema.parse(request.query);
        const result = await ModeratorServices.getFlagged(query);
        if (!result) {
            reply.status(404).send({ error: "flagged_listings.not_found" });
            return;
        }
        //need to manage the error 401 -> non connecter
        //need to manage the error 403 -> non moderator 
        reply.status(200).send(result);
    }
    catch (error) {
        reply.status(500).send(error);
    }
}