import React, { useState } from "react";
import { DataContext } from "./DataContext";

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
