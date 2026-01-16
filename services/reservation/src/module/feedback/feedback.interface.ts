interface CategoriesInterface {
	listingAccurate: boolean,
	sellerReactive: boolean,
	visitUseful: boolean
}

export interface FeedbackInterface {
	reservationId: string
	rating: number
	comment: string
	categories: CategoriesInterface
}
