import { useState } from "react";

export type IconPlacement = "left" | "right";

interface ActionButtonProps {
	icon?: string;
	icon_size?: number;
	icon_place?: IconPlacement;
	title: string;
	type?: "button" | "submit" | "reset" | undefined;
	processing_action?: boolean;
}

const	ActionButton: React.FC<ActionButtonProps> = ({
	icon = "",
	icon_size = 32,
	title = "Title",
	icon_place = "left",
	type = "button",
	processing_action = false
}) => {
	const	[hovered, setHovered] = useState(false);
	const	animation: string = processing_action ? "var(--animate-spin)" : (hovered ? "var(--animate-jiggle)" : "none");

	return (
		<button className="flex items-center justify-center gap-3
			min-h-5
			max-h-10
			cursor-pointer
			bg-background
			text-foreground
			p-3
			drop-shadow-md
			transition-discrete duration-200
			w-full"
			type = { type }
			onPointerEnter = { () => setHovered(true) }
			onPointerLeave = { () => setHovered(false) }
			style={{
				flexDirection: icon_place === "left" ? "row" : "row-reverse",
				borderRadius: hovered ? "var(--radius-4xl)" : "var(--radius-lg)",
			}}
		>
			{ icon && <div className="flex items-center justify-center">
					<div className="font-icon"
						style={
							{
								fontSize: icon_size,
								animation: animation
							}
						}
					>
						{ processing_action ? "󱥸" : icon }
					</div>
				</div>
			}
			<div className="pt-[0.1rem]">
				{ title }
			</div>
		</button>
	)
}

export default ActionButton;
