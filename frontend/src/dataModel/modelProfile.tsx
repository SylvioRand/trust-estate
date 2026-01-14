export type ProfileDataType = {
	id: string,
	email: string,
	emailVerified: boolean,
	phone: string,
	firstName: string,
	lastName: string,
	role: "user" | "moderator", // Enum: user, moderator
	sellerStats: {
		totalListings: number,
		activeListings: number,
		successfulSales: number,
		successfulRents: number,
		averageRating: number,
		responseRate: number
	},
	creditBalance: number,
	createdAt: string
}

export const	dataProfileExample: ProfileDataType = {
	id: "u1",
	email: "djazejhasi@gmail.com",
	emailVerified: true,
	phone: "+261341091496",
	firstName: "Rakotoarivony",
	lastName: "Razanajohary Ny Hasina",
	role: "user", // Enum: "user", "moderator"
	sellerStats: {
	  totalListings: 5,
	  activeListings: 2,
	  successfulSales: 3,
	  successfulRents: 1,
	  averageRating: 4.2,
	  responseRate: 92
	},
	creditBalance: 10,
	createdAt: "2025-01-10T08:00:00Z"
}
