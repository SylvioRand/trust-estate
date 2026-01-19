import {
	useState,
	useCallback,
	forwardRef,
	useImperativeHandle
} from "react";
import { createPortal } from "react-dom";

export type PopUpAPI = {
	close: () => void;
};

interface PopUpComponentProps {
	title: string;
	onClose: () => void;
	children: React.ReactNode;
}

const PopUpComponent = forwardRef<PopUpAPI, PopUpComponentProps>(
	({ title, onClose, children }, ref) => {
		const [areClosing, setAreClosing] = useState(false);

		const handleClosing = useCallback(() => {
			setAreClosing(true);
			setTimeout(onClose, 300);
		}, [onClose]);

		useImperativeHandle(ref, () => ({
			close: handleClosing
		}), [handleClosing]);

		return (
			<div
				className="fixed top-0 left-0 flex items-center justify-center
				bg-black/75 p-4 w-full h-screen"
				style={{
					animation: areClosing
						? "var(--animate-fade-out)"
						: "var(--animate-fade-in)"
				}}
			>
				<div
					className="grid grid-cols-1 grid-rows-[auto_1fr] gap-4
					shadow-standard border border-background/25
					bg-foreground w-full max-w-100 p-4 rounded-2xl"
				>
					<div className="grid grid-cols-[1fr_auto] w-full">
						<div className="font-bold">{title}</div>
						<div
							className="flex items-center justify-center
							cursor-pointer w-4 h-4 hover:text-red-500
							relative"
							onClick={handleClosing}
						>
							<div className="font-icon text-2xl select-none absolute">
								
							</div>
						</div>
					</div>
					{children}
				</div>
			</div>
		);
	}
);

PopUpComponent.displayName = "PopUpComponent";

interface PopUpProps {
	title: string;
	children: React.ReactNode;
	onClose: () => void;
}

const PopUp = forwardRef<PopUpAPI, PopUpProps>(
	({ title, children, onClose }, ref) => {
		if (typeof document === "undefined")
			return null;

		return createPortal(
			<PopUpComponent
				ref={ref}
				title={title}
				onClose={onClose}
			>
				{children}
			</PopUpComponent>,
			document.body
		);
	}
);

PopUp.displayName = "PopUp";

export default PopUp;
