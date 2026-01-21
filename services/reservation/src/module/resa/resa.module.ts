import { FastifyInstance } from "fastify";
import jwtPlugin from "../../plugin/jwt.plugin";
import prismaPlugin from "../../plugin/prisma.plugin";
import { reservationRoutes, deleteData } from "./resa.routes";

export async function pluginRegister(app: FastifyInstance) {
	await app.register(prismaPlugin);
	await app.register(jwtPlugin);
}

export async function resaRoutes(app: FastifyInstance) {
	await app.register(reservationRoutes);
	await app.register(deleteData);
}
