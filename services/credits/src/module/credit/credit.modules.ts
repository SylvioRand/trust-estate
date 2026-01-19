import type { FastifyInstance } from "fastify";
import jwtPlugin from "../../plugin/jwt.plugin";
import prismaPlugin from "../../plugin/prisma.plugin";
import { creditRoutes, InternalRoutes } from "./credit.routes";

export async function pluginRegister(app: FastifyInstance) {
	await app.register(prismaPlugin);
	await app.register(jwtPlugin);
}

export async function creditRoutesRegister(app: FastifyInstance) {
	await app.register(creditRoutes);
	await app.register(InternalRoutes);
}