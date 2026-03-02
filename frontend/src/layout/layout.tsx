import { Outlet, useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { toast, ToastContainer } from "react-toastify";
import { useEffect } from "react";
import type { UserModelData } from "../provider/DataProvider";
import { useTranslation } from "react-i18next";
import useDataProvider from "../provider/useDataProvider";
import LoadingPage from "../pages/loading";

export default function MainLayout() {
	const { t } = useTranslation("error");
	const location = useLocation();
	const navigate = useNavigate();
	const url = new URL(window.location.href);
	const { setIsConnected, setUserData, userData } = useDataProvider();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Vérifier si l'utilisateur est authentifié
				// Les cookies sont envoyés automatiquement
				const response = await fetch(`/api/users/me`, {
					method: "GET",
					credentials: "include", // Envoie les cookies automatiquement
				});

				const responseData = await response.json();

				if (response.ok) {
					const serverResponse = responseData as UserModelData;

					setIsConnected(false);
					if ((serverResponse as any).error === "invalid_or_expired_token") {
						return;
					}
					if ((serverResponse as any).error === "phone_number_not_verified") {
						setIsConnected(false);
						if (url.pathname === "/add-phone") {
							return;
						}
						navigate("/add-phone", { replace: true });
						return;
					}
					if ((serverResponse as any).error === "email_not_verified") {
						setIsConnected(false);
						if (url.pathname === "/email-sent") {
							return;
						}
						navigate("/email-sent", { replace: true });
						return;
					}
					setIsConnected(true);
					setUserData(serverResponse);
					const from = location.state?.from;
					if (from)
						navigate(from, { replace: true });
					return;
				}

				setIsConnected(false);

			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(t(`error:${error.message}`))
			}
		};

		checkAuth();
	}, [])
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
			{
				userData !== null ? <Outlet /> : <LoadingPage />
			}
		</div>
	);
}