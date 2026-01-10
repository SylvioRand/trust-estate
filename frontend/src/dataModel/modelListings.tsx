export type ListingsTags = "urgent" | "exclusive" | "discount";

export type ListingsData = {
	id: string,
	title: string,
	description: string,
	price: number,
	type: "sale" | "rent", // Enum: sale, rent
	propertyType: "apartment" | "house" | "loft" | "land" | "commercial", // Enum: apartment, house, loft, land, commercial
	mine: boolean,
	surface: number,
	zone: string,
	photos: string[],
	features: {
		bedrooms: number,
		bathrooms: number,
		wc_separate: boolean,
		parking_type: "garage" | "box" | "parking" | "none", // Enum: garage, box, parking, none
		garden_private: boolean,
		water_access: boolean,
		electricity_access: boolean
	},
	status: "active" | "blocked" | "archived", // Enum: active, blocked, archived
	isAvailable: boolean,
	sellerVisible: boolean,
	seller?: {
		id: string,
		name: string,
		phone: string,
		email: string,
		memberSince: string
	},
	sellerStats: {
		totalListings: number,
		activeListings: number,
		successfulSales: number,
		successfulRents: number,
		averageRating: number,
		responseRate: number
	},
	stats: {										// Visible uniquement si mine=true
		views: number,
		reservations: number,
		feedbacks: number
	},
	tags: ListingsTags[], // Enum: urgent, exclusive, discount
	createdAt: string,
	updatedAt?: string
}

export const	dataExampleListingsData: ListingsData = {
	id: "da9sd8d7as9d7b9a9hdw3l14",
	title: "Maison T2",
	description: "Beautiful House located at Analakely in the core center of Antananarivo.",
	price: 4300000,
	type: "rent",
	propertyType: "loft",
	mine: true,
	surface: 184,
	zone: "Antananarivo - Analakely",
	photos: [],
	features: {
		bedrooms: 3,
		bathrooms: 1,
		wc_separate: false,
		parking_type: "parking",
		garden_private: false,
		water_access: true,
		electricity_access: true
	},
	status: "active",
	isAvailable: false,
	sellerVisible: false,
	seller: {
		id: "",
		name: "Rakotoarivony Razanajohary Ny Hasina",
		phone: "+261341091496",
		email: "djazejhasi@gmail.com",
		memberSince: "2024-06-15T00:00:00Z",
	},
	sellerStats: {
		totalListings: 3,
		activeListings: 1,
		successfulSales: 2,
		successfulRents: 0,
		averageRating: 2.3,
		responseRate: 3.45
	},
	stats: {
		views: 234,
		reservations: 8,
		feedbacks: 2
	},
	tags: ["urgent", "discount", "exclusive"],
	createdAt: "2025-01-10T08:00:00Z",
	updatedAt: "2025-01-12T14:30:00Z"
}
