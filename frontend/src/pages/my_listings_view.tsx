import { CreateDateForPost } from "../utils/Format";
import type { ListingsViewProps } from "./client_listings_view";
import type { TFunction } from "i18next";
import type { ListingsData } from "../dataModel/modelListings";
import ActionButton from "../components/ActionButton";
import { useNavigate } from "react-router-dom";
import ActionsMenu, { type ActionsMenuContent } from "../components/ActionsMenu";
import type { PopUpAPI } from "../components/PopUp";
import { useRef, useState, type RefObject } from "react";
import PopUp from "../components/PopUp";
import { toast } from "react-toastify";
import Animate from "../components/Animate";

interface ListingsHeaderProps {
	postMenuContent: ActionsMenuContent[];
	fetchedData: ListingsData;
	t: TFunction<["listings", "error", "common"]>
}
export const ListingsHeader: React.FC<ListingsHeaderProps> = ({
	postMenuContent,
	fetchedData,
	t
}) => {
	const formatter = new Intl.NumberFormat("de-DE");
	const navigate = useNavigate();

	const colorStatus: Record<"active" | "archived" | "blocked", string> = {
		active: "var(--color-green-500)",
		archived: "var(--color-gray-500)",
		blocked: "var(--color-red-500)"
	};

	return (
		<div
			className="flex flex-col items-center justify-center
		w-full"
		>
			<div
				className="flex flex-col items-start justify-center
			gap-1
			w-full
			mt-4"

			>
				<Animate
					delay="100ms"
					direction="bottom"
					customStyle={{
						width: "100%"
					}}
				>
					<div
						className="grid grid-cols-[70%_auto] grid-rows-1
					place-items-center
					wrap-break-word
					w-full"
					>
						<div
							className="font-higuen font-bold text-4xl
							justify-self-start
							wrap-break-word w-full"
						>
							{fetchedData.title}
						</div>
						<div
							className="justify-self-end mb-auto"
						>
							<ActionsMenu
								menu_content={postMenuContent}
							/>
						</div>
					</div>
				</Animate>

				<Animate
					delay="200ms"
					direction="bottom"
				>
					<div
						className="flex items-center justify-center gap-1"
					>
						<div className="font-icon"></div><div>{`${t(`section.header.propertyType.${fetchedData.propertyType}`)}, ${fetchedData.zone}`}</div>
					</div>
				</Animate>
				<div
					className="flex items-center justify-center gap-1
				mb-4"
				>
				</div>

				<Animate
					delay="300ms"
					direction="bottom"
				>
					<div
						className="font-light wrap-anywhere w-full"
					>
						{fetchedData.description}
					</div>
				</Animate>

				<Animate
					delay="400ms"
					direction="bottom"
					customStyle={{
						width: "100%"
					}}
				>
					<div
						className="grid grid-cols-[1fr_auto] grid-rows-1 gap-3
					place-items-center
					mt-2
					w-full"
					>
						<div
							className="font-light
						justify-self-start"
						>
							{`${t("section.post.publicationDate")} ${CreateDateForPost(fetchedData.createdAt)}`}
						</div>

						{
							fetchedData.mine === true &&
							<div
								style={{
									border: `solid 1px ${colorStatus[fetchedData.status]}`,
									color: colorStatus[fetchedData.status],
									borderRadius: "100px",
									textShadow: `0px 0px 4px color-mix(in srgb, ${colorStatus[fetchedData.status]} 50%, transparent)`,
									padding: "2px 8px"
								}}>
								{t(`status.${fetchedData.status}`)}
							</div>
						}

						{
							fetchedData.mine === false && fetchedData.status === "active" &&
							<div
								style={{
									border: `solid 1px ${fetchedData.isAvailable ? "var(--color-green-500)" : "var(--color-red-500)"}`,
									color: fetchedData.isAvailable ? "var(--color-green-500)" : "var(--color-red-500)",
									borderRadius: "100px",
									textShadow: `0px 0px 4px color-mix(in srgb, ${fetchedData.isAvailable ? "var(--color-green-500)" : "var(--color-red-500)"} 50%, transparent)`,
									padding: "2px 8px"
								}}>
								{t(`status.${fetchedData.isAvailable === true ? "available" : "unavailable"}`)}
							</div>
						}

						{
							fetchedData.mine === false && fetchedData.status !== "active" &&
							<div
								style={{
									border: `solid 1px ${colorStatus[fetchedData.status]}`,
									color: colorStatus[fetchedData.status],
									borderRadius: "100px",
									textShadow: `0px 0px 4px color-mix(in srgb, ${colorStatus[fetchedData.status]} 50%, transparent)`,
									padding: "2px 8px"
								}}>
								{t(`status.${fetchedData.status}`)}
							</div>
						}
					</div>
				</Animate>
				{
					fetchedData.updatedAt &&
					<Animate
						delay="500ms"
						direction="bottom"
					>
						<div
							className="font-light"
						>
							{`${t("section.post.updateDate")} ${CreateDateForPost(fetchedData.updatedAt)}`}
						</div>
					</Animate>
				}
			</div>
			<Animate
				delay="600ms"
				direction="bottom"
				customStyle={{
					width: "100%"
				}}
			>
				<div
					className="grid grid-cols-[auto_1fr] grid-rows-1
				place-items-center
				font-bold text-xl
				mt-7
				gap-3
				w-full"
				>
					<ActionButton
						title={t(`section.quickButtons.${fetchedData.mine === true ? "visitSlot" : "scheduleVisit"}`)}
						onClick={() => {
							navigate(`/property/listings/${fetchedData.mine === true ? "seller" : "buyer"}-slots?id=${fetchedData.id}`)
						}}
						disabled={!fetchedData.isAvailable || fetchedData.status !== "active"}
					/>
					<div
						className="flex flex-col items-start justify-center
					justify-self-start"
					>
						<div>
							{`${formatter.format(fetchedData.price)} Ar`}
						</div>
						{
							fetchedData.type === "rent" &&
							<div
								className="font-light text-sm"
							>
								{`${" / " + t("common:month")}`}
							</div>
						}
					</div>
				</div>
			</Animate>
		</div>
	);
}
type FeaturesType = {
	value: string;
	icon: string;
}

