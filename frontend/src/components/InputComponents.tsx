import React, { useState } from 'react';

interface InputComponentsProps {
	label: string;
	placeholder: string;
	sensitive_info?: boolean;
	autocomplete: string;
}

const InputComponents: React.FC<InputComponentsProps> = ({
	label = "Label",
	placeholder = "Placeholder",
	sensitive_info = false,
	autocomplete = ""
}) => {
	const	eye_icon = ["", ""];
	const	[hidden, setHidden] = useState(true);
	const	[focused, setFocused] = useState(false);
	const	[hovered, setHovered] = useState(false);

	if (sensitive_info)
	{
		return (
			<div className="flex flex-col items-start justify-center w-full gap-1">
				<div className="font-normal">{ label }</div>
				<div className="grid grid-cols-[1fr_auto] w-full">
					<input className="border-b border-foreground/25
						transition-all duration-250
						w-full h-10
						font-extralight text-[13px]
						focus:outline-none focus:border-accent"
						type={ hidden ? "password" : "text" }
						placeholder={ placeholder }
						autoComplete={ autocomplete }
						style={
							{
								borderColor: focused || hovered ? "var(--color-accent)" : "color-mix(in srgb, var(--color-foreground) 25%, transparent)"
							}
						}
						onMouseEnter={ () => setHovered(true) }
						onMouseLeave={ () => setHovered(false) }
						onFocus={ () => setFocused(true) }
						onBlur={ () => setFocused(false) }/>
					<button className="relative flex items-center justify-center
						border-b w-10 h-full
						transition-all duration-250"
						style={
							{
								borderColor: focused || hovered ? "var(--color-accent)" : "color-mix(in srgb, var(--color-foreground) 25%, transparent)"
							}
						}
						onClick={ () => setHidden(hidden ? false : true) }>
						<span className="absolute font-icon text-[42px] opacity-50">
							{ hidden ? eye_icon[0] : eye_icon[1] }
						</span>
					</button>
				</div>
			</div>
		);
	}
	else
	{
		return (
			<div className="flex flex-col items-start justify-center w-full gap-1">
				<div className="font-normal">{ label }</div>
				<input className="border-b border-foreground/25
					transition-all duration-200
					hover:border-accent
					w-full h-10
					font-extralight text-[13px]
					focus:outline-none focus:border-accent"
					autoComplete={ autocomplete }
					placeholder={ placeholder }
				/>
			</div>
		);
	}
}

export default InputComponents;
