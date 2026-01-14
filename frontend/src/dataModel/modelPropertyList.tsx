import house0 from "../../src/images/house0.webp";
import house1 from "../../src/images/house1.webp";
import house2 from "../../src/images/house2.webp";
import house3 from "../../src/images/house3.webp";

export type ListingType = "sale" | "rent"

export interface ListingsProps {
	data: [
		{
			id: number,
			title: string,
			price: number,
			type: ListingType,
			zone: string,
			zoneDisplay: string,
			surface: number,
			photos: string[],
			status: boolean,
			createdAt: string,
			expiresAt: string
		}
	],
	pagination: {
		page: number,
		limit: number,
		total: number,
		totalPages: number
	}
}

export const	listData: ListingsProps[] = [
		{
			data: [
				{
					id: 0,
					title: "Maison T3",
					price: 50000000,
					type: "rent",
					zone: "tana-analakely",
					zoneDisplay: "Antananarivo - Analakely",
					surface: 120,
					photos: [
						house0
					],
					status: true,
					createdAt: "2025-01-10T08:00:00Z",
					expiresAt: "2025-02-09T08:00:00Z"
				}
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 45,
				totalPages: 3
			}
		},
		{
			data: [
				{
					id: 0,
					title: "Villa T4",
					price: 150000000,
					type: "sale",
					zone: "tana-analakely",
					zoneDisplay: "Antananarivo - Analakely",
					surface: 120,
					photos: [
						house1
					],
					status: true,
					createdAt: "2025-01-10T08:00:00Z",
					expiresAt: "2025-02-09T08:00:00Z"
				}
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 45,
				totalPages: 3
			}
		},
		{
			data: [
				{
					id: 0,
					title: "Appartment T4",
					price: 150000000,
					type: "rent",
					zone: "tana-analakely",
					zoneDisplay: "Antananarivo - Ambatobe",
					surface: 120,
					photos: [
						house2
					],
					status: true,
					createdAt: "2025-01-10T08:00:00Z",
					expiresAt: "2025-02-09T08:00:00Z"
				}
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 45,
				totalPages: 3
			}
		},
		{
			data: [
				{
					id: 0,
					title: "Villa T4",
					price: 100000000,
					type: "sale",
					zone: "tana-ivato",
					zoneDisplay: "Antananarivo - Ivato",
					surface: 120,
					photos: [
						house3
					],
					status: true,
					createdAt: "2025-01-10T08:00:00Z",
					expiresAt: "2025-02-09T08:00:00Z"
				}
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 45,
				totalPages: 3
			}
		},
		{
			data: [
				{
					id: 0,
					title: "Maison T3",
					price: 50000000,
					type: "rent",
					zone: "tana-analakely",
					zoneDisplay: "Antananarivo - Analakely",
					surface: 120,
					photos: [
						house0
					],
					status: true,
					createdAt: "2025-01-10T08:00:00Z",
					expiresAt: "2025-02-09T08:00:00Z"
				}
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 45,
				totalPages: 3
			}
		},
		{
			data: [
				{
					id: 0,
					title: "Villa T4",
					price: 150000000,
					type: "sale",
					zone: "tana-analakely",
					zoneDisplay: "Antananarivo - Analakely",
					surface: 120,
					photos: [
						house1
					],
					status: true,
					createdAt: "2025-01-10T08:00:00Z",
					expiresAt: "2025-02-09T08:00:00Z"
				}
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 45,
				totalPages: 3
			}
		},
		{
			data: [
				{
					id: 0,
					title: "Appartment T4",
					price: 150000000,
					type: "rent",
					zone: "tana-analakely",
					zoneDisplay: "Antananarivo - Ambatobe",
					surface: 120,
					photos: [
						house2
					],
					status: true,
					createdAt: "2025-01-10T08:00:00Z",
					expiresAt: "2025-02-09T08:00:00Z"
				}
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 45,
				totalPages: 3
			}
		},
		{
			data: [
				{
					id: 0,
					title: "Villa T4",
					price: 100000000,
					type: "sale",
					zone: "tana-ivato",
					zoneDisplay: "Antananarivo - Ivato",
					surface: 120,
					photos: [
						house3
					],
					status: true,
					createdAt: "2025-01-10T08:00:00Z",
					expiresAt: "2025-02-09T08:00:00Z"
				}
			],
			pagination: {
				page: 1,
				limit: 20,
				total: 45,
				totalPages: 3
			}
		}
	]

