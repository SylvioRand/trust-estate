import React, { useEffect, useRef, useState, type RefObject } from "react";
import SimpleInput from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { useTranslation } from "react-i18next";
import TextArea from "../components/TextArea";
import ImageUploader, { type ImageUploaderHandle } from "../components/ImageUploader";
import InputEnum, { type InputEnumData } from "../components/InputEnum";
import type { ListingsTags } from "../dataModel/modelListings";
import { TagsComponents } from "../components/TagsComponents";
import PopUp, { type PopUpAPI } from "../components/PopUp";
import { ZONE_ENUM } from "../dataModel/dataZone";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useDataProvider from "../provider/useDataProvider";

interface PicturePreviewerProps {
	src: string;
	refToUploader: React.RefObject<ImageUploaderHandle | null>;
	index: number;
}

const PicturePreviewer: React.FC<PicturePreviewerProps> = ({
	refToUploader,
	src,
	index = -1
}) => {
	const [hovered, setHovered] = useState<boolean>(false);

	return (
		<div className="w-30 h-30
			flex items-center justify-center
			relative"
		>
			<img
				className="absolute w-full h-full objet-cover
				rounded-2xl"
				alt="Pictures"
				{...src ? { src } : {}}
			/>
			<button className="absolute top-1 right-[0.4rem]
				shadow-standard
				bg-foreground
				w-8 h-8
				rounded-full
				cursor-pointer
				transition-colors duration-200"
				onPointerEnter={() => setHovered(true)}
				onPointerLeave={() => setHovered(false)}
				style={{
					color: hovered ? "var(--color-red-500)" : "var(--color-background)"
				}}
				onClick={() => {
					refToUploader.current?.removeFile(index);
				}}
				type="button"
			>
				<div className="font-icon text-2xl"
				>
					
				</div>
			</button>
		</div>
	)
}

