import { FastifyReply, FastifyRequest } from "fastify";
import { ReservationIdSchema } from "../listing.schema";
import { ListingService } from "../listing.service";

export async function handleConfirmReservation(request: FastifyRequest, reply: FastifyReply) {
  try {
    const listingId = ReservationIdSchema.parse(request.params);

    await ListingService.incrementReservationStat(listingId.listingId);

  } catch (error: any) {
    if (error.message === 'listing.not_found') {
      return reply.status(404).send({
        error: "listing_not_found",
        message: error.message
      })
    }
    return reply.status(500).send({
      error: "internal_server_error",
      message: "An unexpected error occurred"
    });

  }
}
