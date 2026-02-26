export const UpdatePasswordSchema = {
	body: {
		type: 'object',
		required: ['password', 'newPassword'],
		properties: {
			password: {
				type: 'string',
				minLength: 12,
				pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{12,}$'
			},
			newPassword: {
				type: 'string',
				minLength: 12,
				pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{12,}$'
			},
		},
		additionalProperties: false
	}
}

export const addPasswordSchema = {
	body: {
		type: 'object',
		required: ['password'],
		properties: {
			password: {
				type: 'string',
				minLength: 12,
				pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{12,}$'
			}
		},
		additionalProperties: false
	}
}

export const UpdateInfoUserSchema = {
	body: {
		type: 'object',
		required: ['firstName', 'phone'],
		properties: {
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
				pattern: '^\\+261(32|33|34|38)\\d{7}$'
			}
		},
		additionalProperties: false
	}
};

export const UserDetailsSchema = {
	params: {
		type: 'object',
		required: ['id'],
		properties: {
			id: {
				type: 'string',
				format: 'uuid'
			}
		},
		additionalProperties: false
	}
};

export const DeleteAccompte = {
	body: {
		type: 'object',
		required: ['password'],
		properties: {
			password: {
				type: 'string',
				minLength: 12,
				pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{12,}$'
			}
		},
		additionalProperties: false
	}
};