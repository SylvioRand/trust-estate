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

export interface ListingDataInterface {
	id: string
	title: string
	price: number
	mainImage: string
}

export interface UserDetailsInterface {
	id: string
	firstName: string
	lastName: string
	email: string
	phone: string
}

export interface ReservationDetailsInterface {
	reservationId: string
	slot: Date
	status: string
	createdAt: Date
	listing: ListingDataInterface
	buyer: UserDetailsInterface
}