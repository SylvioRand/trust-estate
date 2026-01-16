import type { FastifyInstance } from "fastify";
import jwtPlugin from "../../plugin/jwt.plugin";
import prismaPlugin from "../../plugin/prisma.plugin";
import { feedbackRoutes } from "./feedback.routes";

export async function pluginRegister(app: FastifyInstance) {
	await app.register(prismaPlugin);
	await app.register(jwtPlugin);
}

export async function feedbackRoutesRegister(app: FastifyInstance) {
	await app.register(feedbackRoutes);
}