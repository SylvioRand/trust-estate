import { FastifyReply, FastifyRequest } from "fastify";
import { ListingService } from "../listing.service";
import { SearchListingsSchema } from "../listing.schema";
import { ZodError } from "zod";

export async function handleSearch(request: FastifyRequest, reply: FastifyReply) {
    try {
        const query = SearchListingsSchema.parse(request.query);
        const result = await ListingService.searchListings(query);

        const currentUser = (request as any).user;

        const formattedData = result.listings.map(listing => ({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            type: listing.type,
            propertyType: listing.propertyType,
            mine: currentUser ? listing.sellerId === currentUser.id : false,
            zone: listing.zone,
            surface: listing.surface,
            photos: listing.photos.map((p: string) => `/uploads/${p}`),
            status: listing.status,
            isAvailable: listing.isAvailable,
            tags: listing.tags,
            createdAt: listing.createdAt
        }));

        return reply.send({
            data: formattedData,
            pagination: {
                page: query.page,
                limit: query.limit,
                totalMatching: result.countMatching, // Add to contract if needed
                totalPages: Math.ceil(result.countMatching / query.limit)
            }
        });

    } catch (error) {
        if (error instanceof ZodError) {
            return reply.status(400).send({
                error: "validation_failed",
                details: error.issues
            });
        }
        console.error(error);
        return reply.status(500).send({ error: "internal_server_error", message: "common.internal_server_error" });
    }
}