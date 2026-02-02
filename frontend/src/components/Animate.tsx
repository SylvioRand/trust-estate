import { type CSSProperties, type ReactNode } from "react"

interface	AnimateProps {
	delay: string;
	direction?: "top" | "bottom";
	children: ReactNode;
	customStyle?: CSSProperties;
}

const	Animate: React.FC<AnimateProps> = ({
	delay = "300ms",
	direction = "bottom",
	customStyle = {},
	children
}) => {
	return (
		<div
		className="opacity-0"
		style={{
			animation: `var(--animate-fade-in)`,
			animationDelay: delay,
			...customStyle
		}}
		>
			<div
			style={{
				animation: direction === "top" ? "var(--animate-from-top)" : "var(--animate-from-bottom)",
				animationDelay: delay
			}}
			>
				{ children }
			</div>
		</div>
	)
}

export default Animate;