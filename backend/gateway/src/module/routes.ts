import type { FastifyInstance } from "fastify";
import apiGateway from "./gateway.ts";
import type { GatewayRouteConfig } from "../interfaces/routes.interface.ts";

function createAuthRoute(app: FastifyInstance, path: string, rewrite?: string,
	rateLimit = false, authRequired = false 
): GatewayRouteConfig {
	const prefix = `/auth/${path}`;

	return {
		prefix,
		upstream: app.config.API_AUTH_URL_SERVICE,
		rewritePrefix: rewrite ?? `/api/auth/${path}`,
		rateLimit,
		authRequired
	};
}


export async function gatewayRoutes(app: FastifyInstance) {
	const ROUTES: GatewayRouteConfig[] = [
		createAuthRoute(app, "register"),
		createAuthRoute(app, "login"),
		createAuthRoute(app, "logout", undefined, false, true),
		createAuthRoute(app, "verify-email"),
		createAuthRoute(app, "resend-email", undefined, true),
		createAuthRoute(app, "google"),
		createAuthRoute(app, "google/callback"),
		createAuthRoute(app, "me", "/api/profile", false, true ),
		createAuthRoute(app, "refresh"),
	];

	await Promise.all(
		ROUTES.map(route => apiGateway(app, route))
	)
}