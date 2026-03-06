import React, { type CSSProperties, type RefObject } from "react";

interface TextAreaProps {
	title: string;
	name: string;
	placeholder: string;
	rows?: number;
	inputMode?: "none" | "text" | "search" | "decimal" | "tel" | "url" | "email" | "numeric" | undefined;
	minLength?: number;
	maxLength?: number;
	customStyle?: CSSProperties;
	value?: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onFocus?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onBlur?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	ref: RefObject<HTMLTextAreaElement | null>;
	patternError?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
	title = "Title",
	name = "TextAreaName",
	placeholder = "Placeholder",
	rows = 2,
	inputMode = "text",
	minLength = 32,
	maxLength = 256,
	customStyle = {},
	value = "",
	onKeyDown,
	onChange,
	onFocus,
	onBlur,
	ref = null,
	patternError = ""
}) => {
	return (
		<div className="flex flex-col items-center justify-center gap-1
			w-full"
		>
			<div className="flex items-center justify-start
				w-full"
			>
				<div className="font-bold text-[14px]">
					{title}
				</div>
			</div>
			<textarea
				ref={ref}
				className="w-full
				outline-1 outline-background/25
				focus:outline-3
				p-2
				rounded-md
				shadow-standard
				text-[14px]
				font-light
				resize-none"
				inputMode={inputMode}
				name={name}
				placeholder={placeholder}
				rows={rows}
				minLength={minLength}
				maxLength={maxLength}
				required={true}
				style={{
					...customStyle
				}}
				{...value ? { value } : {}}
				{...onKeyDown ? { onKeyDown } : {}}
				{...onChange ? { onChange } : {}}
				{...onFocus ? { onFocus } : {}}
				{...onBlur ? { onBlur } : {}}
				onInput={(e) => {
					const target = e.target as HTMLTextAreaElement;
					// Manual check for "only spaces" since textarea doesn't support 'pattern'
					if (target.value.length > 0 && target.value.trim() === "" && patternError) {
						target.setCustomValidity(patternError);
					} else {
						target.setCustomValidity("");
					}
				}}
				onInvalid={(e) => {
					const target = e.target as HTMLTextAreaElement;
					if (target.value.length > 0 && target.value.trim() === "" && patternError) {
						target.setCustomValidity(patternError);
					}
				}}
			/>
		</div>
	);
}

export default TextArea;
