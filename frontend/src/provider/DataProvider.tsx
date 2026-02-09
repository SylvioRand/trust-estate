import React, { useEffect, useState } from "react";
import { DataContext } from "./DataContext";
import type { APIResponse } from "../pages/sign_up";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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

					setIsConnected(true);

					// NOTE: use the response and populate the data.
					setUserData(serverResponse);
					return;
				}

				setIsConnected(false);

				if (response.status === 403) {
					const errorData = responseData as APIResponse;

					setIsConnected(true);
					if (errorData.error === "phone_number_not_verified") {
						return;
					}
					if (errorData.error === "email_not_verified") {
						return;
					}
				}

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
