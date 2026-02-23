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
	comment?: string | null,
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

const ModActionHistory: React.FC<ModActionHistoryProps> = ({ data }) => {
	const { t } = useTranslation(["flagged", "common", "error", "listings"]);

	return (
		<div
			className="rounded-2xl
			grid grid-cols-1
			w-full
			overflow-hidden
			border border-white/10
			bg-white/5
			shadow-lg
			hover:-translate-y-0.5
			transition-transform duration-300"
		>
			<div
				className="grid grid-cols-[1fr_auto] items-center
				gap-3
				px-5 pt-5 pb-4
				border-b border-white/10"
			>
				<div className="font-bold text-base tracking-wide truncate">
					{data.title}
				</div>

				<div
					className="flex items-center justify-center
					min-w-[28px] h-7 px-2
					rounded-full
					bg-red-600
					text-xs font-bold text-white
					shadow-[0_0_10px_rgba(220,38,38,0.5)]"
				>
					{data.reportCount}
				</div>
			</div>

			<div className="flex flex-col gap-4 px-5 py-4">

				<div className="flex flex-col gap-1">
					<span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-400/80">
						{t("latestReportReason.title")}
					</span>
					<span className="text-sm font-extralight opacity-70">
						{t(`listings:section.actionButton.popup.report.popup.reason.${data.latestReportReason}`)}
					</span>
				</div>

				<div className="w-full h-px bg-white/5" />

				<div className="flex flex-col gap-1">
					<span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-400/80">
						{t("userInfo.title")}
					</span>
					<div className="flex flex-col gap-0.5">
						<span className="text-sm font-light">{data.seller.name}</span>
						<span className="text-sm font-extralight opacity-50">{data.seller.email}</span>
						<span className="text-[11px] font-mono opacity-25 tracking-wide mt-0.5">{data.comment}</span>
					</div>
				</div>

				<div className="w-full h-px bg-white/5" />

				<div className="flex items-center justify-between gap-3 w-full">
					<span className="text-xs font-light opacity-40 whitespace-nowrap">
						{`${t("reportedThe")} ${CreateDateForMemberSince(data.flaggedAt)}`}
					</span>

					<Link to={`/property/listings?id=${data.listingId}`}>
						<ActionButton title={t("common:viewListing")} />
					</Link>
				</div>

			</div>
		</div>
	);
};


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
				console.log(responseData);
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