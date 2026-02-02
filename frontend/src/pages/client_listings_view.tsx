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

export interface	ListingsViewProps {
	fetchedData: ListingsData;
	setFetchedData: Dispatch<SetStateAction<ListingsData | null>>;
	t: TFunction<["listings", "error", "common"]>;
}

interface	SellerStatsProps {
	title: string;
	value: any;
}

const	SellerStats: React.FC<SellerStatsProps> = ({
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
				{ value }
			</div>
			<div
			className="font-light"
			>
				{ title }
			</div>
		</div>
	);
}

const	ClientListingsView: React.FC<ListingsViewProps> = ({
	fetchedData,
	setFetchedData,
	t
}) => {
	const	{ isConnected } = useDataProvider();
	const	navigate = useNavigate();
	const	refToComment: RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement>(null);
	const	refPopUpReport: RefObject<PopUpAPI | null> = useRef<PopUpAPI>(null);
	const	[arePopUpReportOpen, setArePopUpReportOpen] = useState<boolean>(false);
	const	[processingReport, setProcessingReport] = useState<boolean>(false);
	const	sellerStats: string[] = [
		"successfulSales",
		"successfulRent",
		"averageRating",
	];

	const	handleOnSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setProcessingReport(true);


		const	formData = new FormData(e.currentTarget);
		const	data = Object.fromEntries(formData.entries());
		
		try {
			const	response = await fetch(`/api/listings/${fetchedData.id}/report`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(data)
			})

			const	responseData = await response.json();

			if (response.ok)
				toast.success(t(`error:${responseData.message}`))
			else
			{
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

	return (
		<div
		className="flex flex-col items-center justify-start
		w-full h-full"
		>
			<ListingsHeader
			postMenuContent={[
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
			fetchedData={ fetchedData }
			t={ t }
			/>
			<ListingsFeaturesAndEquipment
			fetchedData={ fetchedData }
			setFetchedData={ setFetchedData }
			t={ t }
			/>
			<div
			className="flex flex-col items-start justify-center
			gap-1
			w-full
			my-4"
			
			>
				<div
				className="font-bold text-2xl"
				>
					{ t("section.stats.title") }
				</div>
			</div>
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
							key={ index }
							title={ t(`section.stats.sellerStats.${value}`) }
							value={ getValue(fetchedData.sellerStats, value as keyof ListingsData["sellerStats"]) }
							/>
						);
					})
				}
			</div>

			{
				arePopUpReportOpen && <PopUp
				title={ t("section.actionButton.popup.report.popup.title") }
				onClose={ () => setArePopUpReportOpen(false) }
				ref={ refPopUpReport }
				>
					<div>
						{ t("section.actionButton.popup.report.popup.warning") }
					</div>

					<form
					className="flex flex-col items-center justify-center
					gap-3
					w-full"
					onSubmit={ handleOnSubmitReport }
					>
						<InputEnum
						title={ t("section.actionButton.popup.report.popup.reason.title") }
						name="reason"
						dataEnum={[
							{ value: "fraud", title: t("section.actionButton.popup.report.popup.reason.fraud") },
							{ value: "spam", title: t("section.actionButton.popup.report.popup.reason.spam") },
							{ value: "incorrect_info", title: t("section.actionButton.popup.report.popup.reason.incorrect_info") },
							{ value: "inappropriate", title: t("section.actionButton.popup.report.popup.reason.inappropriate") }
						]}
						/>
						<TextArea
						ref={ refToComment }
						title={t("section.actionButton.popup.report.popup.comment.title")}
						name="comment"
						placeholder={t("section.actionButton.popup.report.popup.comment.placeholder")}
						minLength={50}
						maxLength={2000}
						rows={3}
						/>
						<div
						className="grid grid-cols-2 grid-rows-1 gap-3
						w-full"
						>
							<ActionButton
							title={ t("common:cancel") }
							onClick={ () => refPopUpReport.current?.close() }
							/>
							<ActionButton
							title={ t("section.actionButton.popup.report.popup.submit") }
							type="submit"
							base_color="var(--color-accent)"
							processing_action={ processingReport }
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