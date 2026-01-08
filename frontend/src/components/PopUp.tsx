import { useState, type ReactPortal } from "react";
import { createPortal } from "react-dom";

interface	PopUpComponentProps {
	title: string;
	children: React.ReactNode;
	onClose: () => void;
}

const	PopUpComponent: React.FC<PopUpComponentProps> = ({
	title = "Title",
	children,
	onClose = () => console.error("PopUp: onClose not overrided")
}) => {
	const	[areClosing, setAreClosing] = useState<boolean>(false);

	function	handleClosing() {
		setAreClosing(true);
		setTimeout(onClose, 300);
	}

	return (
		<div className="fixed top-0 left-0
			flex items-center justify-center
			bg-black/75
			p-4
			w-full h-screen"
			style={{
				animation: areClosing ? "var(--animate-fade-out)" : "var(--animate-fade-in)"
			}}
		>
			<div className="grid grid-cols-1 grid-rows-[auto_1fr] gap-4
				place-items-start
				shadow-standard
				border border-background/25
				bg-foreground
				w-full max-w-100
				p-4
				rounded-2xl"
			>
				<div className="grid grid-cols-[1fr_auto] grid-rows-1 w-full">
					<div className="font-bold">
						{ title }
					</div>
					<div className="flex items-center justify-center
						cursor-pointer
						w-4 h-4
						transition-colors duration-300
						hover:text-red-500
						relative"
						onClick={ handleClosing }
					>
						<div className="font-icon text-2xl
							select-none
							absolute"
						>
							
						</div>
					</div>
				</div>
				{ children }
			</div>
		</div>
	);
}

function	PopUp({
	title = "Title",
	children,
	onClose = () => console.error("PopUp: onClose not overrided")
} : {
	title: string;
	children: React.ReactNode;
	onClose: () => void;
}) {
	return (
		createPortal(
			<PopUpComponent
				title={ title }
				children={ children }
				onClose={ onClose }
			/>,
			document.body
		)
	);
}

export default PopUp;
