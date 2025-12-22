import type { FastifyInstance } from "fastify";
import apiGateway from "./gateway.ts";
import type { GatewayRouteConfig } from "../interfaces/routes.interface.ts";

export async function gatewayRoutes(app: FastifyInstance) {
	const ROUTES : GatewayRouteConfig[] = [
		{
			prefix: '/auth/register',
			upstream: app.config.API_AUTH_URL_SERVICE,
			rewritePrefix: '/api/auth/register'
		},
		{
			prefix: '/auth/login',
			upstream: app.config.API_AUTH_URL_SERVICE,
			rewritePrefix: '/api/auth/login'
		}
	];
	await Promise.all(
		ROUTES.map(route => apiGateway(app, route))
	)
}