import fp from "fastify-plugin";
import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from "fastify";

// Docker internal network ranges — inter-service calls should not be rate limited
const DOCKER_NETWORKS = [
	/^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
	/^10\./,                              // 10.0.0.0/8
	/^192\.168\./,                        // 192.168.0.0/16
	/^127\./,                             // localhost
];

function isDockerInternalIP(ip: string): boolean {
	return DOCKER_NETWORKS.some(range => range.test(ip));
}

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
			const ip = (request.headers['x-forwarded-for'] as any)?.split(',')[0]?.trim()
				|| request.socket.remoteAddress || '';

			// Skip rate limiting for Docker inter-service calls
			// by grouping them under a shared key with allowList
			if (isDockerInternalIP(ip)) {
				return 'internal-service';
			}

			return ip;
		},
		allowList: ['internal-service'],
		addHeaders: {
			'x-ratelimit-limit': true,
			'x-ratelimit-remaining': true,
			'x-ratelimit-reset': true
		}
	});
}

export default fp(rateLimitPlugin);