import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useDataProvider from "../provider/useDataProvider";
import { Link, useNavigate } from "react-router-dom";
import { CreateDateForMemberSince } from "../utils/Format";
import ActionButton from "../components/ActionButton";

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

interface ModActionHistoryProps {
	data: HistoryModActionType
}

const ModActionHistory: React.FC<ModActionHistoryProps> = ({
	data
}) => {
	const { t } = useTranslation(["flagged", "common", "error", "listings"]);

	return (
		<div
			className="rounded-xl
		grid grid-cols-1 grid-rows-[auto_1fr]
		shadow-standard
		border border-background/25
		p-4
		w-full"
		>
			<div
				className="grid grid-cols-[1fr_auto] grid-rows-1
			w-full"
			>
				<div
					className="font-bold text-lg">
					{data.title}
				</div>

				<div
					className="flex items-center justify-center
				rounded-full
				w-7 h-7
				bg-red-500">
					<div
						className="
					rounded-full"
					>
						{data.reportCount}
					</div>
				</div>
			</div>
			<div
				className="flex flex-col items-start justify-start
			gap-3
			w-full"
			>
				<div>
					<div>
						{t("latestReportReason.title")}
					</div>
					<div
						className="font-extralight">
						{t(`listings:section.actionButton.popup.report.popup.reason.${data.latestReportReason}`)}
					</div>
				</div>

				<div>
					<div>
						{t("userInfo.title")}
					</div>

					<div
						className="flex flex-col items-start justify-start
					font-extralight
					w-full"
					>
						<div>
							{data.seller.name}
						</div>
						<div>
							{data.seller.email}
						</div>
						<div>
							{data.seller.id}
						</div>
					</div>
				</div>

				<div
					className="grid grid-cols-[auto_1fr] grid-rows-1
				gap-3
				place-items-center
				w-full"
				>
					<div
						className="font-light">
						{`${t("reportedThe")} ${CreateDateForMemberSince(data.flaggedAt)}`}
					</div>
					<Link
						className="flex items-center justify-end
					w-full"
						to={`/property/listings?id=${data.listingId}`}
					>
						<div>
							<ActionButton
								title={t("common:viewListing")}
							/>
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
}

// const	TEST: HistoryModActionType = {
// 	listingId: "23071-231203hask-419askb78283h",
// 	title: "A little heaven in earth",
// 	reportCount: 1,
// 	latestReportReason: "The listing photo doesn't match the description",
// 	seller: {
// 		id: "jhcqn923124-oiqbubw1-32139asigwdqbd97da7d65af",
// 		name: "Rakotoarivony Razanajohary Ny Hasina",
// 		email: "djazejhasi@gmail.com"
// 	},
// 	flaggedAt: "2026-04-02T23:00:00Z"
// }

const FlaggedPage: React.FC = () => {
	const { t } = useTranslation(["flagged", "error", "common"]);
	const [historyModAction, setHistoryModAction] = useState<HistoryModActionType[]>([]);
	const { userData, isConnected } = useDataProvider();
	const navigate = useNavigate();

	if (isConnected !== null && isConnected === false
		|| userData !== null && userData.role !== "MODERATOR"
	)
		navigate("/sign-in");

	useEffect(() => {
		const getActionHistory = async () => {
			try {
				const response = await fetch(`/api/moderator/listings/flagged`, {
					method: 'GET',
					credentials: 'include'
				})

				const responseData = await response.json();

				if (!response.ok) {
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
		px-4 md:px-7 xl:px-64
		gap-3
		w-full h-screen"
		>
			<div
				className="w-full h-18 flex-none">
			</div>
			<div
				className="grid grid-cols-1 grid-rows-1
			md:grid-cols-2
			xl:grid-cols-3
			place-items-center
			gap-3
			w-full">
				{
					historyModAction && historyModAction.map((value: HistoryModActionType, index: number) => {
						return (
							<ModActionHistory
								key={index}
								data={value}
							/>
						);
					})
				}
			</div>
			<div
				className="w-full h-4 flex-none">
			</div>
		</div>
	);
}

export default FlaggedPage;