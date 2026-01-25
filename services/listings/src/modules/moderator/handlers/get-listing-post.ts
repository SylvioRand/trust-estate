
import { FastifyRequest, FastifyReply } from "fastify";
import { ListingPostParamsSchema } from "../moderator.schema";
import { ModeratorServices } from "../moderator.service";


export async function ListingPostHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        const param = ListingPostParamsSchema.parse(req.params);

        const listing = await ModeratorServices.getListingPost(param.id);

        if (!listing) {
            reply.status(404).send({ error: "Listing not found" });
            return;
        }
        //need to manage the error 401 -> non connecter
        //need to manage the error 403 -> non moderator
        reply.status(200).send(listing);
    }
    catch (error) {
        reply.status(500).send(error);
    }
}