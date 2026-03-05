import React, { useEffect, useState } from "react";
import { DataContext } from "./DataContext";
import { apiFetch } from "../utils/fetchWithoutConsoleError";
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
	const location = useLocation();
	const navigate = useNavigate();
	const url = new URL(window.location.href);
	useEffect(() => {
		const checkAuth = async () => {
			// /api/auth/status est un endpoint nginx qui intercepte les
			// 4xx/5xx upstream et retourne toujours HTTP 200 avec un
			// champ `error` dans le corps JSON. Aucune erreur réseau
			// n'apparaît dans la console du navigateur.
			const { data, error } = await apiFetch<UserModelData>("/api/auth/status");

			if (error === "service_unavailable") {
				setIsConnected(false);
				return;
			}
			if (error === "invalid_or_expired_token" || !data) {
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
			const from = location.state?.from;
			if (from)
				navigate(from, { replace: true });
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
