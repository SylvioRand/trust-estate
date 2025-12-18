export const envSchema = {
	type: 'object',
	required: ['PORT_AUTH_SERVICE', 'INTERNAL_SECRET'],
	properties: {
		PORT_AUTH_SERVICE: {
			type: 'number',
			default: 3001
		},
		INTERNAL_SECRET: {
			type: 'string',
			default: 'INTERNAL_SERVICE_SECRET'
		}
	}
};