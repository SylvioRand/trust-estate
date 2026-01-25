
import { FastifyReply, FastifyRequest } from "fastify"
import { ModerationActionsQuerySchema } from "../admin.schema";
import { AdminServices } from "../admin.service";
import { ZodError } from "zod";

export async function GetActionsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = ModerationActionsQuerySchema.parse(request.query);

    const result = await AdminServices.getModerationActions(query);

    return reply.status(200).send(result);
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
        error: "not_found",
        message: "admin.listing_not_found"
      });
    }

    return reply.status(500).send({
      error: "internal_server_error",
      message: "common.internal_server_error",
      details: error.message
    });
  }
}
