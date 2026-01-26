export const ReservationSchema = {
	body:{
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
	params : {
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
	querystring : {
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
	querystring : {
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
		required: ['id', 'slot'],
		properties: {
			id: {
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