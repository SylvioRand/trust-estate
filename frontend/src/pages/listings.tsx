import React, { useState } from "react";
import house0 from "../../src/images/house0.webp";
import house1 from "../../src/images/house1.webp";
import house2 from "../../src/images/house2.webp";
import house3 from "../../src/images/house3.webp";
import { useTranslation, type UseTranslationResponse } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { TFunction } from "i18next";
import ActionButton from "../components/ActionButton";
import ToggleButton from "../components/ToggleButton";
import PhotoViewer from "../components/PhotoViewer";

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

interface	PicturesLayoutProps {
	data: string[];
	translationSingleton: TFunction<"listings">;
}

const	PicturesLayout: React.FC<PicturesLayoutProps> = ({
	data = [],
	translationSingleton
}) => {
	const	[openPhotoViewer, setOpenPhotoViewer] = useState<boolean>(false);
	const	[photoToOpen, setPhotoToOpen] = useState<number>(0);

	function Img({
		src,
		see_more = false,
		onClick = () => console.error("PicturesLayout: onClick not overrided.")
	} : {
		src: string;
		see_more?: boolean,
		onClick: () => void
	}) {
		const	[hovered, setHovered] = useState<boolean>(false);

		return (
			<div className="w-full h-full
				select-none
				cursor-pointer
				relative"
				onClick={ onClick }
			>
				<img
					className="w-full h-full object-cover
					shadow-xl
					select-none
					cursor-pointer
					transition-transform duration-500"
					src={src}
					alt="House Picture"
					onPointerEnter={ () => setHovered(true) }
					onPointerLeave={ () => setHovered(false) }
					style={{
						transform: hovered ? "scale(110%)" : "none"
					}}
				/>

				<div className="absolute top-0 left-0
					flex items-center justify-center
					pointer-events-none
					w-full h-full
					transition-colors duration-500"
					style={{
						backgroundColor: hovered ? "rgba(0,0,0,0.75)" : "transparent"
					}}
				>
					<div className="font-icon text-light-foreground text-4xl
						transition-opacity duration-500"
						style={{
							opacity: hovered ? "100%" : "0%"
						}}
					>
						
					</div>
				</div>

				{
					see_more &&
					<div className="absolute top-0 left-0
						flex items-center justify-center
						bg-light-background/75
						w-full h-full"
					>
						<div className="font-light text-center text-lg text-light-foreground">
							{ translationSingleton("section.pictures.buttons.seeMore") }
						</div>
					</div>
				}
			</div>
		);
    }

	return (
		<div className="grid grid-cols-1 grid-rows-1 place-items-center
			gap-3
			md:grid-cols-[50%_1fr_1fr] md:grid-rows-2
			overflow-hidden
			flex-none
			w-full h-56 md:h-71 xl:h-120 aspect-video rounded-2xl">
			<div className="w-full h-full
				md:row-start-1 md:row-end-3
				overflow-hidden
				bg-red-500">
				<Img
					src={ data[0] }
					onClick={ () => {
						setPhotoToOpen(0);
						setOpenPhotoViewer(true);
					}}
				/>
			</div>

			<div className="hidden md:block
				w-full h-full
				overflow-hidden
				bg-blue-500">
				<Img
					src={ data[1] }
					onClick={ () => {
						setPhotoToOpen(1);
						setOpenPhotoViewer(true);
					}}
				/>
			</div>

			<div className="hidden md:block
				w-full h-full
				overflow-hidden
				bg-green-500">
				<Img
					src={ data[2] }
					onClick={ () => {
						setPhotoToOpen(2);
						setOpenPhotoViewer(true);
					}}
				/>
			</div>

			{
				data.length > 3 && 
				<div className="hidden md:block
					w-full h-full
					overflow-hidden
					bg-green-500">
					<Img
						src={ data[3] }
						onClick={ () => {
							setPhotoToOpen(3);
							setOpenPhotoViewer(true);
						}}
					/>
				</div>
			}

			{
				data.length > 4 &&
				<div className="hidden md:block
					w-full h-full
					overflow-hidden
					bg-green-500">
					<Img
						src={ data[4] }
						see_more={ data.length > 5 }
						onClick={ () => {
							setPhotoToOpen(4);
							setOpenPhotoViewer(true);
						}}
					/>
				</div>
			}

			{ openPhotoViewer &&
				<PhotoViewer
					picture={ data }
					startID={ photoToOpen }
					onClose={ () => {
						setPhotoToOpen(0);
						setOpenPhotoViewer(false);
					}}
				/>
			}

		</div>
	);
}

interface	FeaturesCardProps {
	icon: string;
	value: string;
	title: string;
}

