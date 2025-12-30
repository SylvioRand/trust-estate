import { useState } from "react";

export type IconPlacement = "left" | "right";

interface ActionButtonProps {
	icon?: string;
	icon_size?: number;
	icon_place?: IconPlacement;
	title: string;
	type?: "button" | "submit" | "reset" | undefined;
	disabled?: boolean;
	processing_action?: boolean;
	onClick?: () => void;
}

const	ActionButton: React.FC<ActionButtonProps> = ({
	icon = "",
	icon_size = 32,
	title = "Title",
	icon_place = "left",
	type = "button",
	disabled = false,
	processing_action = false,
	onClick
}) => {
	const	[hovered, setHovered] = useState(false);
	const	animation: string = processing_action ? "var(--animate-spin)" : (hovered ? "var(--animate-jiggle)" : "none");

	return (
		<button className="flex items-center justify-center gap-3
			relative
			min-h-5
			max-h-10
			text-foreground
			p-3
			bg-background
			transition-all duration-500
			ease-in-out
			overflow-hidden
			w-full"
			type = { type }
			onPointerEnter = { () => setHovered(true) }
			onPointerLeave = { () => setHovered(false) }
			style={{
				pointerEvents: disabled ? "none" : "auto",
				backgroundColor: disabled ? "color-mix(in srgb, var(--color-background) 25%, var(--color-foreground))" : "var(--color-background)",
				cursor: disabled ? "not-allowed" : "pointer",
				flexDirection: icon_place === "left" ? "row" : "row-reverse",
				borderRadius: hovered ? "var(--radius-4xl)" : "var(--radius-lg)",
				filter: hovered ? "drop-shadow(0px 0px 3px var(--color-accent))" : "none",
				transform: hovered ? "scale(98%)" : "none"
			}}
			{...(onClick ? { onClick } : {})}
		>

			<div className="absolute
				w-[105%] h-[105%]
				transition-all duration-500
				ease-in-out
				bg-accent"
				style={{
					opacity: hovered ? "100%" : "0%",
					transform: hovered ? "none" : "translateY(100px)"
				}}
			>
			</div>

			{ icon && <div className="flex items-center justify-center z-1">
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
			<div className="pt-[0.1rem] z-1">
				{ title }
			</div>
		</button>
	)
}

export default ActionButton;
