export const FeedbackSchema = {
	body: {
		type: 'object',
		required: ['reservationId', 'rating', 'comment', 'categories'],
		properties: {
			reservationId: {
				type: 'string',
				format: 'uuid'
			},
			rating: {
				type: 'number', minimum: 0, maximum: 5
			},
			comment: {
				type: 'string',
				minLength: 10,
				maxLength: 250
			},
			categories: {
				type: 'object'
			}
		},
		additionalProperties: false
	}
}