import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook pour rediriger automatiquement un utilisateur authentifié
 * Utilisé sur les pages publiques (login, signup) pour éviter qu'un utilisateur
 * connecté puisse y accéder
 * 
 * NOTE: Ce hook n'est plus nécessaire si vous utilisez <PublicRoot>
 * qui gère déjà cette logique. Conservé pour compatibilité.
 * 
 * Les tokens JWT sont dans les cookies HTTP-only, pas dans localStorage.
 * Le navigateur les envoie automatiquement avec credentials: 'include'
 */
export function useAuthRedirect() {
	const navigate = useNavigate();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Vérifier si l'utilisateur est authentifié
				// Les cookies sont envoyés automatiquement
				const res = await fetch(`/api/users/me`, {
					method: "GET",
					credentials: "include", // Envoie les cookies automatiquement
				});
				
				if (res.ok) {
					return;
				}

				if (res.status === 403) {
					const errorData = await res.json();
					
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
				// Erreur réseau réelle
				console.error("Auth check failed:", err);
			}
		};

		checkAuth();
	}, [navigate]);
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
