import { useState , useRef, useEffect } from "react";

interface TapeTextProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function TapeText({ value, onChange, onKeyDown }: TapeTextProps) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
		}
	}, [value]);

	return (
		<textarea
			ref={textareaRef}
			value={value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			className="w-full px-4 py-2 bg-white text-black rounded-lg border border-gray-300
				outline-none focus:ring-2 focus:ring-gray-500 resize-none leading-5 max-h-40"
			placeholder="Ecrire un message..."
			rows={1}
		/>
	);
}

interface TextInputProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	onSubmit: () => void;
}

const	TextInput: React.FC<TextInputProps> = ({
	value,
	onChange,
	onKeyDown,
	onSubmit,
}) => {
	return (
		<div className="w-full items-center px-24 md:px-12 overflow-hidden
			flex flex-row justify-center space-x-3 p-5 mt-auto h-auto bottom-0">
			
			<TapeText
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
			/>

			<button onClick={onSubmit}>
				<div className="font-icon text-6xl text-white">
					󰷸
				</div>
			</button>
		</div>
	);
}


export default TextInput;
