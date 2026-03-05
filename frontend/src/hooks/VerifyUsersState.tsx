import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDataProvider from "../provider/useDataProvider";
import type { UserModelData } from "../provider/DataProvider";
import { apiFetch } from "../utils/fetchWithoutConsoleError";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export function VerifyUsersState() {
	const navigate = useNavigate();
	const { setIsConnected, setUserData } = useDataProvider();
	const { t } = useTranslation("error");
	const url = new URL(window.location.href);

	useEffect(() => {
		const checkAuth = async () => {
			// /api/auth/status retourne toujours HTTP 200 (nginx wrapper)
			// — aucune erreur 4xx/5xx ne s'affiche dans la console.
			const { data, error } = await apiFetch<UserModelData>("/api/auth/status");

			if (error === "service_unavailable") {
				toast.error(t("error:server_unavailable"));
				setIsConnected(false);
				return;
			}
			if (error === "invalid_or_expired_token" || error === "network_error" || !data) {
				setIsConnected(false);
				return;
			}
			if (error === "phone_number_not_verified") {
				setIsConnected(false);
				if (url.pathname !== "/add-phone")
					navigate("/add-phone", { replace: true });
				return;
			}
			if (error === "email_not_verified") {
				setUserData(null);
				setIsConnected(false);
				if (url.pathname !== "/email-sent")
					navigate("/email-sent", { replace: true });
				return;
			}
			setIsConnected(true);
			setUserData(data);
		};

		checkAuth();
	}, [navigate, setIsConnected, setUserData, t]);
}
