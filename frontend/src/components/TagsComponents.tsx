import { useTranslation } from "react-i18next";
import type { ListingsTags } from "../dataModel/modelListings";

interface	TagsComponentsProps {
	tags: ListingsTags;
}

export const	TagsComponents: React.FC<TagsComponentsProps> = ({
	tags = "urgent"
}) => {
	const	icon: Record<ListingsTags, string> = {
		urgent: "󰈸",
		exclusive: "󱉏",
		discount: ""
	}

	const	color: Record<ListingsTags, string> = {
		urgent: "var(--color-red-600)",
		exclusive: "var(--color-amber-600)",
		discount: "var(--color-blue-600)"
	}

	const	{ t } = useTranslation("listings");

	return (
		<div className="flex items-center justify-center gap-2
			border border-background/25
			backdrop-blur-2xl
			select-none
			rounded-full
			shadow-standard
			text-light-foreground
			flex-none
			px-3"
			style={{
				backgroundColor: `color-mix(in srgb, ${color[tags]} 75%, transparent)`
			}}
		>
			<div className="font-light text-sm"
			>
				{ t(`section.tags.${tags}`) }
			</div>
			<div className="font-icon text-xl text-shadow-md">
				{ icon[tags] }
			</div>
		</div>
	);
}