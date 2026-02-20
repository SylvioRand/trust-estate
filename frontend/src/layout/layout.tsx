import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";

export default function MainLayout() {
	// DEBUG ROUTE
	const location = useLocation();

	useEffect(() => {
		console.log("Navigated to:", location.pathname);
	}, [location]);
	// DEBUG ROUTE END
	return (
		<div className="bg-foreground
			w-full h-screen
			relative"
		>
			<ToastContainer
				position="bottom-right"
				hideProgressBar
				style={{
					padding: "1rem"
				}}
				toastStyle={{
					backgroundColor: "var(--color-foreground)",
					borderWidth: "1px",
					borderColor: "color-mix(in srgb, var(--color-background) 25%, transparent)",
					borderRadius: "var(--radius-xl)",
					fontSize: "12px",
					marginBottom: "0.75rem"
				}}
			/>

			<NavBar />
			<Outlet />
		</div>
	);
}
