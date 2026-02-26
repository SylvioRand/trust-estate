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
};

export const SignUpUserSchema = {
	body: {
		type: 'object',
		required: ['email', 'firstName', 'lastName', 'phone', 'password'],
		properties: {
			email: { type: 'string', format: 'email'},
			firstName: {
				type: 'string',
				minLength: 3,
				maxLength: 255,
				pattern: "^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$",
			},
			lastName: {
				type: 'string',
				minLength: 3,
				maxLength: 255,
				pattern: "^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$",
			},
			phone: {
				type: 'string',
				minLength: 3,
				maxLength: 13,
				pattern: '^\\+261(32|33|34|38)\\d{7}$',
			},
			password: {
				type: 'string',
				minLength: 12,
				pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{12,}$',
			},
			avatarUrl: { type: 'string' }
		},
		additionalProperties: false
	}
};

export const VerificationTokenSchema = {
	body: {
		type: 'object',
		required: ['token'],
		properties: {
			token: {type: 'string'}
		},
		additionalProperties: false
	}
};

export const ResendEmailSchema = {
	body: {
		type: 'object',
		required: ['email', 'lastName'],
		properties: {
			email: { type: 'string', format: 'email' },
			lastName: {
				type: 'string',
				minLength: 3,
				pattern: "^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$"
			}
		},
		additionalProperties: false
	}
};

export const UpdatePhoneNumberSchema = {
	body: {
		type: 'object',
		required: ['phoneNumber'],
		properties: {
			phoneNumber: {
				type: 'string',
				minLength: 3,
				pattern: '^\\+261(32|33|34|38)\\d{7}$'
			}
		},
		additionalProperties: false
	}
};


export const ForgotPasswordSchema = {
	body: {
		type: 'object',
		required: ['email'],
		properties: {
			email: { type: 'string', format: 'email' }
		},
		additionalProperties: false
	}
};

export const ResetPasswordSchema = {
	body: {
		type: 'object',
		required: ['token', 'newPassword'],
		properties: {
			token: { type: 'string' },
			newPassword: {
				type: 'string',
				minLength: 12,
				pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{12,}$'
			}
		},
		additionalProperties: false
	}
};

const Role = ['USER', 'MODERATOR', 'ADMIN']

export const ChangeRoleSchema = {
	body: {
		type: 'object',
		required: ['id', 'role'],
		properties: {
			id: {
				type: 'string',
				format: 'uuid'
			},
			role: {
				type: 'string', enum: Role
			}
		},
		additionalProperties: false
	}
}