import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthRedirect() {
	const navigate = useNavigate();

	useEffect(() => {

		const checkAuth = async () => {
			try {
				const res = await fetch(`/api/users/me`, {
					method: "GET",
					credentials: "include",
				});

				if (res.ok) {
					console.log("HERE");
					navigate("/home", { replace: true });
				}
				else if (res.status === 403) {
					console.log("HERE 403");
					const errorData = await res.json();
					if (errorData.error === "phone_number_not_verified") {
						navigate("/add-phone", { replace: true });
					}
				}
				else if (res.status === 401) {
					console.log("HERE 401");
					const errorData = await res.json();
					if (errorData.error === "email_not_verified") {
						navigate("/verify-email", { replace: true });
					}
				}
			} catch (err) {
				console.error("Auth check failed:", err);
			}
		};

		checkAuth();
	}, []);
}


// window.addEventListener('DOMContentLoaded', async () => {
// 	try {
// 		const res = await fetch(${API_BASE_URL}/users/me, {
// 			method: 'GET',
// 			credentials: 'include'
// 		});
// 		if (res.ok) {
// 			window.location.href = 'profile.html';
// 		} else if (res.status === 403) { // Téléphone non vérifié
// 			const errorData = await res.json();
// 			if (errorData.error === 'phone_number_not_verified') {
// 				window.location.href = 'add-phone.html';
// 			}
// 		} else if (res.status === 401) { // Email non vérifié ou non authentifié
// 			const errorData = await res.json();
// 			if (errorData.error === 'email_not_verified') {
// 				window.location.href = 'request-email-verification.html';
// 			}
// 		}
// 	} catch (error) {
// 		console.log("Erreur lors de la vérification de l'authentification:", error);
// 	}
// });
