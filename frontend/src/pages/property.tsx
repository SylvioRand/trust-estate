import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import house0 from "../../src/images/house0.webp";
import house1 from "../../src/images/house1.webp";
import house2 from "../../src/images/house2.webp";
import house3 from "../../src/images/house3.webp";

type ListingType = "sale" | "rent"

interface ListingsProps {
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

interface PublicationCardProps {
	propertyData: ListingsProps;
}

const	PublicationCard: React.FC<PublicationCardProps> = ({
	propertyData
}) => {
	const	[hovered, setHovered] = useState<boolean>(false);

	return (
		<div className="flex items-center justify-center
			flex-none
			rounded-xl
			shadow-xl
			relative
			w-full h-full
			min-h-90 max-h-90
			border border-background/25
			cursor-pointer
			overflow-hidden"
			onPointerOver={ () => setHovered(true) }
			onPointerLeave={ () => setHovered(false) }
		>
			<img
				className="absolute w-full h-full object-cover
					ease-in-out
					transition-transform duration-500"
				style={{
					transform: hovered ? "scale(110%)" : "none"
				}}
				src={ propertyData.data[0].photos[0] }
				alt="House Picture"
			/>
			<div className="absolute top-0 left-0
				mask-[linear-gradient(to_top,white_20%,transparent_50%)]
				bg-light-background/50
				backdrop-blur-xl
				w-full h-full"
			>
			</div>

			<div className="flex flex-col items-start justify-end
				text-light-foreground
				p-4
				w-full h-full
				z-1"
			>
				<div className="flex items-center justify-center gap-1
					font-inter
					text-sm
					opacity-80"
				>
					<div className="font-icon"></div>{ propertyData.data[0].zoneDisplay }
				</div>
				<div className="font-inter font-bold text-xl">
					{ propertyData.data[0].title }
				</div>
				<div className="font-inter font-light">
					{ propertyData.data[0].price } AR
				</div>
			</div>
		</div>
	);
}

interface FilterButtonProps {
	active: boolean;
	onClick: () => void;
}

const	FilterButton: React.FC<FilterButtonProps> = ({
	active = true,
	onClick = () => console.error("FilterButton onClick props not overrided!")
}) => {
	const	[hovered, setHovered] = useState<boolean>(false);
	const	{ t } = useTranslation("property");

	return (
		<div className="fixed bottom-4 right-4 xl:bottom-7 xl:right-7
			flex items-center justify-center gap-2
			shadow-xl
			select-none
			cursor-pointer
			border border-background/25
			px-3
			z-2
			rounded-full"
			onPointerEnter={ () => setHovered(true) }
			onPointerLeave={ () => setHovered(false) }
			onClick={ onClick }
			style={{
				backgroundColor: active ? "var(--color-background)" : hovered ? "color-mix(in srgb, var(--color-background) 25%, var(--color-foreground))" : "var(--color-foreground)",
				color: active ? "var(--color-foreground)" : "var(--color-background)"
			}}
		>
			<div className="font-icon text-2xl">
				󰈲
			</div>
			<div className="text-md">
				{ t("button.filter.title") }
			</div>
		</div>
	);
}

interface FilterSelectOptions {
	value: string;
	title: string
}

interface FilterSelectProps {
	title: string;
	name: string;
	data: FilterSelectOptions[];
}

const	FilterSelect: React.FC<FilterSelectProps> = ({
	title = "Title",
	name = "Name",
	data = []
}) => {
	const	{ t } = useTranslation("property");

	return (
		<div className="grid grid-cols-[1fr_60%] grid-rows-1 gap-4
			w-full"
		>
			<div className="mt-1.5 truncate w-full">
				{ title }
			</div>

			<select
				className="border border-background/25 rounded-md
					cursor-pointer
					shadow-xl
					p-2"
				name={ name }
			>
				{
					data.length > 0 && data.map((value: FilterSelectOptions, index: number) => {
						return (
							<option value={ value.value }>{ value.title }</option>
						);
					})
						
				}
			</select>
		</div>
	);
}

interface FilterMenuProps {
	open: boolean;
	onClose: () => void;
}

const	FilterMenu: React.FC<FilterMenuProps> = ({
	open = true,
	onClose = () => console.error("FilterMenu onClose not overidded!")
}) => {
	const	{ t } = useTranslation("property");

	return (
		<div className="fixed bottom-0 left-0
			grid grid-cols-1 grid-rows-[1fr_auto]
			z-2
			pointer-events-none
			w-full h-screen"
		>
			<div className="w-full h-full"
				onClick={ onClose }
				style={{
					pointerEvents: open ? "auto" : "none"
				}}
			>
			</div>
			<div className="transition-transform duration-200
				pointer-events-auto
				grid grid-cols-1 grid-rows-[auto_1fr]
				place-items-center
				bg-foreground
				border-t border-background/25
				shadow-[0px_0px_10px_rgba(0,0,0,0.25)]
				z-3
				w-full h-95
				md:h-75"
				style={{
					transform: open ? "translateY(0px)" : "translateY(100%)"
				}}
			>
				<div className="font-icon text-4xl text-background
					cursor-pointer
					select-none
					ml-auto mr-3"
					onClick={ onClose }
				>
					
				</div>

				<div className="flex flex-col items-center justify-center gap-3
					md:grid md:grid-cols-2 md:grid-rows-3 md:gap-12
					max-w-225
					p-4
					w-full h-full"
				>
					<FilterSelect
						title={ t("button.filter.contract.title") }
						name="contract_type"
						data={[
							{ value: "none", title: t("button.filter.contract.none") },
							{ value: "sale", title: t("button.filter.contract.sale") },
							{ value: "rent", title: t("button.filter.contract.rent") }
						]}
					/>

					<FilterSelect
						title={ t("button.filter.area.title") }
						name="area"
						data={[
							{ value: "none", title: t("button.filter.area.none") },
							{ value: "Analakely", title: "Analakely" },
							{ value: "Ivandry", title: "Ivandry" },
							{ value: "Ankorondrano", title: "Ankorondrano" },
							{ value: "Ankadimbahoaka", title: "Ankadimbahoaka" },
							{ value: "Ambatobe", title: "Ambatobe" },
							{ value: "Andraharo", title: "Andraharo" },
							{ value: "Ampefiloha", title: "Ampefiloha" },
							{ value: "Antanimena", title: "Antanimena" }
						]}
					/>

					<FilterSelect
						title={ t("button.filter.propertyType.title") }
						name="property_type"
						data={[
							{ value: "none", title: t("button.filter.propertyType.none") },
							{ value: "appartment", title: t("button.filter.propertyType.appartment") },
							{ value: "house", title: t("button.filter.propertyType.house") },
							{ value: "loft", title: t("button.filter.propertyType.loft") },
							{ value: "land", title: t("button.filter.propertyType.land") },
							{ value: "commercial", title: t("button.filter.propertyType.commercial") },
						]}
					/>

					<FilterSelect
						title={ t("button.filter.room.title") }
						name="price"
						data={[
							{ value: "none", title: t("button.filter.room.none") },
							{ value: "1_plus", title: "1" },
							{ value: "2_plus", title: "2" },
							{ value: "3_plus", title: "3" },
							{ value: "4_plus", title: "4" }
						]}
					/>

					<FilterSelect
						title={ t("button.filter.tag.title") }
						name="tag"
						data={[
							{ value: "none", title: t("button.filter.tag.none") },
							{ value: "urgent", title: t("button.filter.tag.urgent") },
							{ value: "exclusive", title: t("button.filter.tag.exclusive") },
							{ value: "discount", title: t("button.filter.tag.discount") }
						]}
					/>


				</div>
			</div>
		</div>
	);
}

const	PropertyPage: React.FC = () => {
	const	{ t } = useTranslation("proprerty");
	const	[filterActive, setFilterActive] = useState<boolean>(false);
	const	[filterOpened, setFilterOpened] = useState<boolean>(false);

	const	listData: ListingsProps[] = [
		{
			data: [
				{
					id: 0,
					title: "Maison T3",
					price: 50000000,
					type: "sale",
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
					type: "sale",
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

	]

	return (
		<div className="flex flex-col items-center justify-start gap-4
			overflow-y-scroll
			p-4
			xl:px-64
			transition-discrete duration-200
			w-full h-screen"
		>
			<div className="w-full h-12 flex-none"
			>
			</div>

			<div className="flex flex-col items-center justify-start gap-4
				md:grid md:grid-cols-2 md:grid-rows-2
				xl:grid xl:grid-cols-3 xl:grid-rows-2
				place-items-center
				w-full"
			>
				{
					listData.map((value: ListingsProps, index: number) => {
						return (
							<PublicationCard
								key={ index }
								propertyData={ value }
							/>
						);
					})
				}

				{
					listData.map((value: ListingsProps, index: number) => {
						return (
							<PublicationCard
								key={ index }
								propertyData={ value }
							/>
						);
					})
				}

				{
					listData.map((value: ListingsProps, index: number) => {
						return (
							<PublicationCard
								key={ index }
								propertyData={ value }
							/>
						);
					})
				}
			</div>

			<FilterButton
				active={ filterActive }
				onClick={
					() => {
						setFilterOpened(true);
					}
				}
			/>

			<FilterMenu
				open={ filterOpened }
				onClose={
					() => {
						setFilterOpened(false);
					}
				}
			/>

		</div>
	);
}

export default PropertyPage;
