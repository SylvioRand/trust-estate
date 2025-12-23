import type {  FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import { PassThrough } from 'stream';
import type { GatewayRouteConfig } from "../interfaces/routes.interface.ts";

export default async function apiGateway(app: FastifyInstance, route: GatewayRouteConfig) {
	app.server.setTimeout(10000);

	const emailRateLimit = {
		max: 3,
		timeWindow: '1 minutes',
		hook: 'preHandler',
		keyGenerator: (request: any) => {
			const email = request.body?.email || '';
			const ip = request.ip;
			const ua = request.headers['user-agent'] || '';
			console.log( `${email}:${ip}:${ua}`);
			return `${email}:${ip}:${ua}`;
		}
	};

	await app.register(fastifyHttpProxy, {
		upstream: route.upstream,
		prefix: route.prefix,
		rewritePrefix: route.rewritePrefix,
		http2: false,
		disableCache: true,
		config: {
			rateLimit: emailRateLimit
		},
		replyOptions: {
			onResponse: async (request, reply , res: any) => {
				reply.raw.statusCode = res.statusCode ?? 502;

				const allowedHeaders = [
					'content-type',
					'content-length',
					'set-cookie'
				];

				for (const [key, value] of Object.entries(res.headers)) {
					if (allowedHeaders.includes(key.toLowerCase()) && value) {
						const headerValue =
							Array.isArray(value) ? value.join(', ') : String(value);
							reply.raw.setHeader(key, headerValue);
					}
				}
				if (res.stream) {
					const passthrough = new PassThrough();
					res.stream.pipe(passthrough);
					reply.send(passthrough);
				} else {
					reply.send();
				}
			},
			onError: (reply, error: any) => {
				app.log.error(error);
				reply.code(502).send({ error: 'Auth service unavailable' });
			}
		},
		preHandler: (request, reply , done: any) => {
			delete request.headers.host;
			delete request.headers['x-forwarded-host'];
			delete request.headers['x-forwarded-for'];
			delete request.headers['x-real-ip'];
			request.headers['x-gateway-name'] = 'api-gateway';
			request.headers['x-internal-gateway'] = app.config.INTERNAL_SECRET;
			done();
		}
	});
}
