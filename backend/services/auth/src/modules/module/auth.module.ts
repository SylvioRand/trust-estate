import { FastifyInstance } from "fastify";
import { authRoutes, oathAuthRoutes, passwordAuthRoutes, twoFaAuthRoutes, verficationAuthRoutes } from "../routes/auth.routes.ts";

export async function authRegister(app: FastifyInstance) {
	await app.register(authRoutes);
	await app.register(verficationAuthRoutes);
	await app.register(twoFaAuthRoutes);
	await app.register(oathAuthRoutes);
	await app.register(passwordAuthRoutes);
}