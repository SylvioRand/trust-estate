import type { FastifyInstance, FastifyPluginOptions } from "fastify";
let authControllers: any;

export async function authRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/login", authControllers);
	app.post("/login-phone", authControllers);
	app.post("/register", authControllers);
	app.post("/logout", authControllers);
	app.post("/refresh", authControllers);
}

export async function oathAuthRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/oauth/google", authControllers);
}

