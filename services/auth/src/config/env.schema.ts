export const envSchema = {
	type: 'object',
	required: [
		'PORT_AUTH_SERVICE',
		'JWT_REFRESH_SECRET',
		'JWT_SECRET_PRIVATE_KEY', 'JWT_SECRET_PUBLIC_KEY',
		'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GMAIL_USER', 'GMAIL_APP_PASSWORD',
		'COOKIE_SECRET', 'FRONTEND_URL',
		'REDIRECT_URI', 'AUTH_URL', 'TOKEN_URL', 'USER_INFO_URL',
		'INTERNAL_KEY_SECRET',
		'CREDITS_SERVICE_URL', 'LISTINGS_SERVICE_URL', 'RESERVATION_SERVICE_URL'
	],
	properties: {
		INTERNAL_KEY_SECRET: { type: 'string' }, // added by srandria
		PORT_AUTH_SERVICE: {
			type: 'number',
			default: 3001
		},
		JWT_REFRESH_SECRET: { type: 'string' },
		JWT_SECRET_PRIVATE_KEY: { type: 'string' },
		JWT_SECRET_PUBLIC_KEY: { type: 'string' },
		GOOGLE_CLIENT_ID: { type: 'string' },
		GOOGLE_CLIENT_SECRET: { type: 'string' },
		GMAIL_USER: { type: 'string' },
		GMAIL_APP_PASSWORD: { type: 'string' },
		COOKIE_SECRET: {
			type: 'string',
			default: 'COOKIE_SECRET_KEY'
		},
		FRONTEND_URL: {
			type: 'string',
			default: "http://localhost:8080"
		},
		REDIRECT_URI: { type: 'string' },
		AUTH_URL: { type: 'string' },
		TOKEN_URL: { type: 'string' },
		USER_INFO_URL: { type: 'string' },
		CREDITS_SERVICE_URL: { type: 'string', default:"http://credits-service:3004" },
		LISTINGS_SERVICE_URL: { type: 'string', default: "http://listings-service:3002" },
		RESERVATION_SERVICE_URL: { type: 'string' },
	}
};