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
	amount: {
		format: "validation.payment.amount.invalid",
		minimum: "validation.payment.amount.min",
		pattern: "validation.payment.amount.invalid",
		required: "validation.payment.amount.required",
		type: "validation.payment.amount.invalid_type"
	},
	provider: {
		format: "validation.payment.provider.invalid",
		pattern: "validation.payment.provider.invalid",
		required: "validation.payment.provider.required",
		type: "validation.payment.provider.invalid_type",
		enum: "validation.payment.provider.invalid"
	},
};

function validateSlot(slotValue: string): string[] {
	const errors: string[] = [];
	const slotDate = new Date(slotValue);
	const now = new Date();
	const minAdvanceTime = new Date(now.getTime() + 60 * 60 * 1000);

	if (isNaN(slotDate.getTime())) {
		errors.push('validation.reservation.slot.invalid_format');
		return errors;
	}

	if (slotDate < minAdvanceTime) {
		errors.push('validation.reservation.slot.past_or_too_soon');
	}

	return errors;
}

export function setupErrorHandler(app: FastifyInstance) {
	app.setErrorHandler((err: any, request, reply) => {
		request.log.error(err);

		if (err.validation) {
			const details: Record<string, string[]> = {};

			err.validation.forEach((error: any) => {
				const field = error.instancePath.replace(/^\//, '');
				const keyword = error.keyword;

				if (!field && keyword !== 'required') return;

				if (keyword === 'required') {
					const missingField = error.params.missingProperty;
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

				if (field === 'slot' && (keyword === 'format' || keyword === 'type')) {
					const slotValue = (request.body as any)?.[field];
					if (slotValue) {
						const slotErrors = validateSlot(slotValue);
						details[field].push(...slotErrors);
					} else {
						const errorMessage = validationErrorMessages[field]?.[keyword] || `validation.${field}.${keyword}`;
						details[field].push(errorMessage);
					}
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

		reply.send(err);
	});

}

