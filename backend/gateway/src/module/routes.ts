import type { FastifyInstance } from "fastify";
import apiGateway from "./gateway.ts";
import type { GatewayRouteConfig } from "../interfaces/routes.interface.ts";

export async function gatewayRoutes(app: FastifyInstance) {
	const ROUTES : GatewayRouteConfig[] = [
		{
			prefix: '/auth/register',
			upstream: app.config.API_AUTH_URL_SERVICE,
			rewritePrefix: '/api/auth/register',
			rateLimit: false
		},
		{
			prefix: '/auth/login',
			upstream: app.config.API_AUTH_URL_SERVICE,
			rewritePrefix: '/api/auth/login',
			rateLimit: false
		},
		{
			prefix: '/auth/verify-email',
			upstream: app.config.API_AUTH_URL_SERVICE,
			rewritePrefix: '/api/auth/verify-email',
			rateLimit: false
		},
		{
			prefix: '/auth/resend-email',
			upstream: app.config.API_AUTH_URL_SERVICE,
			rewritePrefix: '/api/auth/resend-email',
			rateLimit: true
		},
		{
			prefix: '/auth/google',
			upstream: app.config.API_AUTH_URL_SERVICE,
			rewritePrefix: '/api/auth/google',
			rateLimit: false
		},
		{
			prefix: '/auth/google/callback',
			upstream: app.config.API_AUTH_URL_SERVICE,
			rewritePrefix: '/api/auth/google/callback',
			rateLimit: false
		}
	];
	await Promise.all(
		ROUTES.map(route => apiGateway(app, route))
	)
}