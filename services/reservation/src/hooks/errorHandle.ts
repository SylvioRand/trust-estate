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
	listingId: {
		format: "validation.uuid.invalid",
		pattern: "validation.uuid.invalid",
		required: "validation.listing_id.required",
		type: "validation.listing_id.invalid_type"
	},
	sellerId: {
		format: "validation.uuid.invalid",
		pattern: "validation.uuid.invalid",
		required: "validation.seller_id.required",
		type: "validation.seller_id.invalid_type"
	},
	buyerId: {
		format: "validation.uuid.invalid",
		pattern: "validation.uuid.invalid",
		required: "validation.buyer_id.required",
		type: "validation.buyer_id.invalid_type"
	},
	slot: {
		format: "validation.reservation.slot.invalid_format",
		type: "validation.reservation.slot.invalid_type",
		required: "validation.reservation.slot.required"
	}
};

function validateSlot(slotValue: string): string[] {
	const errors: string[] = [];
	const slotDate = new Date(slotValue);
	const now = new Date();
	const minAdvanceTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 heure à l'avance minimum

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

