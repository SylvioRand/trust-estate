import { FastifyReply, FastifyRequest } from "fastify";
import { GetAvailabilityParamsSchema } from "../../listing/listing.schema";
import { ListingService } from "../listing.service";
import { ZodError } from "zod";
import jwt from 'jsonwebtoken';

export async function getAvailability(request: FastifyRequest, reply: FastifyReply) {
  try {
    const availabilityParams = GetAvailabilityParamsSchema.parse(request.params);

    const listing = await ListingService.getAvailability(availabilityParams);

    // 1. Check if it's an internal call (e.g. from Reservation Service)
    const internalKey = request.headers['x-internal-key'];
    const secret = process.env.INTERNAL_KEY_SECRET || "INTERNAL_KEY";
    let isInternal = false;

    if (internalKey) {
      try {
        jwt.verify(internalKey as string, secret);
        isInternal = true;
      } catch (error) {
        // Invalid key, but maybe it's the owner?
      }
    }

    // 2. Check if it's the owner
    const currentUser = (request as any).user;
    const isOwner = currentUser?.id === listing.sellerId;

    if (!isInternal && !isOwner) {
      return reply.status(403).send({
        error: "forbidden",
        message: "auth.forbidden"
      });
    }

    return reply.status(200).send({
      weeklySchedule: listing.availability.map((slot: any) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "validation_error",
        message: error.issues
      });
    }

    if (error.message === 'listing.not_found') {
      return reply.status(404).send({
        error: "listing_not_found",
        message: "listing.not_found"
      });
    }

    return reply.status(500).send({
      error: "internal_server_error",
      message: "An unexpected error occurred"
    });
  }
}
