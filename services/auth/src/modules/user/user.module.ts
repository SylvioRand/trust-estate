import { FastifyInstance } from "fastify";
import { userRoutes } from "./user.routes";

export async function userRegister(app: FastifyInstance) {
	await app.register(userRoutes);
}