import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { listData, type ListingsProps } from "../dataModel/modelPropertyList";
import ActionButton from "../components/ActionButton";
import { TagsComponents } from "./listings";
import type { ListingsTags } from "../dataModel/modelListings";
import InputEnum, { type InputEnumData } from "../components/InputEnum";
import type { TFunction } from "i18next";
import { ZONE_ENUM } from "../dataModel/dataZone";

interface PublicationCardProps {
	propertyData: ListingsProps;
}

export const	PublicationCard: React.FC<PublicationCardProps> = ({
	propertyData
}) => {
	const	[hovered, setHovered] = useState<boolean>(false);
	const	navigate = useNavigate();
	const	formatter = new Intl.NumberFormat("de-DE");
	const	{ t } = useTranslation("listings");

	return (
		<div className="grid grid-cols-1 grid-rows-[auto_1fr]
			flex-none
			rounded-xl
			shadow-standard
			relative
			w-full h-full
			min-h-90 max-h-90
			border border-background/25
			overflow-hidden"
			onPointerOver={ () => setHovered(true) }
			onPointerLeave={ () => setHovered(false) }
		>
			<div className="w-full h-50
				flex items-center justify-center
				relative
				overflow-hidden
				bg-red-500"
			>
				<img
					className="w-full h-full object-cover
					ease-in-out
					transition-transform duration-500"
					src={ propertyData.data[0].photos[0] }
					alt="House Picture"
					style={{
						transform: hovered ? "scale(105%)" : "none"
					}}
				/>
				<div className="absolute top-0 left-0
					grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] grid-rows-1
					p-2
					gap-2
					w-full"
				>
					{
						propertyData.data[0].tags.map((value: ListingsTags, index: number) => {
							return (
								<TagsComponents
									key={ index }
									tags={ value }
								/>
							);
						})
					}
				</div>
			</div>

			<div className="grid grid-cols-1 grid-rows-1 w-full h-full
				border-t border-background/25
				p-3"
			>
				<div className="grid grid-cols-[1fr_auto] grid-rows-1
					place-items-center">
					<div className="flex items-center justify-start gap-1
						font-inter font-light
						w-full"
					>
					<div className="font-icon"></div>{ propertyData.data[0].zoneDisplay }</div>
					<div className="border border-background/25
						px-3 py-1
						shadow-standard
						rounded-full"
					>
						{ t(`section.listingType.${propertyData.data[0].type}`) }
					</div>
				</div>

				<div className="flex flex-col items-start justify-center
					flex-none
					w-full"
				>
					<div className="font-bold text-lg">
						{ propertyData.data[0].title }
					</div>

					<div className="flex items-center justify-center gap-2">
						<div className="font-icon text-xl">
							󰳂
						</div>
						<div className="font-light text-md">
							{ propertyData.data[0].surface } m<sup>2</sup>
						</div>
					</div>

				</div>

				<div className="grid grid-cols-[1fr_auto] grid-rows-1
					place-items-center
					w-full"
				>
					<div className="font-light text-lg
						justify-self-start"
					>
						{ formatter.format(propertyData.data[0].price) } AR
					</div>
					<div>
						<ActionButton
							icon=""
							icon_place="right"
							title={ t("viewDetails") }
							onClick={ () => navigate(`/property/listings?id=${ propertyData.data[0].id }`) }
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

interface	FilterProps {
	t: TFunction<"property">;
}

const	Filter: React.FC<FilterProps> = ({
	t
}) => {
	const	[isOpen, setIsOpen] = useState<boolean>(false);
	const	[hovered, setHovered] = useState<boolean>(false);

	return (
		<div className="sticky top-14
			border border-background/25
			bg-linear-to-b from-foreground via-foreground/75 to-transparent
			flex flex-col items-center justify-start gap-3
			backdrop-blur-lg
			rounded-xl
			shadow-standard
			p-2
			z-2
			flex-none
			overflow-hidden
			transition-discrete duration-500
			w-full"
			style={{
				height: isOpen ? "355px" : "55px"
			}}
		>
			<button
				className="border border-background/25
				shadow-standard
				px-2 py-1
				w-full
				grid grid-cols-[1fr_auto] grid-rows-1
				transition-colors duration-200
				cursor-pointer
				rounded-md"
				onClick={ () => setIsOpen(isOpen ? false : true) }
				onPointerEnter={ () => setHovered(true) }
				onPointerLeave={ () => setHovered(false) }
				style={{
					backgroundColor: hovered ? "color-mix(in srgb, var(--color-accent) 25%, transparent)" : "transparent"
				}}
			>
				<div
					className="justify-self-start"
				>
					{ t("buttons.filter.title") }
				</div>
				<div
					className="font-icon
					transition-transform duration-300"
					style={{
						transform: isOpen ? "rotateZ(-180deg)" : "none"
					}}
				>
					
				</div>
			</button>

			<InputEnum
				title={ t("buttons.filter.contract.title") }
				name="filterContract"
				dataEnum={[
					{ value: "sale", title: t("buttons.filter.contract.sale") },
					{ value: "rent", title: t("buttons.filter.contract.rent") }
				]}
			/>
			<InputEnum
				title={ t("buttons.filter.propertyType.title") }
				name="filterpropertyType"
				dataEnum={[
					{ value: "none", title: t("buttons.filter.propertyType.none") },
					{ value: "apartment", title: t("buttons.filter.propertyType.apartment") },
					{ value: "house", title: t("buttons.filter.propertyType.house") },
					{ value: "loft", title: t("buttons.filter.propertyType.loft") },
					{ value: "land", title: t("buttons.filter.propertyType.land") },
					{ value: "commercial", title: t("buttons.filter.propertyType.commercial") }
				]}
			/>
			<InputEnum
				title={ t("buttons.filter.tag.title") }
				name="filtertag"
				dataEnum={[
					{ value: "none", title: t("buttons.filter.tag.none") },
					{ value: "urgent", title: t("buttons.filter.tag.urgent") },
					{ value: "exclusive", title: t("buttons.filter.tag.exclusive") },
					{ value: "discount", title: t("buttons.filter.tag.discount") }
				]}
			/>
			<InputEnum
				title={ t("buttons.filter.location.title") }
				name="filtertag"
				dataEnum={[
					{ value: "none", title: t("buttons.filter.location.none") },
					...ZONE_ENUM
				]}
			/>
		</div>
	);
}

const	PropertyPage: React.FC = () => {
	const	{ t } = useTranslation("property");

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

			<Filter
				t={ t }
			/>

			<div className="flex flex-col items-center justify-start gap-4
				md:grid md:grid-cols-2 md:grid-rows-2
				xl:grid xl:grid-cols-3 xl:grid-rows-2
				place-items-center
				w-full"
			>
				{
					listData.map((value: ListingsProps, index: number) => {
						return (
							<div
								className="animate-from-bottom
								w-full"
								key={ index }
								style={{
									animationDuration: "500ms",
									animationDelay: `${200 * index}ms`
								}}

							>
								<div
									className="animate-fade-in
									opacity-0
									w-full"
									style={{
										animationDuration: "400ms",
										animationDelay: `${200 * index}ms`
									}}
								>
									<PublicationCard
										propertyData={ value }
									/>
								</div>
							</div>
						);
					})
				}
			</div>
		</div>
	);
}

export default PropertyPage;
