import fp from "fastify-plugin";
import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from "fastify";

const rateLimitPlugin = async (app: FastifyInstance): Promise<void> => {
	await app.register(fastifyRateLimit, {
		max: 600,
		timeWindow: '1 minute',
		global: true,
		errorResponseBuilder: (request, context) => {
			const err: any = new Error('Rate limit exceeded');
			err.statusCode = 429;
			err.retryAfter = Math.ceil(context.ttl / 1000);
			throw err;
		},
		keyGenerator: (request) => {
			const ip = (request.headers['x-forwarded-for'] as any)?.split(',')[0]
					|| request.socket.remoteAddress;
			return ip
		}
		,
		addHeaders: {
			'x-ratelimit-limit':true,
			'x-ratelimit-remaining':true,
			'x-ratelimit-reset':true
		}
	});
}

export default fp(rateLimitPlugin);