import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDataProvider from "../provider/useDataProvider";
import type { UserModelData } from "../provider/DataProvider";
import type { APIResponse } from "../pages/sign_up";

export function VerifyUsersState() {
	const	navigate = useNavigate();
	const	{ setIsConnected, setUserData } = useDataProvider();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Vérifier si l'utilisateur est authentifié
				// Les cookies sont envoyés automatiquement
				const response = await fetch(`/api/users/me`, {
					method: "GET",
					credentials: "include", // Envoie les cookies automatiquement
				});
				
				const	responseData = await response.json();

				if (response.ok) {
					const	serverResponse = responseData as UserModelData;

					setIsConnected(true);
					setUserData(serverResponse);
					return;
				}

				if (response.status === 403) {
					const errorData = responseData as APIResponse;
					
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
	}, [navigate, setIsConnected, setUserData]);
}
