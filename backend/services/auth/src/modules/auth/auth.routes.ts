import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as authControllers from "../auth/auth.controllers.ts"
import { ForgotPasswordSchema, LoginUserSchema, ResendEmailSchema, ResetPasswordSchema, SignUpUserSchema, UpdatePhoneNumberSchema, VerificationTokenSchema } from "./auth.schema.ts";

export async function authRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/login", {schema: LoginUserSchema}, authControllers.loginUser);
	app.post("/register", {schema: SignUpUserSchema}, authControllers.signUpUser);
	app.post("/logout",{preHandler: app.authentication }, authControllers.logoutUser);
	app.get("/refresh", authControllers.refreshToken);
	app.post("/update-phone", {schema: UpdatePhoneNumberSchema}, authControllers.updatePhoneNumber);
	app.post("/forgot-password", {
		config: {
			rateLimit: {
				max: 1,
				timeWindow: "1 minutes",
				hook: "preHandler",
				keyGenerator: (req: any) => {
					const email = req.body?.email || "";
					const ip = req.ip;
					const ua = req.headers["user-agent"] || "";

					return `${email}:${ip}:${ua}`;
				}
			}
		},
		schema: ForgotPasswordSchema}, authControllers.forgotPassword);
	app.post("/reset-password", {schema: ResetPasswordSchema}, authControllers.resetPassword)
}

export async function emailAuthRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/verify-email", {schema: VerificationTokenSchema }, authControllers.verifiedEmail);
	app.post("/resend-email", {
		config: {
			rateLimit: {
				max: 1,
				timeWindow: "1 minutes",
				hook: "preHandler",
				keyGenerator: (req: any) => {
					const email = req.body?.email || "";
					const ip = req.ip;
					const ua = req.headers["user-agent"] || "";

					return `${email}:${ip}:${ua}`;
				}
			}
		},
		schema: ResendEmailSchema
	}, authControllers.resendEmailVerification)
}

export async function oathAuthRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get("/google", authControllers.loginOauth)
	app.get("/google/callback", authControllers.googleCallback);
}

export async function profile(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get("/me", {preHandler: app.authentication },authControllers.profile);
}