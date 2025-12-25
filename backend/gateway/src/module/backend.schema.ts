export const envSchema = {
	type: 'object',
	required: ['PORT_BACKEND', 'API_AUTH_URL_SERVICE',
		'GATEWAY_SECRET_PRIVATE_KEY', 'GATEWAY_SECRET_PUBLIC_KEY',
		'INTERNAL_SECRET', 'JWT_SECRET_PUBLIC_KEY', 'COOKIE_SECRET'],
	properties: {
		PORT_BACKEND: {
			type: 'number',
			default: 3000
		},
		API_AUTH_URL_SERVICE: {
			type: 'string',
			default: 'http://127.0.0.1:3001'
		},
		INTERNAL_SECRET: {
			type: 'string',
			default: 'INTERNAL_SERVICE_SECRET'
		},
		GATEWAY_SECRET_PRIVATE_KEY: {type: 'string'},
		GATEWAY_SECRET_PUBLIC_KEY: {type: 'string'},
		JWT_SECRET_PUBLIC_KEY:{ type: 'string' },
		COOKIE_SECRET: {
			type: 'string',
			default: 'COOKIE_SECRET_KEY'
		}
	}
};