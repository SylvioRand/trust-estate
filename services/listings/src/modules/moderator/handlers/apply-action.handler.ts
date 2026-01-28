import { FastifyReply, FastifyRequest } from "fastify"
import { ModerationActionSchema } from "../moderator.schema";
import { ModeratorServices } from "../moderator.service";

export async function HandleApplyAction(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    const bodyData = ModerationActionSchema.parse(request.body);

    const result = await ModeratorServices.applyModeratorAction(id, user.id, bodyData);

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
        message: "moderator.listing_not_found"
      });
    }

    return reply.status(500).send({
      error: "internal_server_error",
      message: "common.internal_server_error",
      details: error.message
    });
  }
}
