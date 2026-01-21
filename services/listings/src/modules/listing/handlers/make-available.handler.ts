import { FastifyRequest, FastifyReply } from "fastify"
import { ListingService } from "../listing.service";
import { AIClient } from "../../../infrastructure/ai.client";

export async function handleMakeAvailable(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const { listing, features } = await ListingService.makeAvailable(id, user.id);

    AIClient.upsertIndexListing(listing, "POST", features);

    return reply.status(200).send({
      success: true,
      data: listing,
      message: "listing.made_available"
    });
  } catch (err: any) {
    const error = err as Error & { code?: string };

    if (error.code === 'P2025' || error.message === 'listing.not_found') {
      return reply.status(404).send({ error: "not_found", message: "listing.not_found" });
    }

    if (error.message === 'forbidden') {
      return reply.status(403).send({
        error: error.message,
        message: "listing.permission_denied"
      })
    }

    console.error("Manage unavailable error:", error);
    return reply.status(500).send({ error: "internal_server_error" });
  }
}
