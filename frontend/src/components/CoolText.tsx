import React from "react";

interface CoolTextProps {
	text: string;
	color?: string;
	size?: number;
}

const CoolText: React.FC<CoolTextProps> = ({ text = "GlowingText", color = "bg-accent", size = 32}) => {
	return (
		<span className={ `${color} bg-clip-text text-transparent font-brigadier font-black` }
			style={ { fontSize: size } }>
			{ text }
		</span>
	);
};

export default CoolText;
