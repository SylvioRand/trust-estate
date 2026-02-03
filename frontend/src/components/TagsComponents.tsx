import { useTranslation } from "react-i18next";
import type { ListingsTags } from "../dataModel/modelListings";

interface	TagsComponentsProps {
	tags: ListingsTags;
}

export const	TagsComponents: React.FC<TagsComponentsProps> = ({
	tags = "urgent"
}) => {
	const	icon: Record<ListingsTags, string> = {
		urgent: "",
		exclusive: "󱉏",
		discount: ""
	}

	const	color: Record<ListingsTags, string> = {
		urgent: "var(--color-red-600)",
		exclusive: "var(--color-amber-600)",
		discount: "var(--color-blue-600)"
	}

	const	{ t } = useTranslation("common");

	return (
		<div
		className="grid grid-cols-[auto_1fr] grid-rows-1 gap-1
		select-none
		bg-foreground text-background
		px-2 py-1
		rounded-full
		shadow-standard
		place-items-center"
		>
			<div
			className="flex items-center justify-center
			w-4 h-4"
			>
				<div
				className="font-icon text-xl"
				style={{
					color: color[tags]
				}}>
					{ icon[tags] }
				</div>
			</div>
			<div
			className="mr-[0.1rem] text-sm">
				{ t(`tags.${tags}`) }
			</div>
		</div>
	);
}