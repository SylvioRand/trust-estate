import React from "react";
import { useTranslation } from "react-i18next";

const	SlotsPage: React.FC = () => {
	const	{ t } = useTranslation("slots");

	const	day: string[] = ["1", "2", "3", "4", "5", "6", "7"];
	const	time: string[] = [
		"9AM - 10AM",
		"10AM - 11AM",
		"11AM - 12PM",
		"12PM - 1PM",
		"1PM - 2PM",
		"2PM - 3PM",
		"3PM - 4PM"
	];

	return (
		<div className="flex flex-col items-center justify-center
			px-4 md:px-7 xl:px-64
			gap-4
			w-full h-screen"
		>
			<div className="grid grid-cols-8 grid-rows-1
				border border-background/25
				py-4
				shadow-standard
				rounded-md
				place-items-center
				w-full"
			>
				<div className="w-full h-full">
				</div>
				{
					day.map((value: string, index: number) => {
						return (
							<div
								key={ index }
								className="
								text-sm"
							>
								{ t(`day.${value}`) }
							</div>
						);
					})
				}
			</div>

			<div className="grid grid-cols-7 grid-rows-1
				w-full h-100">
				<div className="grid grid-cols-1 grid-rows-7
					border border-background/25
					rounded-md
					shadow-standard
					place-items-center
					w-full h-full"
				>
					{
						time.map((value: string, index: number) => {
							return (
								<div
									key={ index }
									className="font-light text-sm"
								>
									{ value }
								</div>
							);
						})
					}
				</div>
			</div>
		</div>
	);
}

export default SlotsPage;
