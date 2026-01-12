import React from "react";
import { useTranslation } from "react-i18next";

const	SlotsPage: React.FC = () => {
	const	{ t } = useTranslation("slots");

	const	day = ["1", "2", "3", "4", "5", "6", "7"];

	return (
		<div className="flex flex-col items-center justify-center
			px-4 md:px-7 xl:px-64
			w-full h-screen"
		>
			<div className="grid grid-cols-7 grid-rows-1
				place-items-center
				w-full"
			>
				{
					day.map((value: string, index: number) => {
						return (
							<div
								key={ index }
								className="text-sm"
							>
								{ t(`day.${value}`) }
							</div>
						);
					})
				}
			</div>
		</div>
	);
}

export default SlotsPage;
