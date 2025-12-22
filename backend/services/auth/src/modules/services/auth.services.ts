import type { FastifyInstance, FastifyReply } from "fastify";

export async function findUserByEmail(app: FastifyInstance, email: string, password: string, reply: FastifyReply) {
	const user = app.prisma.user.findMany();
	console.log(user);
}