import { FastifyRequest, FastifyReply } from "fastify"
import { ZodError } from "zod";
import { ListingService } from "../listing.service";
import { UpdateAvailabilitySchema } from "../listing.schema";


export async function handleUpdateAvailability(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  try {
    const schedule = UpdateAvailabilitySchema.parse(request.body);

    await ListingService.updateAvailability(id, schedule);

    reply.status(200).send({
      success: true,
      message: "listing.availability_updated"
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "validation_failed",
        details: error.issues
      });
    }
  }
}
