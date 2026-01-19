import React, { useState } from "react";
import { createPortal } from "react-dom";

interface	PhotoViewerProps {
	picture: string[];
	startID: number;
	onClose: () => void;
}

const	ComponentPhotoViewer: React.FC<PhotoViewerProps> = ({
	picture = [],
	startID = 0,
	onClose = () => console.error("PhotoViewer: ComponentPhotoViewer: onClose was not overrided")
}) => {
	const	[displayID, setDisplayID] = useState<number>(startID);
	const	[closeRequested, setCloseRequested] = useState<boolean>(false);

	const	handleClose = () => {
		setCloseRequested(true);
		setTimeout(onClose, 300);
	}

	return (
		<div className="fixed top-0 left-0
			grid grid-cols-1 grid-rows-[auto_1fr] place-items-center p-4
			w-full h-screen"
		>
			<div className="w-full h-14 flex-none">
			</div>

			<div className="grid grid-cols-1 grid-rows-1 place-items-center
				max-w-200
				bg-black
				rounded-2xl
				relative
				w-full h-full"
				style={{
					animation: closeRequested ? "var(--animate-fade-out)" : "var(--animate-fade-in)"
				}}
			>
				<div className="absolute top-0 left-0
					flex items-center justify-end
					px-4 py-2
					text-light-foreground
					w-full">
					<button className="font-icon
						transition-colors duration-300
						cursor-pointer
						text-2xl hover:text-red-500"
						onClick={ handleClose }
					>
						
					</button>
				</div>

				<div className="relative w-full h-[50%] overflow-hidden"
				>
					{ picture.map((value: string, index: number) => {
						const	active: boolean = index === displayID;

						return (
							<img
								key={ index }
								className="absolute w-full h-full object-cover
									transition-all duration-300"
								src={ value }
								alt="House Picture"
								style={{
									opacity: active ? "100%" : "0%",
									transform: active ? "scale(100%)" : "scale(75%)"
								}}
							/>
						)
					})}

					<button className="absolute top-1/2 left-4
						bg-foreground
						border border-background/25
						shadow-standard
						px-2
						rounded-2xl
						cursor-pointer
						flex items-center justify-center"
						onClick={ () => setDisplayID(displayID === 0 ? picture.length - 1 : displayID - 1) }
					>
						<div className="font-icon text-2xl">
							
						</div>
					</button>

					<button className="absolute top-1/2 right-4
						bg-foreground
						border border-background/25
						shadow-standard
						px-2
						rounded-2xl
						cursor-pointer
						flex items-center justify-center"
						onClick={ () => setDisplayID(displayID === picture.length - 1 ? 0 : displayID + 1) }
					>
						<div className="font-icon text-2xl">
							
						</div>
					</button>
				</div>

				<div className="absolute bottom-4
					text-shadow-md
					text-light-foreground
					font-light
					w-full
					flex items-center justify-center"
				>
					{ `${ displayID + 1 }/${ picture.length }` }
				</div>
			</div>
		</div>
	);
}

function	PhotoViewer({
	picture = [],
	startID = 0,
	onClose = () => console.error("PhotoViewer: onClose was not overrided")
} : {
	picture: string[],
	startID: number,
	onClose: () => void
})
{
	return (
		createPortal(
			<ComponentPhotoViewer
				picture={ picture }
				startID={ startID }
				onClose={ onClose }
			/>,
			document.body
		)
	);
}

export default PhotoViewer;