const	FeaturesCard: React.FC<FeaturesCardProps> = ({
	icon = "X",
	value = "0",
	title = "Title"
}) => {
	return (
		<div className="flex flex-col items-center justify-center
			shadow-standard
			rounded-2xl
			border border-background/25
			w-35 h-35"
		>
			<div className="font-icon text-[42px] text-accent
				select-none
				drop-shadow-md">
				{ icon }
			</div>
			<div className="font-bold text-lg">
				{ value }
			</div>
			<div className="font-light text-md mb-2">
				{ title }
			</div>
		</div>
	);
}

const	ListingsPage: React.FC = () => {
	const	{ t } = useTranslation("listings");
	const	formatter = new Intl.NumberFormat("de-DE");

	const	[searchParams] = useSearchParams();
	const	listingsID = searchParams.get("id"); // retrieve the value of the listings here

	const	pictures: string[] = [
		house2,
		house0,
		house1,
		house2,
		house1,
		house0
	]

	// const	FetchListingsAndDisplay = async () => {
		// const	response = await fetch(`/api/listings/${ listingsID }`, {
		// 	method: "GET"
		// });
	// }
	
	const	dataExample: ListingsData = {
		id: "l1",
		title: "Maison T3 Analakely",
		description: "Maison lumineuse avec jardin. Situer dans les plus beaux quartier d'Antananarivo. Vous ne pourrez pas trouver mieux en terme de rapport qualite prix!",
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

	const	iconFeatures: Record<string, string> = {
		bedrooms: "󰋣",
		bathrooms: "󱠘",
		wc_separate: "󰦫",
		parking_type: "󰄋",
		garden_private: "󰉊",
		water_access: "󰖌",
		electricity_access: ""
	}

	// need to fetch first to see if it's favorite or not, or maybe just send it through query
	const	[isFavorite, setIsFavorite] = useState<boolean>(false);

	return (
		<div className="flex flex-col items-center justify-start gap-7
			overflow-y-scroll
			overflow-x-hidden
			relative
			pointer-events-auto
			px-4 md:px-7 xl:px-64
			transition-discrete duration-500
			w-full h-screen"
		>
			<div className="w-full h-15 md:h-20
				flex-none"
			>
			</div>

			<PicturesLayout
				data={ pictures }
				translationSingleton={ t }
			/>

			<div className="grid grid-cols-1 grid-rows-2 gap-4
				md:grid-cols-[1fr_auto] md:grid-rows-1
				w-full"
			>
				<div className="flex flex-col items-start justify-end
					gap-3
					w-full h-full"
				>
					<div className="flex flex-col items-start justify-center w-full">
						<div className="flex items-center justify-center gap-2">
							<div className="font-inter font-bold text-2xl">
								{ dataExample.title }
							</div>
							<div className="rounded-full
								shadow-standard
								px-3 py-1
								select-none
								text-sm
								border border-background/25"
							>
								{ dataExample.type === "sale" ? t("section.listingType.sale") : t("section.listingType.rent") }
							</div>
						</div>

						<div className="flex items-center justify-center gap-1
							font-inter
							text-md
							opacity-80"
						>
							<div className="font-icon"></div>{ dataExample.zoneDisplay }
						</div>
					</div>

					<div className="font-inter font-bold text-3xl">
						{ formatter.format(dataExample.price) } Ariary
					</div>
				</div>

				<div className="grid grid-cols-1 grid-rows-2
					w-full"
				>
					<ToggleButton
						title={ t("section.quickButtons.favorites") }
						icon=""
						icon_toggled="󰋑"
						accent_color="var(--color-red-500)"
						toggled={ isFavorite }
						translateY={1}
						onClick={ () => setIsFavorite(isFavorite ? false : true) }
					/>

					<ActionButton
						title={ t("section.quickButtons.visit") }
						icon="󰃭"
					/>
				</div>

			</div>

			<div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4
				w-full
				place-items-center"
			>
				{
					Object.entries(dataExample.features).map(([key, value]) => {
						const	data: string = value.toString();

						return (
							<FeaturesCard
								key={ key }
								title={ t(`section.features.${key}`) }
								icon={ iconFeatures[key] }
								value={ (data === "true" || data === "false") ? (data === "true" ? t("yes") : t("no")) : data }
							/>
						);
					})
				}
			</div>

			<div className="grid grid-cols-1 grid-rows-[auto_1fr] gap-4
				place-items-start
				shadow-standard
				border border-background/25
				w-full
				p-4
				rounded-2xl"
			>
				<div className="font-bold">
					{ t("section.description.title") }
				</div>
				<div className="font-light">
					{ dataExample.description }
				</div>
			</div>

			<div className="w-full h-15
				flex-none"
			>
			</div>

		</div>
	);
}

export default ListingsPage;
