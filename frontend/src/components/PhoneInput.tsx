import { useState, type HTMLInputTypeAttribute, type RefObject } from "react";
import { ErrorInput } from "./Input";
import InputEnum from "./InputEnum";
import { PhoneCountries, type PhoneCountriesType } from "../utils/phoneCountry";

interface PhoneInputProps {
	title: string;
	placeholder: string;
	name: string;
	nameCountryCode: string;
	error: string[];
	pattern?: string;
	minLength?: number;
	maxLength?: number;
	ref?: RefObject<HTMLInputElement | null>;
}

const	PhoneInput: React.FC<PhoneInputProps> = ({
	title = "Title",
	placeholder = "Placeholder",
	name = "PhoneInputName",
	nameCountryCode = "PhoneInputNameCountryCode",
	error = [],
	pattern,
	minLength = 8,
	maxLength = 256,
	ref
}) => {
	const	[focused, setFocused] = useState<boolean>(false);
	const	icon = "󰏲";

	return (
		<div className="flex flex-col items-center justify-center gap-1
			w-full"
		>

			<div className="flex items-center justify-start
				w-full"
			>
				<div className="font-inter font-bold text-[14px]">
					{ title }
				</div>
			</div>

			<div className="grid grid-cols-[auto_auto_1fr] grid-rows-1 gap-2
				p-2
				rounded-md
				shadow-standard
				w-full h-12"
				style={{
					outlineStyle: "solid",
					outlineColor: error.length > 0 ? "var(--color-red-500)" : "color-mix(in srgb, var(--color-background) 25%, transparent)",
					outlineWidth: focused ? "3px" : "1px",
				}}
			>
				<div className="flex items-center justify-center
					w-6
					relative"
				>
					<div className="absolute
						opacity-80
						font-icon"
						style={{
							fontSize: 24
						}}
					>
						{ icon }
					</div>
				</div>

				<select
					className="border border-background/25
					cursor-pointer
					px-2
					shadow-standard
					rounded-md"
					name={ nameCountryCode }
					defaultValue="+261"
				>
					{
						PhoneCountries.map((value: PhoneCountriesType, index: number) => {
							return (
								<option
									key={ index }
									value={ value.value }
								>
									{ value.title }
								</option>
							);
						})
					}
				</select>

				<input
					className="
						w-full h-full
						text-[14px]
						focus:outline-none"
					placeholder={ placeholder }
					name={ name }
					type="tel"
					required={ true }
					{...(pattern ? { pattern } : {})}
					{...(minLength ? { minLength } : {})}
					{...(maxLength ? { maxLength } : {})}
					{...(ref ? { ref } : {})}
					onFocus={ () => setFocused(true) }
					onBlur={ () => setFocused(false) }
				/>
			</div>

			<div className="w-full">
				{ error.length > 0 && error.map((value: string, index: number) => {
						return (
							<ErrorInput
								key={ index }
								value={ value }
							/>
						);
					})
				}
			</div>

		</div>
	);
}

export default PhoneInput;
