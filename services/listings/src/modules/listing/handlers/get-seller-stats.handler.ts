import { FastifyRequest, FastifyReply } from "fastify";
import { ListingService } from "../listing.service";
import { z } from "zod";
import { GetSellerStatsParamsSchema } from "../listing.schema";

export async function handleGetSellerStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId } = GetSellerStatsParamsSchema.parse(request.params);

    const stats = await ListingService.getSellerStats(userId);

    if (!stats) {
      return reply.status(404).send({
        error: "seller_stats_not_found",
        message: "Seller statistics not found for this user."
      });
    }

    return reply.send({
      data: {
        totalListings: stats.totalListings,
        activeListings: stats.activeListings,
        successfulSales: stats.successfulSales,
        successfulRents: stats.successfulRents,
        averageRating: stats.averageRating,
        responseRate: stats.responseRate
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: "validation_failed",
        details: error.issues
      });
    }
    console.error(error);
    return reply.status(500).send({ error: "internal_server_error", message: "common.internal_server_error" });
  }
}
