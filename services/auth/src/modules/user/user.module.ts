import { FastifyInstance } from "fastify";
import { RGPDRoutes, userRoutes } from "./user.routes";

export async function userRegister(app: FastifyInstance) {
	await app.register(userRoutes);
	await app.register(RGPDRoutes);
}