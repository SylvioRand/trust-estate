import house0 from "../../src/images/house0.webp";
import house1 from "../../src/images/house1.webp";
import house2 from "../../src/images/house2.webp";
import house3 from "../../src/images/house3.webp";
import type { ListingsTags, PropertyType } from "./modelListings";

export type ListingType = "sale" | "rent"

export type PropertyDataType = {
	id: number,
	title: string,
	price: number,
	type: ListingType,
	propertyType: PropertyType,
	mine: boolean,
	zone: string,
	surface: number,
	photos: string[],
	status: boolean,
	isAvailable: boolean,
	tags: ListingsTags[],
	createdAt: string,
}

export interface ListingsProps {
	data: PropertyDataType[],
	pagination: {
		page: number,
		limit: number,
		total: number,
		totalPages: number
	}
}

export const	listData: ListingsProps = {
	data: [
		{
			id: 0,
			title: "Maison T3",
			price: 50000000,
			type: "rent",
			propertyType: "apartment",
			zone: "Ambalavao-Isotry",
			surface: 120,
			mine: true,
			photos: [
				house0
			],
			status: true,
			isAvailable: true,
			tags: ["urgent"],
			createdAt: "2025-01-10T08:00:00Z",
		}
	],
	pagination: {
		page: 1,
		limit: 20,
		total: 45,
		totalPages: 3
	}
}