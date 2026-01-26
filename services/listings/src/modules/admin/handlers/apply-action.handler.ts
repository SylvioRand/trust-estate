import { FastifyReply, FastifyRequest } from "fastify"
import { ModerationActionSchema } from "../admin.schema";
import { AdminServices } from "../admin.service";

export async function HandleApplyAction(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const bodyData = ModerationActionSchema.parse(request.body);

    const result = await AdminServices.applyModeratorAction(id, user.id, bodyData);

    return reply.status(200).send(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        error: "validation_failed",
        message: "common.validation_failed",
        details: error.format()
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
