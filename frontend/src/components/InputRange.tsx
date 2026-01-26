import React, { useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

interface ButtonRangeProps {
	title: string;
	name: string;
	value: string;
	min?: number;
	max?: number;
	onChange: (arg: ChangeEvent<HTMLInputElement>) => void;
	isValid: boolean;
	tooltip?: string;
}

const ButtonRange: React.FC<ButtonRangeProps> = ({
	title,
	name,
	value,
	min,
	max,
	onChange,
	isValid,
	tooltip
}) => {
	const { t } = useTranslation("common");

	return (
		<div className="flex flex-col items-center justify-center gap-1
		w-full"
		>
			<div className="flex items-center justify-start w-full">
				<div className="font-light text-sm">{title}</div>
			</div>
			<input
				name={name}
				type="text"
				placeholder={t("noLimit")}
				inputMode="numeric"
				value={value}
				className={`transition-colors duration-300 border px-2 py-1 rounded-md w-full focus:outline-none caret-accent ${
					isValid ? "border-background/25" : "border-red-500"
				}`}
				onChange={onChange}
				{...(min !== undefined ? { min } : {})}
				{...(max !== undefined ? { max } : {})}
				title={tooltip} // browser tooltip
			/>
		</div>
	);
};

interface InputRangeProps {
	title: string;
	minTitle: string;
	maxTitle: string;
	minName: string;
	maxName: string;
}

const InputRange: React.FC<InputRangeProps> = ({
	title,
	minTitle,
	maxTitle,
	minName,
	maxName
}) => {
	const	{ t } = useTranslation("common");
	const	[minValue, setMinValue] = useState<string>("");
	const	[maxValue, setMaxValue] = useState<string>("");
	const	minNumber = /^\d+$/.test(minValue) ? Number(minValue) : undefined;
	const	maxNumber = /^\d+$/.test(maxValue) ? Number(maxValue) : undefined;
	const	isMinValid =
		/^\d*$/.test(minValue) &&
		(minNumber === undefined || maxNumber === undefined || minNumber <= maxNumber);
	const isMaxValid =
		/^\d*$/.test(maxValue) &&
		(maxNumber === undefined || minNumber === undefined || maxNumber >= minNumber);

	return (
		<div className="flex flex-col items-center justify-center gap-1 w-full">
			<div className="flex items-center justify-start w-full">
				<div className="font-bold text-[14px]">{title}</div>
			</div>
			<div className="grid grid-cols-2 grid-rows-1 gap-3 w-full">
				<ButtonRange
					title={minTitle}
					name={minName}
					value={minValue}
					max={maxNumber}
					onChange={(e) => setMinValue(e.currentTarget.value)}
					isValid={isMinValid}
					tooltip={
						minValue === "" ? undefined :
						!(/^\d+$/.test(minValue)) ? t("digitOnly") :
						maxNumber !== undefined && minNumber! > maxNumber
							? t("minBiggerMax")
							: undefined
					}
				/>
				<ButtonRange
					title={maxTitle}
					name={maxName}
					value={maxValue}
					min={minNumber}
					onChange={(e) => setMaxValue(e.currentTarget.value)}
					isValid={isMaxValid}
					tooltip={
						maxValue === "" ? undefined :
						!(/^\d+$/.test(maxValue)) ? t("digitOnly") :
						minNumber !== undefined && maxNumber! < minNumber
							? t("maxSmallerMin")
							: undefined
					}
				/>
			</div>
		</div>
	);
};

export default InputRange;
