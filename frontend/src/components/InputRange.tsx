import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface	ButtonRangeProps {
	title: string;
	name: string;
	minValue: string;
	maxValue: string;
}

const	ButtonRange: React.FC<ButtonRangeProps> = ({
	title = "Title",
	name = "ButtonRangeName",
	minValue = "0",
	maxValue = "1"
}) => {
	const	[isValid, setIsValid] = useState<boolean>(true);
	const	{ t } = useTranslation("common");

	return (
		<div
		className="flex flex-col items-center justify-center gap-1
		w-full"
		>
			<div
			className="flex items-center justify-start
			w-full"
			>
				<div
				className="font-light text-sm"
				>
					{ title }
				</div>
			</div>
			<input
			name={ name }
			type="text"
			placeholder={ t("noLimit") }
			inputMode="numeric"
			min={ minValue }
			max={ maxValue }
			className="border border-background/25
			focus:outline-none
			w-full
			px-2 py-1
			caret-accent
			rounded-md"
			onChange={(e) => {
				const value = e.currentTarget.value;
				setIsValid(value === "" || /^\d+$/.test(value));
			}}
			style={{
				borderColor: isValid ? "color-mix(in srgb, var(--color-background) 25%, transparent)" : "var(--color-red-500)"
			}}
			>
			</input>
		</div>
	);
}

interface	InputRangeProps {
	title: string;
	minTitle: string;
	maxTitle: string;
	minName: string;
	maxName: string;
}

const	InputRange: React.FC<InputRangeProps> = ({
	title = "Title",
	minTitle = "InputRangeMinName",
	maxTitle = "InputRangeMaxName",
	minName = "InputRangeMinName",
	maxName = "InputRangeMaxName"
}) => {
	return (
		<div
		className="flex flex-col items-center justify-center
		gap-1
		w-full"
		>
			<div className="flex items-center justify-start
				w-full"
			>
				<div className="font-bold text-[14px]">
					{ title }
				</div>
			</div>
			
			<div
			className="grid grid-cols-2 grid-rows-1 gap-3
			w-full"
			>
				<ButtonRange
					title={ minTitle }
					name={ minName }
					minValue={ "0" }
					maxValue={ "1" }
				/>
				<ButtonRange
					title={ maxTitle }
					name={ maxName }
					minValue={ "0" }
					maxValue={ "1" }
				/>
			</div>
		</div>
	);
}

export default InputRange;