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

interface DayListingInterface {
	dayOfWeek: number,
	startTime: number|string,
	endTime: number|string
}

export interface ListingInterface {
	weeklySchedule: DayListingInterface[]
}