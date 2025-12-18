import fp from "fastify-plugin";
import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from "fastify";

const rateLimitPlugin = async (app: FastifyInstance): Promise<void> => {
	await app.register(fastifyRateLimit, {
		max: 100,
		timeWindow: '10 seconds',
		global: true,
		errorResponseBuilder(req: any, context: any) {
			console.log(`User ${context.key} has exceeded the rate limit`);
			return {
				statusCode: 429,
				error: 'Too Many Requests',
				message: `Rate limit exceeded, retry after ${context.ttl} seconds`
			};
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