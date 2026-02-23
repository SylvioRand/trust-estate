import type { TFunction } from "i18next";
import type { ListingsData } from "../dataModel/modelListings";
import { ListingsFeaturesAndEquipment, ListingsHeader } from "./my_listings_view";
import { useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import PopUp, { type PopUpAPI } from "../components/PopUp";
import TextArea from "../components/TextArea";
import ActionButton from "../components/ActionButton";
import InputEnum from "../components/InputEnum";
import { toast } from "react-toastify";
import useDataProvider from "../provider/useDataProvider";
import { useNavigate } from "react-router-dom";
import Animate from "../components/Animate";

export interface ListingsViewProps {
	fetchedData: ListingsData;
	setFetchedData: Dispatch<SetStateAction<ListingsData | null>>;
	t: TFunction<["listings", "error", "common"]>;
}

interface SellerStatsProps {
	title: string;
	value: any;
}

const SellerStats: React.FC<SellerStatsProps> = ({
	title = "Title",
	value = "Value"
}) => {
	return (
		<div
			className="grid grid-cols-1 grid-rows-[auto_1fr]
		min-w-37
		rounded-xl
		p-2
		border border-background/25
		shadow-standard"
		>
			<div
				className="font-bold text-4xl text-accent
			text-shadow-[0px_0px_7px_color-mix(in_srgb,black_25%,transparent)]"
			>
				{value}
			</div>
			<div
				className="font-light"
			>
				{title}
			</div>
		</div>
	);
}

const ClientListingsView: React.FC<ListingsViewProps> = ({
	fetchedData,
	setFetchedData,
	t
}) => {
	const { isConnected, userData } = useDataProvider();
	const navigate = useNavigate();
	const refToComment: RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement>(null);
	const refPopUpReport: RefObject<PopUpAPI | null> = useRef<PopUpAPI>(null);
	const [arePopUpReportOpen, setArePopUpReportOpen] = useState<boolean>(false);
	const [processingReport, setProcessingReport] = useState<boolean>(false);
	const sellerStats: string[] = [
		"successfulSales",
		"successfulRent",
		"averageRating",
	];
	const refPopUpModAction: RefObject<PopUpAPI | null> = useRef<PopUpAPI | null>(null);
	const [arePopUpModActionOpen, setArePopUpModActionOpen] = useState<boolean>(false);
	const [processingModAction, setProcessingModAction] = useState<boolean>(false);
	const refToReason: RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement>(null);
	const refToMessageToSeller: RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement>(null);
	const refToInternalNote: RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement>(null);

	const handleOnSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setProcessingReport(true);


		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		try {
			const response = await fetch(`/api/listings/${fetchedData.id}/report`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(data)
			})

			const responseData = await response.json();

			if (response.ok)
				toast.success(t(`error:${responseData.message}`))
			else {
				if (responseData.details) {
					const details: Record<string, string[]> = responseData.details as Record<string, string[]>;

					for (const [key, value] of Object.entries(details)) {
						for (let i = 0; i < value.length; i++)
							toast.error(t(`error:${value[i]}`));
					}
				}
			}
		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`));
		} finally {
			setProcessingReport(false);
			refPopUpReport.current?.close();
		}
	}

	const submitModAction = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setProcessingModAction(true);


		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		try {
			const response = await fetch(`/api/moderator/listings/${fetchedData.id}/action`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(data)
			})

			const responseData = await response.json();

			if (response.ok)
				toast.success(t(`error:${responseData.message}`))
			else {
				if (responseData.details) {
					const details: Record<string, string[]> = responseData.details as Record<string, string[]>;

					for (const [key, value] of Object.entries(details)) {
						for (let i = 0; i < value.length; i++)
							toast.error(t(`error:${value[i]}`));
					}
				}
			}
		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`));
		} finally {
			setProcessingModAction(false);
			refPopUpModAction.current?.close();
		}
	}

	return (
		<div
			className="flex flex-col items-center justify-start
		w-full h-full"
		>
			<ListingsHeader
				postMenuContent={[
					{
						icon: "",
						title: (userData?.role === "MODERATOR" && fetchedData.isReported === true ? t("section.actionButton.popup.modAction.title") : "IGNORE"),
						func: () => {
							setArePopUpModActionOpen(true);
						},
						color: "var(--color-blue-500)"
					},
					{
						icon: "",
						title: t("section.actionButton.popup.report.title"),
						func: () => {
							if (isConnected !== null && isConnected === false)
								navigate("/sign-in");
							setArePopUpReportOpen(true);
						}
					}
				]}
				fetchedData={fetchedData}
				t={t}
			/>
			<ListingsFeaturesAndEquipment
				fetchedData={fetchedData}
				setFetchedData={setFetchedData}
				t={t}
			/>
			<div
				className="flex flex-col items-start justify-center
			gap-1
			w-full
			my-4"

			>
				<Animate
					delay="1200ms"
					direction="bottom"
				>
					<div
						className="font-bold text-2xl"
					>
						{t("section.stats.title")}
					</div>
				</Animate>
			</div>

			<Animate
				delay="1300ms"
				direction="bottom"
				customStyle={{
					width: "100%"
				}}
			>
				<div
					className="flex flex-wrap gap-3
				w-full"
				>
					{
						sellerStats.map((value: string, index: number) => {
							type FeatureKey = keyof ListingsData["sellerStats"];

							const getValue = (
								features: ListingsData["sellerStats"],
								key: FeatureKey
							) => (features[key]);
							return (
								<SellerStats
									key={index}
									title={t(`section.stats.sellerStats.${value}`)}
									value={getValue(fetchedData.sellerStats, value as keyof ListingsData["sellerStats"])}
								/>
							);
						})
					}
				</div>
			</Animate>

			{
				arePopUpReportOpen && <PopUp
					title={t("section.actionButton.popup.report.popup.title")}
					onClose={() => setArePopUpReportOpen(false)}
					ref={refPopUpReport}
				>
					<div>
						{t("section.actionButton.popup.report.popup.warning")}
					</div>

					<form
						className="flex flex-col items-center justify-center
					gap-3
					w-full"
						onSubmit={handleOnSubmitReport}
					>
						<InputEnum
							title={t("section.actionButton.popup.report.popup.reason.title")}
							name="reason"
							dataEnum={[
								{ value: "fraud", title: t("section.actionButton.popup.report.popup.reason.fraud") },
								{ value: "spam", title: t("section.actionButton.popup.report.popup.reason.spam") },
								{ value: "incorrect_info", title: t("section.actionButton.popup.report.popup.reason.incorrect_info") },
								{ value: "inappropriate", title: t("section.actionButton.popup.report.popup.reason.inappropriate") }
							]}
						/>
						<TextArea
							ref={refToComment}
							title={t("section.actionButton.popup.report.popup.comment.title")}
							name="comment"
							placeholder={t("section.actionButton.popup.report.popup.comment.placeholder")}
							minLength={50}
							maxLength={500}
							rows={3}
						/>
						<div
							className="grid grid-cols-2 grid-rows-1 gap-3
						w-full"
						>
							<ActionButton
								title={t("common:cancel")}
								onClick={() => refPopUpReport.current?.close()}
							/>
							<ActionButton
								title={t("section.actionButton.popup.report.popup.submit")}
								type="submit"
								base_color="var(--color-accent)"
								processing_action={processingReport}
							/>
						</div>
					</form>
				</PopUp>
			}

			{
				arePopUpModActionOpen && <PopUp
					title={t("section.actionButton.popup.modAction.popup.title")}
					onClose={() => setArePopUpModActionOpen(false)}
					ref={refPopUpModAction}
				>
					<form
						className="flex flex-col items-center justify-center
					gap-3
					w-full"
						onSubmit={submitModAction}>
						<InputEnum
							title={t("section.actionButton.popup.modAction.popup.reason.title")}
							name="action"
							dataEnum={[
								{ value: "block_temporary", title: t("section.actionButton.popup.modAction.popup.action.block_temporary") },
								{ value: "archive_permanent", title: t("section.actionButton.popup.modAction.popup.action.archive_permanent") },
								{ value: "request_clarification", title: t("section.actionButton.popup.modAction.popup.action.request_clarification") },
								{ value: "reject_reports", title: t("section.actionButton.popup.modAction.popup.action.reject_reports") }
							]}
						/>
						<TextArea
							ref={refToReason}
							title={t("section.actionButton.popup.modAction.popup.reason.title")}
							name="reason"
							placeholder={t("section.actionButton.popup.modAction.popup.reason.placeholder")}
							minLength={50}
							maxLength={2000}
							rows={3}
						/>
						<TextArea
							ref={refToMessageToSeller}
							title={t("section.actionButton.popup.modAction.popup.messageToSeller.title")}
							name="messageToSeller"
							placeholder={t("section.actionButton.popup.modAction.popup.messageToSeller.placeholder")}
							minLength={50}
							maxLength={2000}
							rows={3}
						/>
						<TextArea
							ref={refToInternalNote}
							title={t("section.actionButton.popup.modAction.popup.internalNote.title")}
							name="internalNote"
							placeholder={t("section.actionButton.popup.modAction.popup.internalNote.placeholder")}
							minLength={50}
							maxLength={2000}
							rows={3}
						/>
						<div
							className="grid grid-cols-2 grid-rows-1 gap-3
						w-full"
						>
							<ActionButton
								title={t("common:cancel")}
								onClick={() => refPopUpModAction.current?.close()}
							/>
							<ActionButton
								title={t("section.actionButton.popup.modAction.popup.submit")}
								type="submit"
								base_color="var(--color-accent)"
								processing_action={processingModAction}
							/>
						</div>
					</form>
				</PopUp>
			}

			<div className="w-full h-10 flex-none"></div>
		</div>
	)
}

export default ClientListingsView;