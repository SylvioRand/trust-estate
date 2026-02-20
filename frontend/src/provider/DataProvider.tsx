import React, { useEffect, useState } from "react";
import { DataContext } from "./DataContext";
import type { APIResponse } from "../pages/sign_up";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { protectedRoutes } from "../main";

interface DataProviderProps {
	children: React.ReactNode;
}

export type UserModelData = {
	id: string,
	email: string,
	emailVerified: boolean,
	firstName: string,
	lastName: string,
	phone: string,
	phoneVerified: boolean,
	role: "USER" | "MODERATOR",
	hasPassword: boolean,
	creditBalance: number,
	createdAt: string,
	updatedAt: string
}

const DataProvider: React.FC<DataProviderProps> = ({
	children
}) => {
	const [isConnected, setIsConnected] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [userData, setUserData] = useState<UserModelData | null>(null);
	const { t } = useTranslation("error");
	const location = useLocation();
	const navigate = useNavigate();
	const url = new URL(window.location.href);
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
				// console.log("Response Promise: ", response);
				// console.log("Response Data: ", responseData);

				if (response.ok) {
					const serverResponse = responseData as UserModelData;

					if ((serverResponse as any).error === "invalid_or_expired_token") {
						setIsConnected(false);
						setUserData(null);
						return;
					}
					if ((serverResponse as any).error === "phone_number_not_verified") {
						setIsConnected(false);
						setUserData(null);
						if (url.pathname === "/add-phone") {
							return;
						}
						console.log("DataProvider: redirect to /add-phone.");
						navigate("/add-phone", { replace: true });
						return;
					}
					if ((serverResponse as any).error === "email_not_verified") {
						setIsConnected(false);
						setUserData(null);
						if (url.pathname === "/email-sent" || url.pathname === "/verify-email") {
							return;
						}
						console.log("DataProvider: redirect to /email-sent.");
						navigate("/email-sent", { replace: true });
						return;
					}
					setIsConnected(true);
					setUserData(serverResponse);

					if (protectedRoutes.includes(location.pathname))
						navigate("/sign-in");
					else {
						// I safely ignore redirection during email verification
						if (location.pathname === "/verify-email")
							return;
						if (window.history.length > 1)
							navigate(-1);
						else {
							console.log("Redirected to /home");
							navigate("/home");
						}
					}

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
		<DataContext.Provider
			value={{
				isConnected,
				isLoading,
				setIsConnected,
				userData,
				setUserData
			}}
		>
			{children}
		</DataContext.Provider>
	);
}

export default DataProvider;
