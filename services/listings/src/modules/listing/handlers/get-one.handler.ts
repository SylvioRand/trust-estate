import { FastifyRequest, FastifyReply } from "fastify";

export async function handleGetOne(request: FastifyRequest, reply: FastifyReply) {
  reply.status(200).send(" message: 'handleGetOne' ");
}
