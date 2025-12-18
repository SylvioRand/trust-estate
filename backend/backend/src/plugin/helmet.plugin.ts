import fp from "fastify-plugin";
import fastifyHelmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";
import crypto from 'crypto'

const helmetPlugin = async (fastify: FastifyInstance): Promise<void> => {
	const nonce = crypto.randomBytes(16).toString('base64');

	await fastify.register(fastifyHelmet, {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				styleSrc: ["'self'","https://fonts.googleapis.com", "'unsafe-inline'"],
				imgSrc: ["'self'","data:", "https:"],
				fontSrc: ["'self'","https://fonts.gstatic.com"],
				objectSrc: ["'none'"],
				upgradeInsecureRequests: []
			}
		},
		crossOriginEmbedderPolicy: true,
		crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
		crossOriginResourcePolicy: { policy: "same-origin" },
		frameguard: { action: 'deny' },
		hidePoweredBy: true,
		hsts: {
			maxAge: 31536000,
			includeSubDomains: true,
			preload: false
		},
		originAgentCluster: true,
		permittedCrossDomainPolicies: { permittedPolicies:'none' },
		referrerPolicy: { policy: "strict-origin-when-cross-origin" },
		noSniff:true,
		xssFilter:true
	});
}

export default fp(helmetPlugin);
