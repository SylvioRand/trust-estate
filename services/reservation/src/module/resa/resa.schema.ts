export const ReservationSchema = {
	body: {
		type: 'object',
		required: ['slot', 'listingId', 'sellerId'],
		properties: {
			slot: {
				type: "string",
				format: "date-time"
			},
			listingId: {
				type: 'string',
				format: 'uuid'
			},
			sellerId: {
				type: 'string',
				format: 'uuid'
			}
		},
		additionalProperties: false
	}
};

export const ReservationIdSchema = {
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

export const StatusListingSchema = {
	querystring: {
		type: 'object',
		required: ['listingId', 'userId'],
		properties: {
			listingId: {
				type: 'string',
				format: 'uuid'
			},
			userId: {
				type: 'string',
				format: 'uuid'
			}
		},
		additionalProperties: false
	}
};

export const CheckSlotSchema = {
	querystring: {
		type: 'object',
		required: ['listingId', 'slot'],
		properties: {
			listingId: {
				type: 'string',
				format: 'uuid'
			},
			slot: {
				type: "string",
				format: "date-time"
			}
		},
		additionalProperties: false
	}
}

export const GetReservationSchema = {
	querystring: {
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
}

export const FilterReservationsSchema = {
	querystring: {
		type: 'object',
		properties: {
			status: {
				type: ['string', 'array'],
				items: {
					type: 'string',
					enum: ['pending', 'confirmed', 'cancelled', 'rejected', 'done']
				}
			},
			page: { type: 'integer', minimum: 1, default: 1 },
			limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
		},
		additionalProperties: false
	}
}