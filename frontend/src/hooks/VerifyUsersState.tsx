import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDataProvider from "../provider/useDataProvider";
import type { UserModelData } from "../provider/DataProvider";
import type { APIResponse } from "../pages/sign_up";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export function VerifyUsersState() {
	const navigate = useNavigate();
	const { setIsConnected, setUserData } = useDataProvider();
	const { t } = useTranslation("error");

	useEffect(() => {
		const checkAuth = async () => {
			const url = new URL(window.location.href);
			try {
				const response = await fetch(`/api/users/me`, {
					method: "GET",
					credentials: "include"
				});

				const responseData = await response.json();

				if (response.ok) {
					const serverResponse = responseData as UserModelData;

					if ((serverResponse as any).error === "invalid_or_expired_token") {
						setIsConnected(false);
						return;
					}
					if ((serverResponse as any).error === "phone_number_not_verified") {
						setIsConnected(true);
						if (url.pathname === "/add-phone") {
							return;
						}
						navigate("/add-phone", { replace: true });
						return;
					}
					if ((serverResponse as any).error === "email_not_verified") {
						setIsConnected(true);
						if (url.pathname === "/email-sent") {
							return;
						}
						navigate("/email-sent", { replace: true });
						return;
					}
					setIsConnected(true);
					setUserData(serverResponse);
					return;
				}

			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(t(`error:${error.message}`))
			}
		};

		checkAuth();
	}, [navigate, setIsConnected, setUserData, t]);
}
