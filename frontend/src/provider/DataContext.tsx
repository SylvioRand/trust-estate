import React, { type Dispatch } from "react";

type	DataProviderType = {
	isConnected: boolean;
	isLoading: boolean;
	setIsConnected: Dispatch<React.SetStateAction<boolean>>;
}

export const	DataContext = React.createContext<DataProviderType | null>(null);
