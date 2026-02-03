import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import type { FastifyInstance } from 'fastify';

const ajv = new Ajv({
	allErrors: true,
	coerceTypes: true,
	useDefaults: true,
	removeAdditional: true
});

addFormats(ajv);
ajvErrors(ajv);

const validationErrorMessages: Record<string, Record<string, string>> = {
	email: {
		format: "validation.email.invalid_format",
		maxLength: "validation.email.too_long",
		minLength: "validation.email.too_short",
		required: "validation.email.required",
		type: "validation.email.invalid_type"
	},
	firstName: {
		minLength: "validation.firstname.too_short",
		maxLength: "validation.firstname.too_long",
		pattern: "validation.firstname.invalid_chars",
		required: "validation.firstname.required",
		type: "validation.firstname.invalid_type"
	},
	lastName: {
		minLength: "validation.lastname.too_short",
		maxLength: "validation.lastname.too_long",
		pattern: "validation.lastname.invalid_chars",
		required: "validation.lastname.required",
		type: "validation.lastname.invalid_type"
	},
	phone: {
		pattern: "validation.phone.invalid_format",
		minLength: "validation.phone.too_short",
		maxLength: "validation.phone.too_long",
		required: "validation.phone.required",
		type: "validation.phone.invalid_type"
	},
	password: {
		minLength: "validation.password.too_short",
		maxLength: "validation.password.too_long",
		pattern: "validation.password.weak",
		required: "validation.password.required",
		type: "validation.password.invalid_type"
	},
	avatarUrl: {
		format: "validation.avatar_url.invalid_format",
		type: "validation.avatar_url.invalid_type"
	}
};

function parsePasswordErrors(pattern: string, value: string): string[] {
	const errors: string[] = [];
	
	if (pattern.includes('(?=.*?[A-Z])') && !/[A-Z]/.test(value)) {
		errors.push('validation.password.missing_uppercase');
	}
	if (pattern.includes('(?=.*?[a-z])') && !/[a-z]/.test(value)) {
		errors.push('validation.password.missing_lowercase');
	}
	if (pattern.includes('(?=.*?[0-9])') && !/[0-9]/.test(value)) {
		errors.push('validation.password.missing_digit');
	}
	if (pattern.includes('(?=.*?[#?!@$%^&*-])') && !/[#?!@$%^&*-]/.test(value)) {
		errors.push('validation.password.missing_special_char');
	}
	
	return errors.length > 0 ? errors : ['validation.password.weak'];
}

export async function setErrorHandler(server: FastifyInstance) {
	server.setErrorHandler((error: any, request, reply) => {
		if (error.statusCode === 429) {
			return reply.status(429).send({
					error: 'rate_limited',
					message: 'common.rate_limited',
					retryAfter: error.retryAfter || 60
				});
		}
		if (error.validation) {
			const details: Record<string, string[]> = {};

			error.validation.forEach((err: any) => {
				const field = err.instancePath.replace(/^\//, '');
				const keyword = err.keyword;

				if (!field && keyword !== 'required') return;

				if (keyword === 'required') {
					const missingField = err.params.missingProperty;
					if (!details[missingField]) {
						details[missingField] = [];
					}
					const errorMessage = 
						validationErrorMessages[missingField]?.required || 
						`validation.${missingField}.required`;
					details[missingField].push(errorMessage);
					return;
				}

				if (!details[field]) {
					details[field] = [];
				}

				if (field === 'password' && keyword === 'pattern' && err.params.pattern) {
					const passwordValue = (request.body as any)?.[field] || '';
					const passwordErrors = parsePasswordErrors(err.params.pattern, passwordValue);
					details[field].push(...passwordErrors);
				}
				else {
					const errorMessage = 
						validationErrorMessages[field]?.[keyword] || 
						`validation.${field}.${keyword}`;
					if (!details[field].includes(errorMessage)) {
						details[field].push(errorMessage);
					}
				}
			});

			return reply.status(400).send({
				error: "validation_failed",
				message: "common.validation_failed",
				details
			});
		}

		reply.send(error);
	});

}