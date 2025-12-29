import React from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type Alignments = "flex-start" | "center" | "flex-end" | "baseline" | "stretch"

interface LineProps {
	thickness?: string;
	color?: string;
	orientation?: DividerOrientation;
}

const Line: React.FC<LineProps> = ({
	thickness = "2px",
	color = "color-mix(in srgb, var(--color-foreground) 40%, transparent)",
	orientation = "horizontal"
}) => {
	return (
		<div className="bg-foreground"
			style={
				{
					background: color,
					width: (orientation === "horizontal" ? "100%" : thickness),
					height: (orientation === "horizontal" ? thickness : "100%"),
				}
			}
		>
		</div>
	);
}

interface ContentDividerProps {
	title?: string;
	title_color?: string;
	line_thickness?: string;
	line_color?: string;
	orientation?: DividerOrientation;
}

interface VerticalTextProps {
	color?: string;
	font_family?: string;
	font_weight?: string;
	text: string;
	align_items?: Alignments;
	justify_content?: Alignments;
}

export const VerticalText: React.FC<VerticalTextProps> = ({
	color = "color-mix(in srgb, var(--color-foreground) 40%, transparent)",
	font_family = "Inter",
	font_weight = "300",
	text = "",
	align_items = "center",
	justify_content = "center"
}) => {
	return (
		<div className="flex flex-col"
			style={
				{
					alignItems: align_items,
					justifyContent: justify_content
				}
			}>
			{text.split("").map( (letter: string, index: number) => (
					<span className="font-extralight"
							key={ index }
						style={
							{
								color: color,
								fontFamily: font_family,
								fontWeight: font_weight
							}
						}>
						{letter === " " ? "\u00A0" : letter}
					</span>)
			)}
		</div>
	);
}

const ContentDivider: React.FC<ContentDividerProps> = ({
	title = "",
	title_color = "color-mix(in srgb, var(--color-foreground) 90%, transparent)",
	line_thickness = "1px",
	line_color = "color-mix(in srgb, var(--color-foreground) 24%, transparent)",
	orientation = "horizontal"

}) => {
	if (title === "")
	{
		return (
			<Line thickness={ line_thickness } color={ line_color } orientation={ orientation }/>
		);
	}
	else
	{
		const	gridStyling = (orientation === "horizontal")
			? "grid-cols-[1fr_auto_1fr] grid-rows-1 w-full"
			: "grid-cols-1 grid-rows-[1fr_auto_1fr] h-full";

		return (
			<div className={ `grid ${gridStyling} place-items-center` }>

				<Line thickness={ line_thickness } color={ line_color } orientation={ orientation }/>

				{
					orientation === "horizontal" ?
					<span className="font-extralight px-3 text-[13px]"
						style={
							{
								color: title_color
							}
						}>
						{ title }
					</span> :
					<VerticalText text={ title } color={ title_color }/>
				}

				<Line thickness={ line_thickness } color={ line_color } orientation={ orientation }/>

			</div>
		);
	}
}

export default ContentDivider;