interface EquipmentStatsProps {
	value: string;
	icon: string;
	t: TFunction<["property", "error", "common"]>;
}

const EquipmentStats: React.FC<EquipmentStatsProps> = ({
	value = "Value",
	icon = "X",
	t
}) => {
	return (
		<div
			className="grid grid-cols-[auto_1fr] grid-rows-1
		p-2
		rounded-xl
		shadow-standard
		select-none
		gap-3
		place-items-center"
		>
			<div
				className="flex items-center justify-center
			w-12 h-12"
			>
				<div
					className="font-icon text-4xl text-accent
				text-shadow-[0px_0px_7px_color-mix(in_srgb,black_20%,transparent)]"
				>
					{icon}
				</div>
			</div>

			<div
				className="font-light justify-self-start mr-4">
				{t(`section.equipments.${value}`)}
			</div>
		</div>
	);
}

interface FeaturesStatsProps {
	data: string;
	value: any;
	icon: string;
	namespace: string;
	t: TFunction<["property", "error", "common"]>;
}

export const FeaturesStats: React.FC<FeaturesStatsProps> = ({
	data = "data",
	value = "Value",
	namespace = "features",
	icon = "X",
	t
}) => {
	return (
		<div
			className="grid grid-cols-[auto_auto_1fr] grid-rows-1 gap-2
		p-1
		place-items-center
		bg-background
		rounded-xl
		shadow-standard
		select-none
		text-foreground"
		>
			<div
				className="flex items-center justify-center
			rounded-lg
			w-12 h-12
			flex-none
			bg-accent"
			>
				<div
					className="font-icon text-4xl
				text-shadow-[0px_0px_5px_color-mix(in_srgb,var(--color-background)_25%,transparent)]"
				>
					{icon}
				</div>
			</div>
			<div
				className="font-bold text-xl"
			>
				{value}
			</div>
			<div
				className="font-light justify-self-start mr-2">
				{t(`section.${namespace}.${data}`)}
			</div>
		</div>
	);
}

interface ListingsInfoProps {
	icon: string;
	icon_color?: string;
	title: string;
	info: string;
}

