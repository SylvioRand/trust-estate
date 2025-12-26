import type { FastifyInstance } from "fastify";
import { authRoutes, emailAuthRoutes, oathAuthRoutes, profile } from "./auth.routes.ts";
import fastifyCookie from "fastify-cookie";
import jwtPlugin from "../../plugin/jwt.plugin.ts";
import prismaPlugin from "../../plugin/prisma.plugin.ts";
import mailPlugin from "../../plugin/mail.plugin.ts";
import helmetPlugin from "../../plugin/helmet.plugin.ts";
import rateLimitPlugin from "../../plugin/rate-limit.ts";

export async function pluginRegister(app: FastifyInstance) {
	await app.register(fastifyCookie, {
		secret: app.config.COOKIE_SECRET,
	});
	await app.register(jwtPlugin);
	await app.register(rateLimitPlugin);
	await app.register(helmetPlugin);
	await app.register(prismaPlugin);
	await app.register(mailPlugin);
}

export async function authRegister(app: FastifyInstance) {
	await app.register(authRoutes, {prefix: "/auth"});
	await app.register(emailAuthRoutes, {prefix: "/auth"})
	await app.register(oathAuthRoutes, {prefix: "/auth"});
	await app.register(profile, {prefix: "/auth"});
}
