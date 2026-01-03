import React, { useState } from "react";
import house0 from "../../src/images/house0.webp";
import house1 from "../../src/images/house1.webp";
import house2 from "../../src/images/house2.webp";
import house3 from "../../src/images/house3.webp";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

interface ListingsData
{
  id: string;
  title: string;
  description: string;
  price: number;
  type: "sale" | "rent";
  surface: number;
  zone: string;
  zoneDisplay: string;
  photos: string[];
  features: {
    bedrooms: number;
    bathrooms: number;
    wc_separate: boolean;
    parking_type: string;
    garden_private: boolean;
    water_access: boolean;
    electricity_access: boolean
  };
  status: boolean;
  sellerVisible: boolean;
  sellerStats: {
    totalListings: number;
    successfulSales: number;
    averageRating: number
  };
  createdAt: string;
  updatedAt: string
  expiresAt: string;
}



interface PicturesCarrouselProps {
	pictures: string[];
}

const	PicturesCarrousel: React.FC<PicturesCarrouselProps> = ({
	pictures = [],
}) => {
	const	[displayID, setDisplayID] = useState<number>(1);

	return (
		<div className="relative
			flex items-center justify-center
			max-w-300
			w-full h-120"
		>
			{ pictures.map((value: string, index: number) => {
				return (
					<img
						key={ index }
						className="absolute
							w-[80%] aspect-square object-cover
							max-w-100
							rounded-2xl
							flex-none
							shadow-xl
							transition-transform duration-500 ease-in-out"
						src={ value }
						alt="House Picture"
						onClick={ () => setDisplayID(index) }
						style={{
							zIndex: (index === displayID) ? 10 : 0,
							transform: `translateX(${ ((Math.abs(index - displayID) === 1 ? 106 : 104) * (index - displayID)) }%)
										${ index === displayID ? "scale(110%)" : "scale(100%)" }`
						}}
					/>
				);
			})}

		</div>
	);
}

const	ListingsPage: React.FC = () => {
	const	{ t } = useTranslation("listings");

	const	[searchParams] = useSearchParams();
	const	listingsID = searchParams.get("id"); // retrieve the value of the listings here

	const	pictures: string[] = [
		house2,
		house0,
		house2,
		house0,
		house2,
		house0,
		house2,
		house0,
		house1
	]

	// const	FetchListingsAndDisplay = async () => {
		// const	response = await fetch(`/api/listings/${ listingsID }`, {
		// 	method: "GET"
		// });
	// }
	
	const	dataExample: ListingsData = {
		id: "l1",
		title: "Maison T3 Analakely",
		description: "Maison lumineuse avec jardin...",
		price: 50000000,
		type: "sale",
		surface: 120,
		zone: "tana-analakely",
		zoneDisplay: "Antananarivo - Analakely",
		photos: [
		  "https://mock-cdn.com/photo1.jpg",
		  "https://mock-cdn.com/photo2.jpg"
		],
		features: {
		  bedrooms: 3,
		  bathrooms: 2,
		  wc_separate: true,
		  parking_type: "garage",
		  garden_private: true,
		  water_access: true,
		  electricity_access: true
		},
		status: true,
		sellerVisible: false,
		sellerStats: {
		  totalListings: 5,
		  successfulSales: 3,
		  averageRating: 4.2
		},
		createdAt: "2025-01-10T08:00:00Z",
		updatedAt: "2025-01-12T14:30:00Z",
		expiresAt: "2025-02-09T08:00:00Z"
	};

	return (
		<div className="flex flex-col items-center justify-start gap-4
			overflow-y-scroll
			overflow-x-hidden
			relative
			pointer-events-auto
			p-4
			w-full h-screen"
		>
			<div className="w-full h-5 md:h-20
				flex-none"
			>
			</div>


			<PicturesCarrousel
				pictures={ pictures }
			/>

			<div className="flex flex-col items-start justify-center
				xl:px-64
				w-full"
			>
				<div className="flex flex-col items-start justify-end
					text-light-foreground
					p-4
					gap-3
					w-full h-full
					z-1"
				>
					<div className="font-inter font-bold text-2xl">
						{ dataExample.title }
					</div>
					<div className="flex items-center justify-center gap-1
						font-inter
						text-md
						opacity-80"
					>
						<div className="font-icon"></div>{ dataExample.zoneDisplay }
					</div>
					<div className="font-inter font-bold text-2xl">
						{ dataExample.price } AR
					</div>
				</div>
			</div>

		</div>
	);
}

export default ListingsPage;
