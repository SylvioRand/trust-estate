interface	BoxSectionProps {
	title: string;
	children: React.ReactNode;
}

const	BoxSection: React.FC<BoxSectionProps> = ({
	title = "Title",
	children
}) => {
	return (
		<div className="grid grid-cols-1 grid-rows-[auto_1fr] gap-4
			place-items-start
			shadow-standard
			border border-background/25
			w-full
			p-4
			rounded-2xl"
		>
			<div className="font-bold">
				{ title }
			</div>
			{ children }
		</div>
	);
}

export default BoxSection;
