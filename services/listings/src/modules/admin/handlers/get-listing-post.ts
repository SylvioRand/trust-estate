
import { FastifyRequest, FastifyReply } from "fastify";
import { ListingPostParamsSchema } from "../admin.schema";
import { AdminServices } from "../admin.service";


export async function ListingPostHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        const param = ListingPostParamsSchema.parse(req.params);

        const listing = await AdminServices.getListingPost(param.id);

        if (!listing) {
            reply.status(404).send({ error: "Listing not found" });
            return;
        }
        //need to manage the error 401 -> non connecter
        //need to manage the error 403 -> non moderator or non admin 
        reply.status(200).send(listing);
    }
    catch (error) {
        reply.status(500).send(error);
    }
}