export const envSchema = {
	type: 'object',
	required: ['PORT_USER_SERVICE', 'INTERNAL_SECRET'],
	properties: {
		PORT_USER_SERVICE: {
			type: 'number',
			default: 3002
		},
		INTERNAL_SECRET: {
			type: 'string',
			default: 'INTERNAL_SERVICE_SECRET'
		}
	}
};