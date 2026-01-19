import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDataProvider from "../provider/useDataProvider";

export function VerifyUsersState() {
	const	navigate = useNavigate();
	const	{ setIsConnected } = useDataProvider();

	useEffect(() => {
		const checkAuth = async () => {
			console.log("VerifyUsersState: called.");

			try {
				// Vérifier si l'utilisateur est authentifié
				// Les cookies sont envoyés automatiquement
				const res = await fetch(`/api/users/me`, {
					method: "GET",
					credentials: "include", // Envoie les cookies automatiquement
				});
				
				if (res.ok) {
					console.log("VerifyUsersState: 200 OK?");
					setIsConnected(true);
					return;
				}

				if (res.status === 403) {
					const errorData = await res.json();
					
					console.log("VerifyUsersState: 403, ", errorData.error);
					setIsConnected(true);
					if (errorData.error === "phone_number_not_verified") {
						navigate("/add-phone", { replace: true });
						return;
					}
					if (errorData.error === "email_not_verified") {
						navigate("/email-sent", { replace: true });
						return;
					}
				}

			} catch (err) {
				console.error("Auth check failed:", err);
			}
		};

		checkAuth();
	}, [navigate]);
}
