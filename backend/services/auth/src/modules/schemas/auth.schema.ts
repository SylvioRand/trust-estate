export const LoginUserSchema = {
	body: {
		type: 'object',
		required: ['email', 'password'],
		properties: {
			email: { type: 'string' },
			password: { type: 'string' }
		},
		additionalProperties: false
	}
}

export const SignUpUserSchema = {
	body: {
		type: 'object',
		required: ['email', 'firstName', 'lastName', 'phone', 'password'],
		properties: {
			email: { type: 'string', format: 'email' },
			firstName: {
				type: 'string',
				minLength: 3,
				pattern: '^[a-zA-Z0-9]+_?[a-zA-Z0-9]+$'
			},
			lastName: {
				type: 'string',
				minLength: 3,
				pattern: '^[a-zA-Z0-9]+_?[a-zA-Z0-9]+$'
			},
			phone: {
				type: 'string',
				minLength: 3,
				pattern: '^\\+261(32|33|34|38)\\d{7}$'
			},
			password: {
				type: 'string',
				minLength: 12,
				pattern: '(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}'
			},
			avatarUrl: { type: 'string' }
		},
		additionalProperties: false
	}
}