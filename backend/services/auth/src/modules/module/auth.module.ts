import type { FastifyInstance } from "fastify";
import { authRoutes, emailAuthRoutes, oathAuthRoutes, profile } from "../routes/auth.routes.ts";
import fastifyCookie from "fastify-cookie";
import jwtPlugin from "../../plugin/jwt.plugin.ts";
import prismaPlugin from "../../plugin/prisma.plugin.ts";
import mailPlugin from "../../plugin/mail.plugin.ts";

export async function authRegister(app: FastifyInstance) {
	await app.register(fastifyCookie, {
		secret: app.config.COOKIE_SECRET,
	});
	await app.register(jwtPlugin);
	await app.register(prismaPlugin);
	await app.register(mailPlugin);
	await app.register(authRoutes, {prefix: "/api/auth"});
	await app.register(emailAuthRoutes, {prefix: "/api/auth"})
	await app.register(oathAuthRoutes, {prefix: "/api/auth"});
	await app.register(profile, {prefix: "/api"});
}