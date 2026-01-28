export type	InputCheckBoxType =  {
	value: string;
	title: string;
}

interface	InputCheckboxProps {
	title: string;
	name: string;
	value: InputCheckBoxType[];
}

const	InputCheckbox: React.FC<InputCheckboxProps> = ({
	title = "Title",
	name = "InputCheckboxName",
	value = []
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
					{ title }
				</div>
			</div>
			{
				value.map((value: InputCheckBoxType, index: number) => {
					return (
						<div
						className="grid grid-cols-[auto_1fr] grid-rows-1
						gap-3
						w-full"
						key={ index }
						>
							<input
							type="checkbox"
							name={ name }
							value={ value.value }
							>
							</input>
							<div>
								{ value.title }
							</div>
						</div>
					);
				})
			}
		</div>
	);
}

export default InputCheckbox;