const ListingsInfo: React.FC<ListingsInfoProps> = ({
	icon = "X",
	icon_color = "var(--color-backgrond)",
	title = "Title",
	info = "Info"
}) => {
	return (
		<div
			className="grid grid-cols-[auto_1fr] grid-rows-1
		gap-3
		place-items-center
		truncate
		w-full"
		>
			<div
				className="flex items-center justify-center
			select-none
			bg-background
			rounded-xl
			shadow-standard
			w-12 h-12"
			>
				<div
					className="font-icon text-4xl"
					style={{
						color: icon_color,
						textShadow: `0px 0px 6px color-mix(in srgb, ${icon_color} 25%, transparent)`
					}}>
					{icon}
				</div>
			</div>
			<div
				className="grid grid-cols-1 grid-rows-2
			place-items-start
			w-full h-full"
			>
				<div
					className="font-bold">
					{title}
				</div>
				<div
					className="font-light">
					{info}
				</div>
			</div>
		</div>
	);
}

export const ListingsFeaturesAndEquipment: React.FC<ListingsViewProps> = ({
	fetchedData,
	t
}) => {
	const dataEquipments: FeaturesType[] = [
		{ value: "wc", icon: "" },
		{ value: "parking_type", icon: "" },
		{ value: "garden_private", icon: "󰉊" },
		{ value: "pool", icon: "󰘆" }
	]

	const dataFeatures: FeaturesType[] = [
		{ value: "bedrooms", icon: "󰋣" },
		{ value: "bathrooms", icon: "" }
	]

	return (
		<div
			className="flex flex-col items-center justify-center
		gap-3
		w-full"
		>
			<div
				className="flex flex-col items-start justify-center
			gap-1
			w-full
			mt-4"

			>
				<Animate
					delay="700ms"
					direction="bottom"
				>
					<div
						className="font-bold text-2xl"
					>
						{t("section.features.title")}
					</div>
				</Animate>
			</div>

			<Animate
				delay="800ms"
				direction="bottom"
				customStyle={{
					width: "100%"
				}}
			>
				<div
					className="flex flex-wrap
				gap-3
				w-full"
				>
					<FeaturesStats
						data="area"
						namespace="features"
						icon="󰳂"
						value={fetchedData.surface}
						t={t}
					/>

					{
						dataFeatures.map((value: FeaturesType, index: number) => {
							type FeatureKey = keyof ListingsData["features"];

							const getValue = (
								features: ListingsData["features"],
								key: FeatureKey
							) => (features[key]);

							return (
								<FeaturesStats
									key={index}
									namespace="features"
									data={value.value}
									icon={value.icon}
									value={getValue(fetchedData.features, value.value as keyof ListingsData["features"])}
									t={t}
								/>
							);
						})
					}
				</div>
			</Animate>


			<div
				className="flex flex-col items-center justify-center
			gap-3
			my-4
			w-full">
				<Animate
					delay="900ms"
					direction="bottom"
					customStyle={{
						width: "100%"
					}}>
					<ListingsInfo
						icon="󰖌"
						icon_color="var(--color-blue-400)"
						title={t("section.equipments.water_access.title")}
						info={t(`section.equipments.water_access.${fetchedData.features.water_access ? "true" : "false"}`)}
					/>
				</Animate>
				<Animate
					delay="1000ms"
					direction="bottom"
					customStyle={{
						width: "100%"
					}}>
					<ListingsInfo
						icon="󱐋"
						icon_color="var(--color-yellow-500)"
						title={t("section.equipments.electricity_access.title")}
						info={t(`section.equipments.electricity_access.${fetchedData.features.electricity_access ? "true" : "false"}`)}
					/>
				</Animate>
			</div>

			<div
				className="flex flex-col items-start justify-center
			gap-1
			w-full
			mt-4"

			>
				<Animate
					delay="1100ms"
					direction="bottom"
					customStyle={{
						width: "100%"
					}}>
					<div
						className="font-bold text-2xl"
					>
						{t("section.equipments.title")}
					</div>
				</Animate>
			</div>

			<Animate
				delay="1100ms"
				direction="bottom"
				customStyle={{
					width: "100%"
				}}>
				<div
					className="flex flex-wrap
				gap-3
				w-full"
				>
					{
						dataEquipments.map((value: FeaturesType, index: number) => {
							type FeatureKey = keyof ListingsData["features"];

							const isEquipmentEnabled = (
								features: ListingsData["features"],
								key: FeatureKey
							) => {
								if (features[key] === true)
									return (true);
								if (features[key] === false)
									return (false);
								if (features[key] !== "none")
									return (true);
								return (false);
							};

							if (!isEquipmentEnabled(fetchedData.features, value.value as keyof ListingsData["features"]))
								return (null);

							return (
								<EquipmentStats
									key={index}
									value={value.value}
									icon={value.icon}
									t={t}
								/>
							);
						})
					}
				</div>
			</Animate>
		</div>
	);
}

