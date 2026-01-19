import React, { type Dispatch } from "react";
import type { UserModelData } from "./DataProvider";

type	DataProviderType = {
	isConnected: boolean | null;
	isLoading: boolean;
	setIsConnected: Dispatch<React.SetStateAction<boolean | null>>;
	userData: UserModelData | null;
	setUserData: Dispatch<React.SetStateAction<UserModelData | null>>;
}

export const	DataContext = React.createContext<DataProviderType | null>(null);