const PublishPage: React.FC = () => {
	const { t } = useTranslation(["publish", "common", "error"]);
	const [dataToPreview, setDataToPreview] = useState<string[]>([]);
	const uploaderRef = useRef<ImageUploaderHandle>(null);
	const [errorTitle, setErrorTitle] = useState<string[]>([]);
	const [errorPrice, setErrorPrice] = useState<string[]>([]);
	const [errorArea, setErrorArea] = useState<string[]>([]);
	const [errorBedrooms, setErrorBedrooms] = useState<string[]>([]);
	const [errorBathrooms, setErrorBathrooms] = useState<string[]>([]);
	const [uploadButtonProcessing, setUploadButtonProcessing] = useState<boolean>(false);
	const [isUploadDisabled, setIsUploadDisabled] = useState<boolean>(false);
	const [publishCounter, setPublishCounter] = useState<number>(0);
	const [propertyType, setPropertyType] = useState<string>("apartment");
	const navigate = useNavigate();

	const [activeTags, setActiveTags] = useState<ListingsTags[]>([]);
	const [openPopupAddTags, setOpenPopupAddTags] = useState<boolean>(false);
	const addTagsPopupRef = useRef<PopUpAPI>(null);

	const InputEnumDataBoolean: InputEnumData[] = [
		{ value: "true", title: t("common:true") },
		{ value: "false", title: t("common:false") }
	]

	const { isConnected } = useDataProvider();

	// Redirect if user is not connected
	useEffect(() => {
		if (isConnected !== null && isConnected === false)
			navigate("/sign-in");
	}, [isConnected])

	type UploadDataType = {
		"type": "sale" | "rent",
		"propertyType": "apartment" | "house" | "loft" | "land" | "commercial",
		"title": string,
		"description": string,
		"price": number,
		"surface": number,
		"zone": string,
		"features": {
			"bedrooms": number,
			"bathrooms": number,
			"wc": boolean,
			"wc_separate": boolean,
			"parking_type": "garage" | "box" | "parking" | "none",
			"garden_private": boolean,
			"pool": boolean,
			"water_access": boolean,
			"electricity_access": boolean
		},
		"tags": ListingsTags[]
	};

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (uploadButtonProcessing || publishCounter > 0)
			return;
		setUploadButtonProcessing(true);

		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		const dataObj: UploadDataType = {
			"type": data.type as ("sale" | "rent"),
			"propertyType": data.propertyType as ("apartment" | "house" | "loft" | "land" | "commercial"),
			"title": (data.title as string).trim(),
			"description": (data.description as string).trim(),
			"price": Number(data.price) as number,
			"surface": Number(data.area) as number,
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

		const uploadFormData = new FormData();

		uploadFormData.append("data", JSON.stringify(dataObj));


		if (inputRef && inputRef.current && inputRef.current.files && inputRef.current?.files?.length > 0) {
			for (let i = 0; i < inputRef.current?.files?.length; i++)
				uploadFormData.append("files", inputRef.current?.files[i]);
		}

		try {
			const response = await fetch("/api/listings/publish", {
				method: "POST",
				body: uploadFormData,
				redirect: "follow",
				credentials: "include"
			})

			const responseData = await response.json();

			if (response.ok) {
				toast.success(t("uploadSuccess"));
				setPublishCounter(1);
				navigate(`/property/listings?id=${responseData?.listingId}`)
			}
			else {
				toast.error(t(`error:${responseData.message ?? "ERROR"}`));
				if (responseData.details) {
					const details: Record<string, string[]> = responseData.details as Record<string, string[]>;

					for (const [key, value] of Object.entries(details)) {
						for (let i = 0; i < value.length; i++)
							toast.error(t(`error:${value[i]}`));
					}
				}
				throw new Error("");
			}

		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`));
		} finally {
			setUploadButtonProcessing(false);
		}
	};

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

	const refToDescription: RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement | null>(null);
	const [processingDescriptionEnhancement, setProcessingDescriptionEnhancement] = useState<boolean>(false);
	const inputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);

	const enhanceDescription = async () => {
		if (refToDescription.current) {
			// NOTE: We need at least 200 characters in the description to give a more concise information for the LLM
			if (refToDescription.current.value.length < 50) {
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

	useEffect(() => {
		setIsUploadDisabled(dataToPreview.length < 3 || processingDescriptionEnhancement || publishCounter !== 0);
	}, [dataToPreview, processingDescriptionEnhancement, publishCounter]);

	return (
		<div className="flex flex-col items-center justify-start
			px-4 md:px-7 xl:px-64
			overflow-y-scroll
			animate-fade-in
			w-full h-screen"
		>
			<div className="w-full h-20 flex-none"></div>

			<div className="grid grid-cols-[auto_1fr] grid-rows-1
				mb-4
				place-items-center
				w-full"
			>
				<Link
					to="/profile"
				>
					<ActionButton
						icon=""
						title={t("buttons.goBackToProfile")}
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
				className="flex flex-col items-center justify-center gap-4
				w-full"
				onSubmit={handleOnSubmit}
			>
				<SimpleInput
					icon="󰗴"
					title={t("section.main.form.title.title")}
					name="title"
					pattern=".*\S.*"
					minLength={10}
					maxLength={100}
					placeholder={t("section.main.form.title.placeholder")}
					error={errorTitle}
					patternError={t("error:validation.listing.title.invalid_pattern")}
				/>

				<div
					className="relative
				w-full"
				>
					<TextArea
						ref={refToDescription}
						title={t("section.main.form.description.title")}
						name="description"
						placeholder={t("section.main.form.description.placeholder")}
						minLength={200}
						maxLength={2000}
						rows={5}
						patternError={t("error:validation.listing.description.invalid_pattern")}
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
							{t("section.main.form.description.buttons.enhance")}
						</button>
					</div>
				</div>

				<SimpleInput
					icon=""
					title={t("section.main.form.price.title")}
					name="price"
					pattern=".*\S.*"
					type="decimal"
					minLength={1}
					maxLength={24}
					placeholder={t("section.main.form.price.placeholder")}
					error={errorPrice}
				/>

				<SimpleInput
					icon="󰳂"
					title={t("section.main.form.area.title")}
					name="area"
					type="decimal"
					pattern=".*\S.*"
					minLength={1}
					maxLength={24}
					placeholder={t("section.main.form.area.placeholder")}
					error={errorArea}
				/>
				<InputEnum
					title={t("section.main.form.wc.title")}
					name="wc"
					dataEnum={InputEnumDataBoolean}
				/>

				<InputEnum
					title={t("section.main.form.zone.title")}
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
								title={t("section.main.form.bedrooms.title")}
								name="bedrooms"
								type="decimal"
								minLength={1}
								pattern=".*\S.*"
								maxLength={3}
								placeholder={t("section.main.form.bedrooms.placeholder")}
								error={errorBedrooms}
								required={true}
							/>

							<SimpleInput
								icon="󱠘"
								title={t("section.main.form.bathrooms.title")}
								name="bathrooms"
								type="decimal"
								pattern=".*\S.*"
								minLength={1}
								maxLength={3}
								placeholder={t("section.main.form.bathrooms.placeholder")}
								error={errorBathrooms}
								required={true}
							/>
						</>
					)}

					<InputEnum
						title={t("section.main.form.propertyType.title")}
						name="propertyType"
						defaultValue={propertyType}
						onChange={(val) => setPropertyType(val)}
						dataEnum={[
							{ value: "apartment", title: t("section.main.form.propertyType.apartment") },
							{ value: "house", title: t("section.main.form.propertyType.house") },
							{ value: "loft", title: t("section.main.form.propertyType.loft") },
							{ value: "land", title: t("section.main.form.propertyType.land") },
							{ value: "commercial", title: t("section.main.form.propertyType.commercial") }
						]}
					/>

					<InputEnum
						title={t("section.main.form.type.title")}
						name="type"
						dataEnum={[
							{ value: "sale", title: t("section.main.form.type.sale") },
							{ value: "rent", title: t("section.main.form.type.rent") }
						]}
					/>

					<InputEnum
						title={t("section.main.form.wc_separate.title")}
						name="wc_separate"
						dataEnum={InputEnumDataBoolean}
					/>

					<InputEnum
						title={t("section.main.form.parking_type.title")}
						name="parking_type"
						dataEnum={[
							{ value: "none", title: t("section.main.form.parking_type.none.title") },
							{ value: "garage", title: t("section.main.form.parking_type.garage.title") },
							{ value: "box", title: t("section.main.form.parking_type.box.title") },
							{ value: "parking", title: t("section.main.form.parking_type.parking.title") }
						]}
					/>

					<InputEnum
						title={t("section.main.form.garden_private.title")}
						name="garden_private"
						dataEnum={InputEnumDataBoolean}
					/>

					<InputEnum
						title={t("section.main.form.pool.title")}
						name="pool"
						dataEnum={InputEnumDataBoolean}
					/>

					<InputEnum
						title={t("section.main.form.water_access.title")}
						name="water_access"
						dataEnum={InputEnumDataBoolean}
					/>

					<InputEnum
						title={t("section.main.form.electricity_access.title")}
						name="electricity_access"
						dataEnum={InputEnumDataBoolean}
					/>
				</div>

				{
					openPopupAddTags && <PopUp
						ref={addTagsPopupRef}
						title={t("section.main.tags.add.popup.title")}
						onClose={() => setOpenPopupAddTags(false)}
					>
						<div className="flex flex-col items-start justify-center gap-1
							w-full"
						>
							<AddTagsButton
								tags="urgent"
								title={t("section.main.tags.add.popup.value.urgent")}
							/>
							<AddTagsButton
								tags="exclusive"
								title={t("section.main.tags.add.popup.value.exclusive")}
							/>
							<AddTagsButton
								tags="discount"
								title={t("section.main.tags.add.popup.value.discount")}
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
							{t("section.main.tags.title")}
						</div>
					</div>
					<div className="flex flex-wrap
					place-items-center gap-x-3 gap-y-6
					w-full">
						{
							activeTags.length > 0 && activeTags.map((value: ListingsTags, index: number) => {
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
								{t("section.main.tags.add.title")}
							</div>
							<div className="font-icon text-2xl">
								󰐕
							</div>
						</button>
					</div>
				</div>

				<div className="w-full my-4">
					<ContentDivider
						line_color="var(--color-background)"
					/>
				</div>

				<div
					className="font-light mr-auto text-sm"
				>
					{t("section.main.notice.minimumPicture")}
				</div>

				<div className="grid grid-cols-2 grid-rows-1 gap-3
					place-items-center
					w-full"
				>
					<ImageUploader
						inputRef={inputRef}
						ref={uploaderRef}
						dataToPreview={dataToPreview}
						setDataToPreview={setDataToPreview}
					/>

					<div className="w-full">
						<ActionButton
							icon=""
							icon_place="right"
							title={uploadButtonProcessing ? t("section.main.buttons.upload.processing") : t("section.main.buttons.upload.title")}
							processing_action={uploadButtonProcessing}
							disabled={isUploadDisabled}
							type="submit"
						/>
					</div>
				</div>

				<div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] grid-rows-1
					mt-4
					place-items-center gap-x-3 gap-y-6
					w-full"
				>
					{
						dataToPreview && dataToPreview.map((value: string, index: number) => {
							return (
								<PicturePreviewer
									key={index}
									index={index}
									src={value}
									refToUploader={uploaderRef}
								/>
							)
						})
					}

					{
						dataToPreview.length > 0 && <button className="flex flex-col items-center justify-center
							border border-background/25
							shadow-standard
							rounded-2xl
							w-30 h-30"
							onClick={() => uploaderRef.current?.resetFiles()}
						>
							<div className="font-icon text-4xl">
								
							</div>
							<div className="font-light text-sm">
								{t("section.main.buttons.pictures.clear")}
							</div>
						</button>
					}
				</div>

				<div className="w-full h-10 flex-none"></div>
			</form>
		</div>
	);
}

export default PublishPage;
