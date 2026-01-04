import { useState } from "react";

export type IconPlacement = "left" | "right";

interface ToggleButtonProps {
	icon?: string;
	icon_toggled?: string;
	icon_size?: number;
	icon_place?: IconPlacement;
	title: string;
	accent_color?: string;
	toggled: boolean;
	translateX?: number;
	translateY?: number;
	onClick?: () => void;
}

const	ToggleButton: React.FC<ToggleButtonProps> = ({
	icon = "",
	icon_toggled = "",
	icon_size = 32,
	title = "Title",
	icon_place = "left",
	accent_color = "var(--color-accent)",
	toggled = false,
	translateX = 0,
	translateY = 0,
	onClick
}) => {
	const	[hovered, setHovered] = useState(false);

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
			cursor-pointer
			w-full"
			onPointerEnter = { () => setHovered(true) }
			onPointerLeave = { () => setHovered(false) }
			style={{
				backgroundColor: hovered ? `color-mix(in srgb, ${ accent_color } 75%, var(--color-background))` : toggled ? "transparent" : "var(--color-background)",
				flexDirection: icon_place === "left" ? "row" : "row-reverse",
				borderRadius: toggled ? "var(--radius-4xl)" : "var(--radius-lg)",
				filter: toggled ? `drop-shadow(0px 0px 3px ${ accent_color })` : "drop-shadow(0px 7px 7px rgba(0,0,0,0.25))",
				transform: toggled ? "scale(98%)" : "none"
			}}
			{...(onClick ? { onClick } : {})}
		>

			<div className="absolute
				w-[105%] h-[105%]
				transition-all duration-500
				ease-in-out"
				style={{
					backgroundColor: accent_color,
					opacity: toggled ? "100%" : "0%",
					transform: toggled ? "none" : "translateY(100px)"
				}}
			>
			</div>

			{ icon && <div className="flex items-center justify-center z-1
					w-3 h-3
					relative"
				>
					<div className="absolute font-icon
						transition-all duration-500"
						style={
							{
								transform: toggled ? "translateY(100%)" : `translateY(0%) translate(${translateX}, ${translateY}px)`,
								opacity: toggled ? "0%" : "100%",
								fontSize: icon_size,
							}
						}
					>
						{ icon }
					</div>

					<div className="absolute font-icon
						transition-all duration-500"
						style={
							{
								transform: !toggled ? "translateY(100%)" : `translateY(0%) translate(${translateX}, ${translateY}px)`,
								opacity: !toggled ? "0%" : "100%",
								fontSize: icon_size,
							}
						}
					>
						{ icon_toggled }
					</div>
				</div>
			}
			<div className="pt-[0.1rem] z-1">
				{ title }
			</div>
		</button>
	)
}

export default ToggleButton;
