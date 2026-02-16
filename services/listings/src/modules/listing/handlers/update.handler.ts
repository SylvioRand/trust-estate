import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateListingSchema } from "../listing.schema";
import { ListingService } from "../listing.service";
import { ZodError } from "zod";
import { AIClient } from "../../../infrastructure/ai.client";

const handleZodError = (error: ZodError, reply: FastifyReply) => {
  const details: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const field = issue.path.join('.');
    if (!details[field]) {
      details[field] = [];
    }

    if (issue.message && issue.message.startsWith('validation.')) {
      details[field].push(issue.message);
      return;
    }

    let code = issue.code as string;
    if (code === 'too_big') code = 'too_long';
    if (code === 'too_small') code = 'too_short';
    details[field].push(`validation.listing.${field}.${code}`);
  });

  return reply.status(400).send({
    error: "validation_failed",
    message: "common.validation_failed",
    details
  });
}


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
      return handleZodError(error, reply);
    }

    if (error.message === 'listing.not_found') {
      return reply.status(404).send({ error: "listing_not_found", message: "listing.not_found" });
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
