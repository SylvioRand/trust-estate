import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateListingSchema } from "../listing.schema";
import { ListingService } from "../listing.service";
import { ZodError } from "zod";
import { AIClient } from "../../../infrastructure/ai.client";

export async function handleUpdate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const validatedData = UpdateListingSchema.parse(request.body);

    const { listing, features } = await ListingService.updateListing(id, user.id, validatedData);

    AIClient.upsertIndexListing(listing, "PUT", features);

    return reply.status(200).send({
      listingId: listing.id,
      updated: true
    });

  } catch (error: any) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "validation_failed",
        details: error.issues
      });
    }

    if (error.message === 'listing.not_found') {
      return reply.status(404).send({ error: "not_found", message: "listing.not_found" });
    }

    if (error.message === 'forbidden') {
      return reply.status(403).send({
        error: "forbidden",
        message: "listing.permission_denied"
      });
    }

    console.error(error);
    return reply.status(500).send({ error: "internal_server_error" });
  }
}
