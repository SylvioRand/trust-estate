export const envSchema = {
	type: 'object',
	required: ['PORT_BACKEND', 'API_AUTH_URL_SERVICE', 'INTERNAL_SECRET'],
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
		}
	}
};