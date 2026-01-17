import { type HTMLInputTypeAttribute, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";

interface ErrorInputProps {
	value: string;
}

export const	ErrorInput: React.FC<ErrorInputProps> = ({
	value = "Error"
}) => {
	const	{ t } = useTranslation("error");

	return (
		<div className="grid grid-cols-[auto_1fr] grid-rows-1 gap-2
			text-red-500
			w-full"
		>
			<div className="flex items-center justify-center">
				<span className="font-icon text-[10px] pt-[0.1rem]"></span>
			</div>
			<div className="flex items-center justify-start
				text-[12px]
				w-full"
			>
				{ t("error:" + value) }
			</div>
		</div>
	)
}

interface SimpleInputProps {
	title: string;
	icon?: string;
	icon_size?: number;
	placeholder: string;
	name: string;
	type?: HTMLInputTypeAttribute | undefined;
	error: string[];
	pattern?: string;
	minLength?: number;
	maxLength?: number;
	ref?: RefObject<HTMLInputElement | null>;
}

const	SimpleInput: React.FC<SimpleInputProps> = ({
	title = "Title",
	icon = "",
	icon_size = 24,
	placeholder = "Placeholder",
	name = "SimpleInput",
	type = "text",
	error = [],
	pattern,
	minLength = 8,
	maxLength = 256,
	ref
}) => {
	const	[focused, setFocused] = useState<boolean>(false);

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

			<div className="grid grid-rows-1 gap-2
				p-2
				rounded-md
				shadow-standard
				bg-foreground
				w-full h-10"
				style={{
					borderColor: error.length > 0 ? "var(--color-red-500)" : "color-mix(in srgb, var(--color-background) 25%, transparent)",
					borderWidth: focused ? "3px" : "1px",
					gridTemplateColumns: icon ? "auto 1fr" : "auto"
				}}
			>
				{
					icon &&
					<div className="flex items-center justify-center
						w-6
						relative"
					>
						<div className="absolute
							opacity-80
							font-icon"
							style={{
								fontSize: icon_size
							}}
						>
							{ icon }
						</div>
					</div>
				}
				<input
					className="bg-transparent
						w-full h-full
						text-[14px]
						focus:outline-none"
					placeholder={ placeholder }
					name={ name }
					type={ type }
					required={ true }
					{...(pattern ? { pattern } : {})}
					{...(minLength ? { minLength } : {})}
					{...(maxLength ? { maxLength } : {})}
					{...(ref ? { ref } : {})}
					onFocus={ () => setFocused(true) }
					onBlur={ () => {
						setFocused(false);
					}}
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

interface PasswordInputProps {
	title: string;
	placeholder: string;
	name: string;
	error: string[];
	pattern?: string;
}

export const	PasswordInput: React.FC<PasswordInputProps> = ({
	title = "Title",
	placeholder = "Placeholder",
	name = "PasswordInput",
	error = [],
	pattern
}) => {
	const	[show, setShow] = useState(false);
	const	[focused, setFocused] = useState<boolean>(false);

	return (
		<div className="flex flex-col items-center justify-center gap-1
			w-full"
		>

			<div className="flex items-center justify-start
				w-full"
			>
				<div className="font-bold text-[14px]">
					{ title }
				</div>
			</div>

			<div className="grid grid-cols-[1fr_auto] grid-rows-1 gap-3
				p-2
				border
				rounded-md
				shadow-standard
				w-full h-10"
				style={{
					borderColor: error.length > 0 ? "var(--color-red-500)" : "color-mix(in srgb, var(--color-background) 25%, transparent)",
					borderWidth: focused ? "3px" : "1px",
				}}
			>
				<input
					className="bg-transparent
						w-full h-full
						text-[14px]
						focus:outline-none"
					placeholder={ placeholder }
					name={ name }
					required={ true }
					type={ show ? "text" : "password" }
					onFocus={ () => setFocused(true) }
					onBlur={ () => setFocused(false) }
					{...(pattern ? { pattern } : {})}
				/>

				<button className="flex items-center justify-center
					cursor-pointer
					w-7 h-full"
					onClick={ () => setShow(show ? false : true) }
					type="button"
				>
					<span className="font-icon
						text-3xl"
					>
						{ show ? "󰈉" : "󰈈" }
					</span>
				</button>

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

export default SimpleInput;
