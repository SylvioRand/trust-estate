import { FastifyRequest, FastifyReply } from "fastify";
import { GetOneParamsSchema } from "../listing.schema";
import { ZodError } from "zod";
import { ListingService } from "../listing.service";
import { AuthClient } from "../../../infrastructure/auth.client";
import { ReservationClient } from "../../../infrastructure/reservation.client";

export async function handleGetOne(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = GetOneParamsSchema.parse(request.params);
    const { listing, sellerStats, isReported } = await ListingService.getOne(id);

    ListingService.incrementViews(id).catch(err =>
      console.error('Failed to increment views:', err)
    );

    const currentUser = (request as any).user;
    const isMine = currentUser?.id === listing.sellerId;
    let confirmedReservation = false;

    if (currentUser?.id && !isMine) {
      const status = await ReservationClient.getReservationStatus(listing.id, currentUser.id);
      confirmedReservation = status.confirmed;
    }

    const sellerVisible = isMine || confirmedReservation;
    let sellerData = undefined;

    if (sellerVisible) {
      try {
        const user = await AuthClient.getUserDetails(listing.sellerId);
        sellerData = {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          email: user.email,
          memberSince: user.createdAt
        };
      } catch (error) {
        console.error('Failed to fetch seller details:', error);
      }
    }

    const response: any = {
      id: listing.id,
      mine: isMine,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      type: listing.type,
      propertyType: listing.propertyType,
      surface: listing.surface,
      zone: listing.zone,
      photos: listing.photos.map((p: string) => `/uploads/${p}`),
      features: listing.features ? {
        bedrooms: listing.features.bedrooms,
        bathrooms: listing.features.bathrooms,
        wc: listing.features.wc,
        wc_separate: listing.features.wc_separate,
        parking_type: listing.features.parking_type,
        garden_private: listing.features.garden_private,
        water_access: listing.features.water_access,
        electricity_access: listing.features.electricity_access,
        pool: listing.features.pool,
      } : {},
      status: listing.status,
      sellerVisible: sellerVisible,
      seller: sellerData,
      sellerStats: {
        totalListings: sellerStats?.totalListings || 0,
        successfulRent: sellerStats?.successfulRents || 0,
        successfulSales: sellerStats?.successfulSales || 0,
        averageRating: sellerStats?.averageRating || 0
      },
      isAvailable: listing.isAvailable,
      stats: isMine && listing.stats ? {
        views: listing.stats.views,
        reservations: listing.stats.reservations,
      } : {},
      tags: listing.tags,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      isReported: isReported
    };

    return reply.status(200).send(response);

  } catch (error: any) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        "error": "validation_error",
        "message": error.issues[0]?.message || "listing.not_found"
      });
    }

    if (error.message === 'listing.not_found') {
      return reply.status(404).send({
        "error": "listing_not_found",
        "message": "listing.not_found"
      });
    }

    return reply.status(500).send({
      "error": "internal_server_error",
      "message": "An unexpected error occurred"
    });
  }
}
