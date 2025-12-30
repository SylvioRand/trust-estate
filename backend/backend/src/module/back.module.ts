import type { FastifyInstance } from "fastify";
import helmetPlugin from "../plugin/helmet.plugin.ts";
import rateLimitPlugin from "../plugin/rate-limit.ts";

export async function moduleRegister(app: FastifyInstance) {
	await app.register(rateLimitPlugin);
	await app.register(helmetPlugin);
}