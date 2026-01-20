export const envSchema = {
	type: 'object',
	required: [
		'PORT_CREDITS_SERVICE',
		'AUTH_SERVICE_URL',
		'JWT_SECRET_PUBLIC_KEY',
		'GMAIL_USER', 'GMAIL_APP_PASSWORD',
		'COOKIE_SECRET', 'FRONTEND_URL',
		'INTERNAL_KEY_SECRET'
	],
	properties: {
		INTERNAL_KEY_SECRET: { type: 'string' },
		PORT_CREDITS_SERVICE: {
			type: 'number',
			default: 3004
		},
		AUTH_SERVICE_URL: { type: 'string' },
		JWT_SECRET_PUBLIC_KEY: { type: 'string' },
		GMAIL_USER: { type: 'string' },
		GMAIL_APP_PASSWORD: { type: 'string' },
		COOKIE_SECRET: {
			type: 'string',
			default: 'COOKIE_SECRET_KEY'
		},
		FRONTEND_URL: {
			type: 'string',
			default: "http://localhost:8080"
		}
	}
};