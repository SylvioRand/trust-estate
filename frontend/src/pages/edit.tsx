import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { VerifyUsersState } from "../hooks/VerifyUsersState";
import useDataProvider from "../provider/useDataProvider"
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { useTranslation } from "react-i18next";
import SimpleInput from "../components/Input";
import TextArea from "../components/TextArea";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { InputEnumData } from "../components/InputEnum";
import { toast } from "react-toastify";
import { ZONE_ENUM } from "../dataModel/dataZone";
import InputEnum from "../components/InputEnum";
import { type ListingsData, type ListingsTags } from "../dataModel/modelListings";
import type { APIResponse } from "./sign_up";
import { TagsComponents } from "../components/TagsComponents";
import PopUp, { type PopUpAPI } from "../components/PopUp";

const EditPage: React.FC = () => {
	const { isConnected } = useDataProvider();
	const { t } = useTranslation(["edit", "error", "common"]);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const listingID = searchParams.get("id");
	const refToDescription: RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement | null>(null);
	const [errorTitle, setErrorTitle] = useState<string[]>([]);
	const [errorPrice, setErrorPrice] = useState<string[]>([]);
	const [errorArea, setErrorArea] = useState<string[]>([]);
	const [errorBedrooms, setErrorBedrooms] = useState<string[]>([]);
	const [errorBathrooms, setErrorBathrooms] = useState<string[]>([]);
	const [uploadButtonProcessing, setUploadButtonProcessing] = useState<boolean>(false);
	const [isUploadDisabled, setIsUploadDisabled] = useState<boolean>(false);
	const [editCounter, setEditCounter] = useState<number>(0);
	const [propertyType, setPropertyType] = useState<string>("apartment");
	const [processingDescriptionEnhancement, setProcessingDescriptionEnhancement] = useState<boolean>(false);
	const formRef: RefObject<HTMLFormElement | null> = useRef<HTMLFormElement | null>(null);

	const [activeTags, setActiveTags] = useState<ListingsTags[]>([]);
	const [openPopupAddTags, setOpenPopupAddTags] = useState<boolean>(false);
	const addTagsPopupRef = useRef<PopUpAPI>(null);

	const InputEnumDataBoolean: InputEnumData[] = [
		{ value: "true", title: t("common:true") },
		{ value: "false", title: t("common:false") }
	]

	VerifyUsersState();

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (uploadButtonProcessing || editCounter > 0)
			return;
		setUploadButtonProcessing(true);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		const dataObj = {
			"type": data.type as ("sale" | "rent"),
			"propertyType": data.propertyType as ("apartment" | "house" | "loft" | "land" | "commercial"),
			"title": (data.title as string).trim(),
			"description": (data.description as string).trim(),
			"price": Number(data.price) as number,
			"surface": Number(data.surface) as number,
			"zone": data.zone as string,
			"features": {
				"bedrooms": Number(data.bedrooms || 0) as number,
				"bathrooms": Number(data.bathrooms || 0) as number,
				"wc": data.wc === "true",
				"wc_separate": data.wc_separate === "true",
				"parking_type": data.parking_type as ("garage" | "box" | "parking" | "none"),
				"garden_private": data.garden_private === "true",
				"pool": data.pool === "true",
				"water_access": data.water_access === "true",
				"electricity_access": data.electricity_access === "true"
			},
			"tags": activeTags
		}

		if (['apartment', 'house', 'loft'].includes(dataObj.propertyType)) {
			if (dataObj.features.bedrooms <= 0) {
				toast.error(t("error:validation.listing.bedroom.at_least_one"));
				setUploadButtonProcessing(false);
				return;
			}
			if (dataObj.features.bathrooms <= 0) {
				toast.error(t("error:validation.listing.bathroom.at_least_one"));
				setUploadButtonProcessing(false);
				return;
			}
		}

		try {
			const response = await fetch(`/api/listings/${listingID}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(dataObj)
			})

			const responseData = await response.json();

			if (response.ok) {
				toast.success(t(`error:listing.change_saved`));
				setEditCounter(1);
				navigate(`/property/listings?id=${listingID}`);
			}
			else {
				if (responseData.details) {
					const details: Record<string, string[]> = responseData.details as Record<string, string[]>;

					for (const [key, value] of Object.entries(details)) {
						for (let i = 0; i < value.length; i++)
							toast.error(t(`error:${value[i]}`));
					}
				}
				throw new Error(responseData.message);
			}
		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`))
		} finally {
			setUploadButtonProcessing(false);
		}
	}

	function AddTagsButton({ tags = "urgent", title = "Title" }: { tags: ListingsTags, title: string }) {
		const [hovered, setHovered] = useState<boolean>(false);

		return (
			<button
				className="transition-colors duration-300
					flex items-center justify-start
					rounded-md
					w-full
					cursor-pointer
					p-2"
				type="button"
				onPointerEnter={() => setHovered(true)}
				onPointerLeave={() => setHovered(false)}
				style={{
					backgroundColor: hovered ? "var(--color-midtone)" : "transparent"
				}}
				onClick={() => {
					if (!activeTags.find((value: ListingsTags) => value === tags, tags)) {
						const newValue: ListingsTags[] = activeTags;

						newValue.push(tags);
						setActiveTags(newValue);
					}
					addTagsPopupRef.current?.close() // request a close call
				}}
			>
				{title}
			</button>
		);
	}

	const enhanceDescription = async () => {
		if (refToDescription.current) {
			// NOTE: We need at least 200 characters in the description to give a more concise information for the LLM
			if (refToDescription.current.value.length < 200) {
				toast.error(t("error:ai.not_enough_data"));
				return;
			}

			setProcessingDescriptionEnhancement(true);
			try {
				const dataToSend = {
					"description": refToDescription.current.value
				}
				const response = await fetch("/api/ai/generate", {
					method: "POST",
					headers: {
						"Content-type": "application/json"
					},
					body: JSON.stringify(dataToSend)
				})

				const responseData = await response.json();

				if (response.ok && responseData.reply !== "")
					refToDescription.current!.value = responseData.reply;
				else
					throw new Error(responseData?.message);
				toast.success(t("error:ai.success_generate"));
			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(t(`error:${error.message}`));
			} finally {
				setProcessingDescriptionEnhancement(false);
			}
		}
	}

	function findByKey(obj: any, targetKey: string): string {
		if (obj === null || typeof obj !== "object")
			return "";
		if (targetKey in obj) {
			return obj[targetKey];
		}

		for (const key in obj) {
			const value = obj[key];

			if (typeof value === "object") {
				const found = findByKey(value, targetKey);
				if (found !== "")
					return (found);
			}
		}

		return "";
	}

	useEffect(() => {
		const fetchListingsData = async () => {
			let responseData: ListingsData | APIResponse | null = null;
			try {
				if (!formRef.current)
					navigate("/home");
				if (listingID === null)
					navigate("/property");

				const response = await fetch(`/api/listings/${listingID}`, {
					method: "GET",
					credentials: "include"
				});

				responseData = await response.json();
				if (response.ok) {
					const dataFromBack = responseData as ListingsData;
					setActiveTags(dataFromBack.tags);
					setPropertyType(dataFromBack.propertyType);

					// NOTE: assign a default value to all the input matching with the current state of the metadata.
					// I still can't use fetchedData since it will be updated in the next render so
					// I just use responseData directly
					if (responseData && formRef.current?.elements) {
						const elements = formRef.current?.elements;

						for (const el of elements) {
							if (
								el instanceof HTMLInputElement
								|| el instanceof HTMLTextAreaElement
								|| el instanceof HTMLSelectElement
							) {
								el.value = findByKey(responseData, el.name);
							}
						}
					}
				}
				else {
					const errorData = responseData as APIResponse;
					throw new Error(errorData.message);
				}
			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(`error:${error.message}`);
				navigate("/property");
			}
		}
		if (listingID === null)
			navigate("/home");
		else if (isConnected === null)
			navigate("/sign-in");
		else
			fetchListingsData();
	}, [])

	useEffect(() => {
		setIsUploadDisabled(processingDescriptionEnhancement || editCounter !== 0);
	}, [processingDescriptionEnhancement, editCounter])

	return (
		<div
			className="flex flex-col items-center justify-start
		px-4 md:px-7 xl:px-64
		overflow-y-scroll
		w-full h-screen"
		>
			<div className="w-full h-20 flex-none"></div>

			<div className="grid grid-cols-[auto_1fr] grid-rows-1
					mb-4
					place-items-center
					w-full"
			>
				<Link
					to={`/property/listings?id=${listingID}`}
				>
					<ActionButton
						icon=""
						title={t("buttons.goBackToListing")}
					/>
				</Link>
				<div
					className="w-full"
				>
					<ContentDivider
						line_color="linear-gradient(to right,var(--color-background) 80%,transparent)"
					/>
				</div>
			</div>

			<form
				ref={formRef}
				onSubmit={handleOnSubmit}
				className="flex flex-col items-center justify-start
			gap-3
			w-full"
			>
				<SimpleInput
					icon="󰗴"
					title={t("form.title.title")}
					pattern=".*\S.*"
					name="title"
					minLength={10}
					maxLength={100}
					placeholder={t("form.title.placeholder")}
					error={errorTitle}
				/>

				<div
					className="relative
						w-full"
				>
					<TextArea
						ref={refToDescription}
						title={t("form.description.title")}
						name="description"
						placeholder={t("form.description.placeholder")}
						minLength={50}
						maxLength={2000}
						rows={5}
					/>
					<div className="absolute -top-1 right-0
								px-2
								rounded-full
								select-none
								flex items-center justify-center gap-2"
					>
						<div className="font-icon text-lg origin-center"
							style={{
								animation: processingDescriptionEnhancement ? "var(--animate-spin)" : "none"
							}}
						>
							{processingDescriptionEnhancement ? "󱥸" : ""}
						</div>
						<button className="font-light text-sm
									transition-colors duration-200
									cursor-pointer
									hover:underline hover:text-accent"
							type="button"
							onClick={enhanceDescription}
						>
							{t("form.description.buttons.enhance")}
						</button>
					</div>
				</div>
				<SimpleInput
					icon=""
					title={t("form.price.title")}
					name="price"
					pattern="\d+"
					type="decimal"
					minLength={6}
					maxLength={24}
					placeholder={t("form.price.placeholder")}
					error={errorPrice}
				/>
				<SimpleInput
					icon="󰳂"
					title={t("form.area.title")}
					name="surface"
					pattern="\d+"
					type="decimal"
					minLength={2}
					maxLength={24}
					placeholder={t("form.area.placeholder")}
					error={errorArea}
				/>

				<InputEnum
					title={t("form.wc.title")}
					name="wc"
					dataEnum={InputEnumDataBoolean}
				/>

				<InputEnum
					title={t("form.zone.title")}
					name="zone"
					dataEnum={ZONE_ENUM}
				/>
				<div className="grid grid-cols-2 grid-rows-2
							gap-x-7 gap-y-3
							w-full"
				>
					{['apartment', 'house', 'loft'].includes(propertyType) && (
						<>
							<SimpleInput
								icon="󰋣"
								title={t("form.bedrooms.title")}
								name="bedrooms"
								pattern="\d+"
								type="decimal"
								minLength={1}
								maxLength={3}
								placeholder={t("form.bedrooms.placeholder")}
								error={errorBedrooms}
								required={true}
							/>

							<SimpleInput
								icon="󱠘"
								title={t("form.bathrooms.title")}
								name="bathrooms"
								pattern="\d+"
								type="decimal"
								minLength={1}
								maxLength={3}
								placeholder={t("form.bathrooms.placeholder")}
								error={errorBathrooms}
								required={true}
							/>
						</>
					)}

					<InputEnum
						title={t("form.propertyType.title")}
						name="propertyType"
						onChange={(val) => setPropertyType(val)}
						defaultValue={propertyType}
						dataEnum={[
							{ value: "apartment", title: t("form.propertyType.apartment") },
							{ value: "house", title: t("form.propertyType.house") },
							{ value: "loft", title: t("form.propertyType.loft") },
							{ value: "land", title: t("form.propertyType.land") },
							{ value: "commercial", title: t("form.propertyType.commercial") }
						]}
					/>

					<InputEnum
						title={t("form.type.title")}
						name="type"
						dataEnum={[
							{ value: "sale", title: t("form.type.sale") },
							{ value: "rent", title: t("form.type.rent") }
						]}
					/>

					<InputEnum
						title={t("form.wc_separate.title")}
						name="wc_separate"
						dataEnum={InputEnumDataBoolean}
					/>

					<InputEnum
						title={t("form.parking_type.title")}
						name="parking_type"
						dataEnum={[
							{ value: "none", title: t("form.parking_type.none.title") },
							{ value: "garage", title: t("form.parking_type.garage.title") },
							{ value: "box", title: t("form.parking_type.box.title") },
							{ value: "parking", title: t("form.parking_type.parking.title") }
						]}
					/>

					<InputEnum
						title={t("form.garden_private.title")}
						name="garden_private"
						dataEnum={InputEnumDataBoolean}
					/>

					<InputEnum
						title={t("form.pool.title")}
						name="pool"
						dataEnum={InputEnumDataBoolean}
					/>

					<InputEnum
						title={t("form.water_access.title")}
						name="water_access"
						dataEnum={InputEnumDataBoolean}
					/>

					<InputEnum
						title={t("form.electricity_access.title")}
						name="electricity_access"
						dataEnum={InputEnumDataBoolean}
					/>
				</div>

				{
					openPopupAddTags && <PopUp
						ref={addTagsPopupRef}
						title={t("tags.add.popup.title")}
						onClose={() => setOpenPopupAddTags(false)}
					>
						<div className="flex flex-col items-start justify-center gap-1
									w-full"
						>
							<AddTagsButton
								tags="urgent"
								title={t("tags.add.popup.value.urgent")}
							/>
							<AddTagsButton
								tags="exclusive"
								title={t("tags.add.popup.value.exclusive")}
							/>
							<AddTagsButton
								tags="discount"
								title={t("tags.add.popup.value.discount")}
							/>
						</div>
					</PopUp>
				}

				<div className="flex flex-col items-start justify-center
							w-full"
				>
					<div className="flex items-center justify-start
								w-full"
					>
						<div className="font-inter font-bold text-[14px]">
							{t("tags.title")}
						</div>
					</div>
					<div className="flex flex-wrap
							place-items-center gap-x-3 gap-y-6
							mt-4
							w-full">
						{
							activeTags && activeTags.length > 0 && activeTags.map((value: ListingsTags, index: number) => {
								return (
									<div
										key={index}
										className="relative"
									>
										<TagsComponents
											tags={value}
										/>
										<button className="absolute -top-3 -right-3
													shadow-standard
													bg-foreground
													w-8 h-8
													rounded-full
													cursor-pointer
													hover:text-red-500
													transition-colors duration-200"
											onClick={() => {
												setActiveTags(activeTags.filter((tags: ListingsTags) => tags !== value));
											}}
											type="button"
										>
											<div className="font-icon text-2xl"
											>
												
											</div>
										</button>
									</div>
								);
							})
						}
						<button className="flex items-center justify-center
									gap-3
									border border-background/25
									rounded-md
									shadow-standard
									select-none
									cursor-pointer
									px-4 py-1"
							onClick={() => setOpenPopupAddTags(true)}
							type="button"
						>
							<div className="font-light text-sm">
								{t("tags.add.title")}
							</div>
							<div className="font-icon text-2xl">
								󰐕
							</div>
						</button>
					</div>
				</div>

				<div
					className="flex items-center justify-end
				mt-4
				w-full"
				>
					<div>
						<ActionButton
							icon="󰆓"
							title={t("buttons.save")}
							type="submit"
							processing_action={uploadButtonProcessing}
							disabled={isUploadDisabled}
						/>
					</div>
				</div>
			</form>

			<div className="w-full h-10 flex-none"></div>
		</div>
	)
}

export default EditPage;