import { FastifyRequest, FastifyReply } from "fastify";
import { GetOneParamsSchema } from "../listing.schema";
import { ZodError } from "zod";
import { ListingService } from "../listing.service";
import { AuthClient } from "../../../infrastructure/auth.client";
import { ReservationClienr } from "../../../infrastructure/reservation.client";

export async function handleGetOne(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = GetOneParamsSchema.parse(request.params);
    const { listing, sellerStats } = await ListingService.getOne(id);

    const currentUser = (request as any).user;
    const isMine = currentUser?.id === listing.sellerId;

    const response: any = {
      id: listing.id,
      mine: isMine,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      type: listing.type,
      surface: listing.surface,
      zone: listing.zone,
      photos: listing.photos,
      features: listing.features ? {
        bedrooms: listing.features.bedrooms,
        bathrooms: listing.features.bathrooms,
        wc_separate: listing.features.wc_separate,
        parking_type: listing.features.parking_type,
        garden_private: listing.features.garden_private,
        water_access: listing.features.water_access,
        electricity_access: listing.features.electricity_access,
        pool: listing.features.pool,
      } : {},
      status: listing.status,
      sellerVisible: isMine,
      sellerStats: {
        totalListings: sellerStats?.totalListings || 0,
        successfulSales: sellerStats?.successfulSales || 0,
        averageRating: sellerStats?.averageRating || 0
      },
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString()
    };

    if (currentUser?.id) {
      const result = await AuthClient.getUserDetails(reply, listing.sellerId);
      ReservationClienr.getReservationStatus(listing.id, currentUser.id);
      response.seller = {
        id: result?.id,
        name: `${result?.firstName} ${result?.lastName}`,
        phone: result?.phone,
        email: result?.email,
        memberSince: result?.createdAt
      };
    }



    // TODO
    // If reservation confirmed logic existed:
    // if (confirmedReservation) {
    //   response.seller = { ... }; 
    // }

    reply.status(200).send(response);

  } catch (error: any) {
    if (error instanceof ZodError) {
      reply.status(400).send({
        "error": "validation_error",
        "message": error.issues
      });
      return;
    }

    if (error.message === 'listing.not_found') {
      reply.status(404).send({
        "error": "listing_not_found",
        "message": "listing.not_found"
      });
      return;
    }

    // Default error
    reply.status(500).send({
      "error": "internal_server_error",
      "message": "An unexpected error occurred"
    });
  }
}
