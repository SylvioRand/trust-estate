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
	app.post("/verify-email", authControllers.verifiedEmail);
	app.post("/resend-email", {
		config: {
			rateLimit: {
				max: 3,
				timeWindow: "5 minutes",
				hook: "preHandler",
				keyGenerator: (req: any) => {
					const email = req.body?.email || "";
					const ip = req.ip;
					const ua = req.headers["user-agent"] || "";
					console.log(`${email}:${ip}:${ua}`);
					return `${email}:${ip}:${ua}`;
				}
			}
		}
	}, authControllers.resendEmailVerification)
}

export async function oathAuthRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get("/google", authControllers.loginOauth)
	app.get("/google/callback", authControllers.googleCallback);
}

