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
	}
}