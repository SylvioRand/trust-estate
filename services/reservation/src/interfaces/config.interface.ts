export interface EnvConfigInterface {
	PORT_AUTH_RESERVATION: string
	API_AUTH_URL_SERVICE: string
	JWT_SECRET_PUBLIC_KEY: string
	GMAIL_USER: string
	GMAIL_APP_PASSWORD: string
	COOKIE_SECRET: string
	FRONTEND_URL: string
}

export interface UserInterface {
	id: string;
	role: string;
	phoneVerified?: boolean;
	emailVerified?: boolean;
}