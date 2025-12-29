import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export type ChartDirection = "ascendant" | "descendant";

interface LineChartProps {
	data?: number[],
	color?: string,
	direction?: ChartDirection
}

const LineChart: React.FC<LineChartProps> = (
	{ data = [], color = "var(--color-accent)", direction = "ascendant" }) =>
{
	const	{ t } = useTranslation("translationData");
	const	ref = useRef<HTMLDivElement>(null);
	const	[size, setSize] = useState({ width: 0, height: 0 });
	const	maxVal: number = Math.max(...data);
	const	points: string = data.map( (value: number, i: number) => {
		const x = (i / (data.length - 1)) * size.width;
		const y = (direction === "ascendant"
			? (size.height - (value / maxVal) * size.height)
			: ((value / maxVal) * size.height));
		return (`${x},${y}`);
	}).join(" ");

	if (!data || data.length === 0)
		return (<div>{ t('noDataAvailable') }</div>);

	useEffect(() => {
		if (!ref.current)
			return ;
		
		const updateSize = () => {
			setSize({
				width: ref.current!.offsetWidth,
				height: ref.current!.offsetHeight
			});
		};

		const observer = new ResizeObserver(updateSize);
		observer.observe(ref.current);

		updateSize();

		return (() => observer.disconnect());
	}, [])

	return (
		<div className="flex justify-center w-full h-full m-6"
			ref={ref}>
			<svg width={ "100%" } height={ "100%" }
				className="w-full h-full overflow-visible">
				<polyline fill="none"
					width={ "100%" } height={ "100%" }
					stroke={ color } strokeLinejoin="round" strokeWidth="2.75"
					points={points}/>

				{data.map( (value: number, i: number) => {
					const x: number = (i / (data.length - 1)) * size.width;
					const y: number = (direction === "ascendant"
						? (size.height - (value / maxVal) * size.height)
						: ((value / maxVal) * size.height));
					return (<circle key={i} cx={x} cy={y} r="5" fill={ color }/>);
				})}

			</svg>
		</div>
	)
}

export default LineChart;
