export interface ReservationInterface {
	listingId: string
	slot: Date
	sellerId: string
}

export interface ReservationIdInterface {
	id: string
}

export interface StatusInterface {
	listingId: string
	userId: string
};

export interface CheckSlotInterface {
	listingId: string
	slot: Date
}