import React, { useContext, useEffect, useState, type Dispatch } from "react";
import { DataContext } from "./DataContext";

interface	DataProviderProps {
	children: React.ReactNode;
}

const	DataProvider: React.FC<DataProviderProps> = ({
	children
}) => {
	const	[isConnected, setIsConnected] = useState<boolean>(false);
	const	[isLoading, setIsLoading] = useState<boolean>(false);

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
					setIsConnected(true);
					return;
				}

				if (res.status === 403) {
					const errorData = await res.json();
					
					setIsConnected(true);
					console.log("HERE 403 DATA PROVIDER");
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
				setIsConnected
			}}
		>
			{ children }
		</DataContext.Provider>
	);
}

export default DataProvider;
