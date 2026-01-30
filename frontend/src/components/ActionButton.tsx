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
	base_color?: string;
	accent_color?: string;
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
	base_color = "var(--color-background)",
	accent_color = "var(--color-accent)",
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
			transition-all duration-500
			ease-in-out
			overflow-hidden
			w-full"
			type = { type }
			onPointerEnter = { () => setHovered(true) }
			onPointerLeave = { () => setHovered(false) }
			style={{
				pointerEvents: disabled ? "none" : "auto",
				backgroundColor: disabled ? "color-mix(in srgb, var(--color-background) 25%, var(--color-foreground))" : hovered || processing_action ? "transparent" : base_color,
				cursor: disabled ? "not-allowed" : "pointer",
				flexDirection: icon_place === "left" ? "row" : "row-reverse",
				borderRadius: hovered || processing_action ? "var(--radius-4xl)" : "var(--radius-lg)",
				filter: hovered || processing_action ? `drop-shadow(0px 0px 3px ${ accent_color })` : "drop-shadow(0px 7px 7px rgba(0,0,0,0.25))",
				transform: hovered || processing_action ? "scale(98%)" : "none"
			}}
			onClick={ () => {
				if (!processing_action && onClick)
					onClick();
			}}
		>

			<div className="absolute
				w-[105%] h-[105%]
				transition-all duration-500
				ease-in-out"
				style={{
					backgroundColor: accent_color,
					opacity: hovered || processing_action ? "100%" : "0%",
					transform: hovered || processing_action ? "none" : "translateY(100px)"
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
			{
				icon && 
				<div className="pt-[0.1rem] z-1">
					{ title }
				</div>
			}
			{
				!icon && 
				<div className="pt-[0.1rem] z-1"
				style={{
					fontFamily: processing_action ? "var(--font-icon)" : "inherit",
					fontSize: processing_action ? icon_size : "16px",
					animation: processing_action ? "var(--animate-spin)" : "none"
				}}
				>
					{ processing_action ? "󱥸" : title }
				</div>
			}
		</button>
	)
}

export default ActionButton;