const MyListingsView: React.FC<ListingsViewProps> = ({
	fetchedData,
	setFetchedData,
	t
}) => {
	const navigate = useNavigate();
	const refPopUpArchive: RefObject<PopUpAPI | null> = useRef<PopUpAPI>(null);
	const [arePopUpArchiveOpen, setArePopUpArchiveOpen] = useState<boolean>(false);
	const [processingArchive, setProcessingArchive] = useState<boolean>(false);

	const refPopUpMarking: RefObject<PopUpAPI | null> = useRef<PopUpAPI>(null);
	const [arePopUpMarkingOpen, setArePopUpMarkingOpen] = useState<boolean>(false);
	const [processingMarking, setProcessingMarking] = useState<boolean>(false);

	const refPopUpUnmarking: RefObject<PopUpAPI | null> = useRef<PopUpAPI>(null);
	const [arePopUpUnmarkingOpen, setArePopUpUnmarkingOpen] = useState<boolean>(false);
	const [processingUnmarking, setProcessingUnmarking] = useState<boolean>(false);

	const postStats: FeaturesType[] = [
		{ value: "views", icon: "󰈈" },
		{ value: "reservations", icon: "󰃭" }
	];

	const buttonAvailabilityModifier: ActionsMenuContent = fetchedData.isAvailable
		? {
			icon: "󰄬",
			title: t(`section.actionButton.popup.mark.${fetchedData.type === "rent" ? "rented" : "sold"}.title`),
			func: () => setArePopUpMarkingOpen(true)
		}
		: (fetchedData.type === "rent"
			? {
				icon: "󰄬",
				title: t(`section.actionButton.popup.unmark.title`),
				func: () => setArePopUpUnmarkingOpen(true)
			}
			: {
				icon: "",
				title: "IGNORE",
				func: () => { }
			})

	return (
		<div
			className="flex flex-col items-center justify-start
		w-full h-full"
		>
			<ListingsHeader
				postMenuContent={[
					{
						icon: "",
						title: t("section.actionButton.popup.edit.title"),
						func: () => navigate(`/property/listings/edit?id=${fetchedData.id}`)
					},
					fetchedData.status === "active" || fetchedData.type === "rent" ? buttonAvailabilityModifier : { title: "IGNORE", func: () => { } },
					{
						color: "var(--color-red-500)",
						icon: fetchedData.status === "active" ? "󰀼" : "",
						title: fetchedData.status === "active" ? t("section.actionButton.popup.archive.title") : "IGNORE",
						func: () => setArePopUpArchiveOpen(true)
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
						{t("section.postStats.title")}
					</div>
				</Animate>

				<Animate
					delay="1300ms"
					direction="bottom"
					customStyle={{
						width: "100%"
					}}
				>
					<div
						className="flex flex-wrap
					mt-2
					gap-3
					w-full"
					>
						{
							postStats.map((value: FeaturesType, index: number) => {
								type FeatureKey = keyof ListingsData["stats"];

								const getValue = (
									features: ListingsData["stats"],
									key: FeatureKey
								) => (features[key]);

								return (
									<FeaturesStats
										key={index}
										namespace="postStats"
										data={value.value}
										icon={value.icon}
										value={getValue(fetchedData.stats, value.value as keyof ListingsData["stats"])}
										t={t}
									/>
								);
							})
						}
					</div>
				</Animate>

				{
					arePopUpArchiveOpen && <PopUp
						title={t("section.actionButton.popup.archive.popup.title")}
						onClose={() => setArePopUpArchiveOpen(false)}
						ref={refPopUpArchive}
					>
						<div>
							{t("section.actionButton.popup.archive.popup.warning")}
						</div>
						<div
							className="grid grid-cols-2 grid-rows-1 gap-3
						w-full">
							<div>
								<ActionButton
									title={t("common:cancel")}
									onClick={() => {
										refPopUpArchive?.current?.close();
									}}
								/>
							</div>
							<div>
								<ActionButton
									base_color="var(--color-red-500)"
									title={t("section.actionButton.popup.archive.popup.continue")}
									processing_action={processingArchive}
									onClick={() => {
										const archiveListings = async () => {
											try {
												setProcessingArchive(true);

												const response = await fetch(`/api/listings/${fetchedData.id}/archive`, {
													method: "POST",
													headers: {
														"Content-Type": "application/json"
													},
													credentials: "include",
													body: JSON.stringify({ action: "archive" })
												})

												const responseData = await response.json();

												if (response.ok) {
													toast.success(t("section.actionButton.popup.archive.popup.success"));
													setFetchedData({
														...fetchedData,
														status: "archived",
														isAvailable: false
													})
												}
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
												setProcessingArchive(false);
												refPopUpArchive?.current?.close();
											}
										}
										archiveListings();
									}}
								/>
							</div>
						</div>
					</PopUp>
				}

				{
					arePopUpMarkingOpen && <PopUp
						title={t(`section.actionButton.popup.mark.popup.${fetchedData.type}.title`)}
						onClose={() => setArePopUpMarkingOpen(false)}
						ref={refPopUpMarking}>
						<div>
							{t(`section.actionButton.popup.mark.popup.${fetchedData.type}.warning`)}
						</div>
						<div
							className="grid grid-cols-2 grid-rows-1 gap-3
						w-full"
						>
							<ActionButton
								title={t("common:cancel")}
								onClick={() => refPopUpMarking.current?.close()}
							/>
							<ActionButton
								title={t(`section.actionButton.popup.mark.popup.${fetchedData.type}.continue`)}
								base_color="var(--color-red-500)"
								onClick={() => {
									const markListing = async () => {
										setProcessingMarking(true);

										try {
											const response = await fetch(`/api/listings/${fetchedData.id}/mark-realized`, {
												method: "PUT",
												credentials: "include"
											})

											const responseData = await response.json();

											if (response.ok) {
												toast.success(t(`error:${responseData.message}`));
												setFetchedData({
													...fetchedData,
													status: "archived",
													isAvailable: false
												});
											}
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
											setProcessingMarking(false);
											refPopUpMarking.current?.close();
										}
									}
									markListing();
								}}
								processing_action={processingMarking}
							/>
						</div>
					</PopUp>
				}

				{
					arePopUpUnmarkingOpen && <PopUp
						title={t("section.actionButton.popup.unmark.popup.title")}
						onClose={() => setArePopUpUnmarkingOpen(false)}
						ref={refPopUpUnmarking}
					>
						<div>
							{t("section.actionButton.popup.unmark.popup.warning")}
						</div>

						<div
							className="grid grid-cols-2 grid-rows-1 gap-3
						w-full"
						>
							<ActionButton
								title={t("common:cancel")}
								onClick={() => refPopUpUnmarking.current?.close()}
							/>
							<ActionButton
								title={t("section.actionButton.popup.unmark.popup.continue")}
								base_color="var(--color-green-500)"
								processing_action={processingUnmarking}
								onClick={() => {
									const unmarkListings = async () => {
										setProcessingUnmarking(true);
										try {
											const response = await fetch(`/api/listings/${fetchedData.id}/make-available`, {
												method: "PUT",
												credentials: "include"
											})

											const responseData = await response.json();
											if (response.ok) {
												toast.success(t(`error:${responseData.message}`))
												setFetchedData({
													...fetchedData,
													status: "active",
													isAvailable: true
												})
											}
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
											setProcessingUnmarking(false);
											refPopUpUnmarking.current?.close();
										}
									}
									unmarkListings();
								}}
							/>
						</div>
					</PopUp>
				}
				<div className="w-full h-10 flex-none"></div>
			</div>
		</div>
	)
}

export default MyListingsView;