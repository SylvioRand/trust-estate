import type React from "react";
import type { PropertyDataType } from "../dataModel/modelPropertyList";
import ActionButton from "./ActionButton";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { ListingsTags } from "../dataModel/modelListings";
import { TagsComponents } from "./TagsComponents";

interface	BentoPropertyProps {
	propertyData: PropertyDataType;
}

const	BentoProperty: React.FC<BentoPropertyProps> = ({
	propertyData
}) => {
	const	formatter = new Intl.NumberFormat("de-DE");
	const	[loading, setLoading] = useState<boolean>(true);
	const	{ t } = useTranslation("common");

	return (
		<div
		className="flex items-center justify-center
		rounded-xl
		overflow-hidden
		drop-shadow-standard
		relative
		text-foreground
		w-full
		min-w-80
		h-120"
		style={{
			backgroundColor: loading ? "var(--color-midtone)" : "transparent"
		}}>

			<div
			className="absolute top-0 left-0
			transition-opacity duration-300
			w-full h-full"
			style={{
				opacity: loading ? "0%" : "100%"
			}}
			>
				<img
				className="w-full h-full object-cover"
				src={ propertyData.photos[0] }
				onLoad={ () => setLoading(false) }
				alt="House Pictures"
				/>
			</div>

			<div
			className="absolute top-0 left-0
			flex flex-wrap items-center justify-start gap-3
			p-2
			z-1
			w-full">
				{
					propertyData.tags && propertyData.tags.map((value: ListingsTags, index: number) => {
						return (
							<TagsComponents
							key={ index }
							tags={ value }
							/>
						);
					})
				}
			</div>

			{
				loading &&
				<div
				className="absolute top-0 left-0
				flex items-center justify-center
				z-1
				w-full h-full">
					<div
					className="font-icon text-[84px] animate-spin">
						󱥸
					</div>
				</div>
			}

			<div
			className="absolute top-0 left-0
			bg-[linear-gradient(to_top,var(--color-background)_25%,transparent)]
			transition-opacity duration-1000
			w-full h-full"
			style={{
				opacity: loading ? "0%" : "100%"
			}}
			>
			</div>

			<div
			className="absolute top-0 left-0
			flex flex-col items-center justify-end
			gap-3
			p-3
			z-4
			w-full h-full"
			>
				<div
				className="flex flex-col items-center justify-center
				w-full"
				>
					<div
					className="font-higuen font-bold text-xl mr-auto truncate max-w-[75%]">
						{ propertyData.title }
					</div>

					<div
					className="flex items-center justify-center gap-1 mr-auto"
					>
						<div className="font-icon"></div><div className="text-sm">{ `${t(`propertyType.${propertyData.propertyType}`)}, ${propertyData.zone}` }</div>
					</div>
				</div>

				<div
				className="flex items-center justify-center gap-1
				mr-auto"
				>
					<div
					className="font-bold text-lg mr-auto">
						{ `${formatter.format(propertyData.price)} Ar` }
					</div>
					{
						propertyData.type === "rent" &&
						<sub
						className="font-light">
							{ ` / ${t("month")}` }
						</sub>
					}
				</div>
				<Link
				className="w-full"
				to={ `/property/listings?id=${propertyData.id}` }
				>
					<ActionButton
					title={ t("viewDetails") }
					base_color="var(--color-foreground)"
					text_color="var(--color-background)"
					text_color_hover="var(--color-foreground)"
					/>
				</Link>
			</div>
		</div>
	)
}

export default BentoProperty;