import fastifyPlugin from "fastify-plugin";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { PrismaClient } from '@prisma/client'

async function prismaPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
	const prisma = new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	});

	await prisma.$connect();

	await prisma
	fastify.decorate('prisma', prisma);
	fastify.addHook('onClose', async (fastify: FastifyInstance) => {
		await prisma.$disconnect();
	});
}

export default fastifyPlugin(prismaPlugin);
