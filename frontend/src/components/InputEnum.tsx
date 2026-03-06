import React, { useState, type ChangeEvent } from "react";

export type InputEnumData = {
	value: string;
	title: string;
}

interface InputEnumProps {
	title: string;
	name: string;
	defaultValue?: string;
	// startValue?: string;
	dataEnum: InputEnumData[];
	onChange?: (value: string) => void;
}

const InputEnum: React.FC<InputEnumProps> = ({
	title = "Title",
	name = "InputEnumName",
	defaultValue = "none",
	// startValue = "",
	dataEnum = [],
	onChange
}) => {
	return (
		<div className="flex flex-col items-center justify-center
			gap-1
			w-full"
		>
			<div className="flex items-center justify-start
				w-full"
			>
				<div className="font-bold text-[14px]">
					{title}
				</div>
			</div>
			<select
				className="w-full
				border border-background/25
				p-2
				cursor-pointer
				rounded-md
				shadow-standard
				"
				name={name}
				defaultValue={defaultValue}
				onChange={(e: ChangeEvent<HTMLSelectElement>) => {
					if (onChange) onChange(e.currentTarget.value);
				}}
			>
				{
					dataEnum.length > 0 && dataEnum.map((value: InputEnumData, index: number) => {
						return (
							<option
								key={index}
								value={value.value}
							>
								{value.title}
							</option>
						);
					})
				}
			</select>
		</div>
	);
}

export default InputEnum;
