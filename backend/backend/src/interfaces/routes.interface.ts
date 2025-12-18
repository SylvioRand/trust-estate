export interface GatewayRouteConfig {
	upstream: string;
	prefix: string;
	rewritePrefix?: string;
}