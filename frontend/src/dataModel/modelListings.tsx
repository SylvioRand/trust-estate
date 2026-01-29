export type ListingsTags = "urgent" | "exclusive" | "discount";

import house0 from "../images/house0.webp";
import house1 from "../images/house1.webp";
import house2 from "../images/house2.webp";
import house3 from "../images/house3.webp";
import house4 from "../images/house4.webp";

// const	house0: string = "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1465&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
// const	house1: string = "https://images.unsplash.com/photo-1627141234469-24711efb373c?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
// const	house2: string = "https://images.unsplash.com/photo-1543071293-d91175a68672?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
// const	house3: string = "https://images.unsplash.com/photo-1698994705178-d244d73ea573?q=80&w=802&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
// const	house4: string = "https://images.unsplash.com/photo-1691425700585-c108acad6467?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export type SellerStatsDataType = {
	successfulSales: number,
	successfulRent: number,
	averageRating: number,
}

export type	PropertyType = "apartment" | "house" | "loft" | "land" | "commercial";
export type	ParkingType = "garage" | "box" | "parking" | "none";

export type ListingsData = {
	id: string,
	title: string,
	description: string,
	price: number,
	type: "sale" | "rent", // Enum: sale, rent
	propertyType: PropertyType,
	mine: boolean,
	surface: number,
	zone: string,
	photos: string[],
	features: {
		bedrooms: number,
		bathrooms: number,
		wc_separate: boolean,
		wc: boolean,
		pool: boolean,
		parking_type: ParkingType, // Enum: garage, box, parking, none
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
	sellerStats: SellerStatsDataType,
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
	title: "Beautiful Villa",
	description: "Beautiful House located at Analakely in the core center of Antananarivo. And this is a lot of another blabla, and again and again. This is for testing the reaction of the layout with a lot of text, we expect at least 200 characters so ...",
	price: 4300000,
	type: "sale",
	propertyType: "apartment",
	mine: true,
	surface: 184,
	zone: "Ambalavao-Isotry",
	photos: [
		house0,
		house1,
		house2,
		house3,
		house4
	],
	features: {
		bedrooms: 3,
		bathrooms: 1,
		wc_separate: false,
		wc: true,
		pool: true,
		parking_type: "parking",
		garden_private: true,
		water_access: true,
		electricity_access: false
	},
	status: "active",
	isAvailable: true,
	sellerVisible: false,
	seller: {
		id: "",
		name: "Rakotoarivony Razanajohary Ny Hasina",
		phone: "+261341091496",
		email: "djazejhasi@gmail.com",
		memberSince: "2024-06-15T00:00:00Z",
	},
	sellerStats: {
		successfulSales: 2,
		successfulRent: 0,
		averageRating: 2.3
	},
	stats: {
		views: 234,
		reservations: 8,
		feedbacks: 2
	},
	tags: ["urgent", "discount", "exclusive"],
	createdAt: "2025-01-10T08:00:00Z",
	// updatedAt: "2025-01-12T14:30:00Z"
}
