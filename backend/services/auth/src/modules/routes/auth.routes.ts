import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as authControllers from "../controller/auth.controllers.ts"
import { LoginUserSchema, SignUpUserSchema } from "../schemas/auth.schema.ts";

export async function authRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/login", {schema: LoginUserSchema}, authControllers.loginUser);
	app.post("/register", {schema: SignUpUserSchema}, authControllers.signUpUser);
	app.post("/logout", authControllers.logoutUser);
	app.post("/refresh", authControllers.refreshToken);
}

export async function emailAuthRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/verify-mail", authControllers.verifiedEmail);
}

export async function oathAuthRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/oauth/google", authControllers.loginOauth);
}

