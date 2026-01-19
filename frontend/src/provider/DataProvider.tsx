import React, { useContext, useEffect, useState, type Dispatch } from "react";
import { DataContext } from "./DataContext";

interface	DataProviderProps {
	children: React.ReactNode;
}

export type UserModelData = {
  id: string,
  email: string,
  emailVerified: string,
  firstName: string,
  lastName: string,
  phone: string,
  phoneVerified: boolean,
  role: "user" | "moderator",
  hasPassword: boolean,
  creditBalance: number,
  createdAt: string,
  updatedAt: string
}

const	DataProvider: React.FC<DataProviderProps> = ({
	children
}) => {
	const	[isConnected, setIsConnected] = useState<boolean | null>(null);
	const	[isLoading, setIsLoading] = useState<boolean>(false);
	const	[userData, setUserData] = useState<UserModelData | null>(null);

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

					// NOTE: use the response and populate the data.
					setUserData(serverResponse);
					return;
				}

				if (response.status === 403) {
					const errorData = await response.json();
					
					setIsConnected(true);
					if (errorData.error === "phone_number_not_verified") {
						return;
					}
					if (errorData.error === "email_not_verified") {
						return;
					}
				}

			} catch (err) {
				console.error("Auth check failed:", err);
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
			{ children }
		</DataContext.Provider>
	);
}

export default DataProvider;
