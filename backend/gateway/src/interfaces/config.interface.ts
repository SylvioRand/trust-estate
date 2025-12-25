export interface EnvConfigInterface {
	PORT_BACKEND: string,
	API_AUTH_URL_SERVICE: string,
	INTERNAL_SECRET: string
	JWT_SECRET_PUBLIC_KEY: string
	COOKIE_SECRET: string
	GATEWAY_SECRET_PRIVATE_KEY: string
	GATEWAY_SECRET_PUBLIC_KEY: string
}