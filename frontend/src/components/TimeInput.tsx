import type { RefObject } from "react";

interface	TimeInputProps {
	id: string;
	name: string;
	title: string;
	min?: string;
	max?: string;
	ref?: RefObject<HTMLInputElement | null>;
}

const	TimeInput: React.FC<TimeInputProps> = ({
	id = "ID",
	name = "TimeInputName",
	title = "Title",
	min,
	max,
	ref
}) => {
	return (
		<div className="grid grid-cols-[auto_1fr] grid-rows-1
			w-full"
		>
			<label
				htmlFor={ id }
				className="justify-self-start"
			>
				{ title }
			</label>
			<input
				className="justify-self-end"
				id={ id }
				name={ name }
				type="time"
				required={ true }
				{ ...ref ? { ref } : {}}
				{ ...min ? { min } : {}}
				{ ...max ? { max } : {}}
			/>
		</div>
	);
}

export default TimeInput;
