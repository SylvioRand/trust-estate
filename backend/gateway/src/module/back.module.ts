import type { FastifyInstance } from "fastify";
import helmetPlugin from "../plugin/helmet.plugin.ts";
import rateLimitPlugin from "../plugin/rate-limit.ts";
import fastifyCookie from "@fastify/cookie";
import jwtPlugin from "../plugin/jwt.plugin.ts";

export async function moduleRegister(app: FastifyInstance) {
	await app.register(fastifyCookie, {
		secret: app.config.COOKIE_SECRET,
	});
	await app.register(jwtPlugin);
	await app.register(rateLimitPlugin);
	await app.register(helmetPlugin);
}