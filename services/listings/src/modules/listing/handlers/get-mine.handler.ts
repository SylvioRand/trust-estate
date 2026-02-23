import { FastifyRequest, FastifyReply } from "fastify";
import { GetMineListingsSchema } from "../listing.schema";
import { ListingService } from "../listing.service";
import { ZodError } from "zod";

export async function handleGetMine(request: FastifyRequest, reply: FastifyReply) {
    try {
        const user = (request as any).user;

        const query = GetMineListingsSchema.parse(request.query);

        const result = await ListingService.getMineListings(user.id, query);

        const formattedData = result.listings.map(listing => ({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            type: listing.type,
            status: listing.status,
            isAvailable: listing.isAvailable,
            tags: listing.tags,
            views: listing.stats?.views || 0,
            reservations: listing.stats?.reservations || 0,
            photos: listing.photos.map((p: string) => `/uploads/${p}`),
            createdAt: listing.createdAt,
            zone: listing.zone
        }));

        return reply.send({
            data: formattedData,
            stats: result.stats,
            pagination: {
                page: query.page,
                limit: query.limit,
                totalMatching: result.countMatching,
                totalPages: Math.ceil(result.countMatching / query.limit)
            }
        });

    } catch (error) {
        if (error instanceof ZodError) {
            return reply.status(400).send({
                error: "validation_failed",
                details: error.issues.map(issue => issue.message)
            });
        }
        console.error(error);
        return reply.status(500).send({ error: "internal_server_error", message: "common.internal_server_error" });
    }
}
