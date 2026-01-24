import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as authControllers from "../auth/auth.controllers"
import { ChangeRoleSchema, ForgotPasswordSchema, LoginUserSchema, ResendEmailSchema, ResetPasswordSchema, SignUpUserSchema, UpdatePhoneNumberSchema, VerificationTokenSchema } from "./auth.schema";
import { changePermissionInterface } from "./auth.interface";

export async function authRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/login", { schema: LoginUserSchema }, authControllers.loginUser);
	app.post("/register", { schema: SignUpUserSchema }, authControllers.signUpUser);
	app.post("/logout", { preHandler: app.partialAuthentication }, authControllers.logoutUser);
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
		schema: ForgotPasswordSchema
	}, authControllers.forgotPassword);
	app.post("/reset-password", { schema: ResetPasswordSchema }, authControllers.resetPassword)
}

export async function emailAuthRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/verify-email", { schema: VerificationTokenSchema }, authControllers.verifiedEmail);
	app.post("/resend-email", {
		config: {
		rateLimit: {
			max: 1,
			timeWindow: "1 minutes",
			hook: "preHandler",
			keyGenerator: (req: any) => {
			const user = (req as any).user;
			const email = user?.email || "";
			const ip = req.ip;
			const ua = req.headers["user-agent"] || "";

			return `${email}:${ip}:${ua}`;
			}
		}
		},
		preHandler: app.partialAuthentication
	}, authControllers.resendEmailVerification)
}

export async function oathAuthRoutes(app: FastifyInstance, options: FastifyPluginOptions) {
	app.get("/google", authControllers.loginOauth)
	app.get("/google/callback", authControllers.googleCallback);
}

export async function authenticationInterne(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/verify-token", { preHandler: app.authValidations }, authControllers.authValidate)
}

export async function spaceModerator(app: FastifyInstance, options: FastifyPluginOptions) {
	app.post("/auth/is-moderator",
		{ preHandler: app.authValidations }
		, authControllers.verificationUserRole);
	app.patch<{Body: changePermissionInterface, Params: {id: string}}>("/auth/change-permission/:id", {
		schema: ChangeRoleSchema,
		preHandler: app.authentication
	}, authControllers.changeUserPermission);
}
