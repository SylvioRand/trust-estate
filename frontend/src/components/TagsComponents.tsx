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
		<div className="grid grid-cols-[auto_1fr] grid-rows-1
			place-items-center
			gap-2
			border border-background/25
			backdrop-blur-2xl
			select-none
			rounded-xl
			shadow-standard
			text-light-foreground
			flex-none
			bg-foreground
			p-1"
		>
			<div
			className="flex items-center justify-center
			rounded-lg
			w-6 h-6"
			style={{
				backgroundColor: color[tags],
				boxShadow: "inset 2px 4px 4px color-mix(in srgb, white 25%, transparent), inset -2px -4px 4px color-mix(in srgb, white 25%, transparent)"
			}}
			>
				<div className="font-icon text-lg text-shadow-md">
					{ icon[tags] }
				</div>
			</div>
			<div className="font-light text-sm text-background mr-1"
			>
				{ t(`section.tags.${tags}`) }
			</div>
		</div>
	);
}