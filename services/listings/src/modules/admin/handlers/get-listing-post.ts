
import { FastifyRequest, FastifyReply } from "fastify";
import { ListingPostParamsSchema } from "../admin.schema";
import { AdminServices } from "../admin.service";


export async function ListingPostHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        const param = ListingPostParamsSchema.parse(req.params);

        const listing = await AdminServices.getListingPost(param.id);

        reply.status(200).send(listing);

    }
    catch (error) {
        reply.status(500).send(error);
    }
}