import { FastifyRequest, FastifyReply } from "fastify";
import { ArchiveListingSchema } from "../listing.schema";
import { ListingService } from "../listing.service";
import { ZodError } from "zod";

export async function handleArchive(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const validatedData = ArchiveListingSchema.parse(request.body || {});

    const result = await ListingService.archiveListing(id, user.id, validatedData);

    return reply.status(200).send({
      archived: true,
      finalStatus: result.status,
      archivedAt: result.soldAt
    });

  } catch (error: any) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "validation_failed",
        message: "common.validation_failed",
        details: error.issues
      });
    }

    if (error.message === 'listing.not_found') {
      return reply.status(404).send({
        error: "listing_not_found",
        message: "listing.not_found"
      });
    }

    if (error.message === 'forbidden') {
      return reply.status(403).send({
        error: "forbidden",
        message: "listing.permission_denied"
      });
    }

    if (error.message === 'listing.already_archived') {
      return reply.status(400).send({
        error: "bad_request",
        message: "listing.already_archived"
      });
    }

    console.error(error);
    return reply.status(500).send({ error: "internal_server_error" });
  }
}
