import { FastifyRequest, FastifyReply } from "fastify"
import { ZodError } from "zod";
import { ListingService } from "../listing.service";
import { UpdateAvailabilitySchema } from "../listing.schema";


export async function handleUpdateAvailability(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const user = (request as any).id;
    const schedule = UpdateAvailabilitySchema.parse(request.body);

    await ListingService.updateAvailability(id, user, schedule);

    return reply.status(200).send({
      success: true,
      message: "listing.availability_updated"
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "validation_failed",
        details: error.issues
      });
    }

    if (error.code === 'P2025' || error.message === 'listing.not_found') {
      return reply.status(404).send({ error: "not_found", message: "listing.not_found" });
    }

    if (error.message === 'forbidden') {
      reply.status(403).send({
        error: error.message,
        message: "listing.permission_denie"
      })
    }


    console.error(error);
    return reply.status(500).send({ error: "internal_server_error" });
  }
}
