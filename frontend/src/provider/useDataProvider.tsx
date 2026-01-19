import { useContext } from "react";
import { DataContext } from "./DataContext";

export default function useDataProvider() {
	const	context = useContext(DataContext);

	if (!context)
		throw new Error("useDataProvider: should only be used inside a direct child of the components DataProvider.");
	
	return (context);
}
