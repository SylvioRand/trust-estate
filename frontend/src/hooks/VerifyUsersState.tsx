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
			try {
				const response = await fetch(`/api/users/me`, {
					method: "GET",
					credentials: "include"
				});

				const responseData = await response.json();

				if (response.ok) {
					const serverResponse = responseData as UserModelData;

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

			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(t(`error:${error.message}`))
			}
		};

		checkAuth();
	}, [navigate, setIsConnected, setUserData]);
}
