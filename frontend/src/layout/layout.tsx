import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import { ToastContainer } from "react-toastify";

export default function MainLayout() {
	return (
		<div className="bg-foreground
			w-full h-screen
			relative"
		>
			<ToastContainer
				position="bottom-center"
				hideProgressBar
				style={{
					padding: "1rem"
				}}
				toastStyle={{
					backgroundColor: "var(--color-foreground)",
					borderWidth: "1px",
					borderColor: "color-mix(in srgb, var(--color-background) 25%, transparent)",
					borderRadius: "var(--radius-xl)",
					fontSize: "12px"

				}}
			/>

			<NavBar />
			<Outlet />
		</div>
	);
}
