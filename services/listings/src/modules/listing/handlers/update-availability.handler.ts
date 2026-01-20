import { FastifyRequest, FastifyReply } from "fastify"


export async function handleUpdateAvailability(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
}
