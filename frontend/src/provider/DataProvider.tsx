import React, { useEffect, useState } from "react";
import { DataContext } from "./DataContext";
import type { APIResponse } from "../pages/sign_up";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

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
	const clearLoggedInCookie = () => {
		document.cookie = "realestate_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	};

	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Vérifier si l'utilisateur est authentifié
				// Les cookies sont envoyés automatiquement
				const isLoggedIn = document.cookie.split("; ").find((row) => row.startsWith("realestate_logged_in="));
				if (!isLoggedIn) {
					setIsConnected(false);
					return;
				}

				const response = await fetch(`/api/users/me`, {
					method: "GET",
					credentials: "include", // Envoie les cookies automatiquement
				});

				const responseData = await response.json();

				if (response.ok) {
					const serverResponse = responseData as UserModelData;

					setIsConnected(false);
					if ((serverResponse as any).error === "invalid_or_expired_token") {
						clearLoggedInCookie();
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
						setUserData(null);
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
				clearLoggedInCookie();

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
