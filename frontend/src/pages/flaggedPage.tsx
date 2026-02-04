import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useDataProvider from "../provider/useDataProvider";
import { useNavigate } from "react-router-dom";

type HistoryModActionType = {
	listingId: string,
	title: string,
	reportCount: number,
	latestReportReason: string,
	seller: {
		id: string,
		name: string,
		email: string
	},
	flaggedAt: string
}

interface	ModActionHistoryProps {
	data: HistoryModActionType
}

const	ModActionHistory: React.FC<ModActionHistoryProps> = ({
	data
}) => {
	return (
		<div
		className="rounded-xl
		flex flex-col items-center justify-center
		border border-background/25
		w-full"
		>
			<div
			className="font-bold">
				{ data.title }
			</div>
		</div>
	);
}

const	FlaggedPage: React.FC = () => {
	const	{ t } = useTranslation(["flagged", "error", "common"]);
	const	[historyModAction, setHistoryModAction] = useState<HistoryModActionType[]>([]);
	const	{ userData, isConnected } = useDataProvider();
	const	navigate = useNavigate();

	if (isConnected !== null && isConnected === false
		|| userData !== null && userData.role !== "MODERATOR"
	)
		navigate("/sign-in");

	useEffect(() => {
		const	getActionHistory = async () => {
			try {
				const	response = await fetch(`/api/moderator/listings/flagged`, {
					method: 'GET',
					credentials: 'include'
				})

				const	responseData = await response.json();

				console.log(responseData);

				if (!response.ok)
				{
					if (responseData.details) {
						const details: Record<string, string[]> = responseData.details as Record<string, string[]>;

						for (const [key, value] of Object.entries(details)) {
							for (let i = 0; i < value.length; i++)
								toast.error(t(`error:${value[i]}`));
							}
					}
				}

				setHistoryModAction(responseData.data);
			} catch (error) {
				if (error instanceof Error)
					toast.error(`error:${error.message}`);
			}
		}
		getActionHistory();
	}, []);

	return (
		<div
		className="flex flex-col items-center justify-start
		overflow-y-scroll
		w-full h-screen"
		>
			<div
			className="w-full h-18 flex-none">
			</div>
			<div
			className="flex flex-col items-center justify-start
			w-full">
				{
					historyModAction && historyModAction.map((value: HistoryModActionType, index: number) => {
						return (
							<ModActionHistory
							key={ index }
							data={ value }
							/>
						);
					})
				}
			</div>
		</div>
	);
}

export default FlaggedPage;