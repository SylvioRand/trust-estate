export interface EnvConfigInterface {
	PORT_AUTH_CREDIT: string
	AUTH_SERVICE_URL: string
	JWT_SECRET_PUBLIC_KEY: string
	GMAIL_USER: string
	GMAIL_APP_PASSWORD: string
	COOKIE_SECRET: string
	FRONTEND_URL: string
	INTERNAL_KEY_SECRET: string
}

export interface UserInterface {
	id: string;
	role: string;
	phoneVerified?: boolean;
	emailVerified?: boolean;
}