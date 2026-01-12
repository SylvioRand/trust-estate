import React, { useRef, useState } from "react";
import SimpleInput, { PasswordInput } from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BoxSection from "../components/BoxSection";
import TextArea from "../components/TextArea";
import ImageUploader, { type ImageUploaderHandle } from "../components/ImageUploader";
import InputEnum, { type InputEnumData } from "../components/InputEnum";

interface	PicturePreviewerProps {
	src: string;
	refToUploader: React.RefObject<ImageUploaderHandle | null>;
	index: number;
}

const	PicturePreviewer: React.FC<PicturePreviewerProps> = ({
	refToUploader,
	src,
	index = -1
}) => {
	const	[hovered, setHovered] = useState<boolean>(false);

	return (
		<div className="w-30 h-30
			flex items-center justify-center
			relative"
		>
			<img
				className="absolute w-full h-full objet-cover
				rounded-2xl"
				alt="Pictures"
				{ ...src ? { src } : {}}
			/>
			<button className="absolute top-1 right-[0.4rem]
				shadow-standard
				bg-foreground
				w-8 h-8
				rounded-full
				transition-colors duration-200"
				onPointerEnter={ () => setHovered(true) }
				onPointerLeave={ () => setHovered(false) }
				style={{
					color: hovered ? "var(--color-red-500)" : "var(--color-background)"
				}}
				onClick={ () => {
					refToUploader.current?.removeFile(index);
				}}
			>
				<div className="font-icon text-2xl"
				>
					
				</div>
			</button>
		</div>
	)
}

const	PublishPage: React.FC = () => {
	const	{ t } = useTranslation(["publish", "common", "error"]);
	const	[dataToPreview, setDataToPreview] = useState<string[]>([]);
	const	uploaderRef = useRef<ImageUploaderHandle>(null);
	const	[errorTitle, setErrorTitle] = useState<string[]>([]);
	const	[errorPrice, setErrorPrice] = useState<string[]>([]);
	const	[errorArea, setErrorArea] = useState<string[]>([]);
	const	[errorBedrooms, setErrorBedrooms] = useState<string[]>([]);
	const	[errorBathrooms, setErrorBathrooms] = useState<string[]>([]);
	const	[uploadButtonProcessing, setUploadButtonProcessing] = useState<boolean>(false);
	const	[uploadButtonState, setUploadButtonState] = useState<"idle" | "uploadingImages" | "uploadingListing">("idle");
	const	[uploadButtonDisabled, setUploadButtonDisabled] = useState<boolean>(false);
	const	titleUploadButton: string = uploadButtonState === "idle" ? t("section.main.buttons.upload.idleState")
		: (uploadButtonState === "uploadingImages" ? t("section.main.buttons.upload.uploadingImages") : t("section.main.buttons.upload.uploadingListing"));

	const	InputEnumDataBoolean: InputEnumData[] = [
		{ value: "true", title: t("common:true") },
		{ value: "false", title: t("common:false") }
	]

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		console.log(data);
	};

	return (
		<div className="flex flex-col items-center justify-start
			px-4 md:px-7 xl:px-64
			overflow-y-scroll
			w-full h-screen"
		>
			<div className="w-full h-20 flex-none"></div>

			<form
				className="flex flex-col items-center justify-center gap-4
				w-full"
				onSubmit={ handleOnSubmit }
			>
				<SimpleInput
					icon="󰗴"
					title={ t("section.main.form.title.title") }
					name="title"
					minLength={10}
					maxLength={100}
					placeholder={ t("section.main.form.title.placeholder") }
					error={ errorTitle }
				/>

				<TextArea
					title={ t("section.main.form.description.title")}
					name="description"
					placeholder={ t("section.main.form.description.placeholder")}
					minLength={50}
					maxLength={2000}
					rows={5}
				/>

				<SimpleInput
					icon=""
					title={ t("section.main.form.price.title") }
					name="price"
					type="decimal"
					minLength={6}
					maxLength={24}
					placeholder={ t("section.main.form.price.placeholder") }
					error={ errorPrice }
				/>

				<SimpleInput
					icon="󰳂"
					title={ t("section.main.form.area.title") }
					name="area"
					type="decimal"
					minLength={2}
					maxLength={24}
					placeholder={ t("section.main.form.area.placeholder") }
					error={ errorArea }
				/>

				<div className="grid grid-cols-2 grid-rows-2
					gap-x-7 gap-y-3
					w-full"
				>
					<SimpleInput
						icon="󰋣"
						title={ t("section.main.form.bedrooms.title") }
						name="bedrooms"
						type="decimal"
						minLength={1}
						maxLength={3}
						placeholder={ t("section.main.form.bedrooms.placeholder") }
						error={ errorBedrooms }
					/>
					<SimpleInput
						icon="󱠘"
						title={ t("section.main.form.bathrooms.title") }
						name="bathrooms"
						type="decimal"
						minLength={1}
						maxLength={3}
						placeholder={ t("section.main.form.bathrooms.placeholder") }
						error={ errorBathrooms }
					/>

					<InputEnum
						title={ t("section.main.form.zone.title") }
						name="zone"
						dataEnum={ [
							// should fetch those Data or use the shared/zone.json
							{ value: "Analakely", title: "Analakely" },
							{ value: "Ambondrona", title: "Ambondrona" }
						] }
					/>

					<InputEnum
						title={ t("section.main.form.type.title") }
						name="type"
						dataEnum={ [
							{ value: "sale", title: t("section.main.form.type.sale") },
							{ value: "rent", title: t("section.main.form.type.rent") }
						] }
					/>

					<InputEnum
						title={ t("section.main.form.wc_separate.title") }
						name="wc_separate"
						dataEnum={ InputEnumDataBoolean }
					/>

					<InputEnum
						title={ t("section.main.form.parking_type.title") }
						name="parking_type"
						dataEnum={ [
							{ value: "none", title: t("section.main.form.parking_type.none.title") },
							{ value: "garage", title: t("section.main.form.parking_type.garage.title") },
							{ value: "box", title: t("section.main.form.parking_type.box.title") },
							{ value: "parking", title: t("section.main.form.parking_type.parking.title") }
						] }
					/>

					<InputEnum
						title={ t("section.main.form.garden_private.title") }
						name="garden_private"
						dataEnum={ InputEnumDataBoolean }
					/>

					<InputEnum
						title={ t("section.main.form.pool.title") }
						name="pool"
						dataEnum={ InputEnumDataBoolean }
					/>

					<InputEnum
						title={ t("section.main.form.water_access.title") }
						name="water_access"
						dataEnum={ InputEnumDataBoolean }
					/>

					<InputEnum
						title={ t("section.main.form.electricity_access.title") }
						name="electricity_access"
						dataEnum={ InputEnumDataBoolean }
					/>
				</div>

				<div className="w-full my-4">
					<ContentDivider
						line_color="var(--color-background)"
					/>
				</div>

				<div className="grid grid-cols-2 grid-rows-1 gap-3
					place-items-center
					w-full"
				>
					<ImageUploader
						ref={ uploaderRef }
						dataToPreview={ dataToPreview }
						setDataToPreview={ setDataToPreview }
					/>

					<div className="w-full">
						<ActionButton
							icon=""
							icon_place="right"
							title={ titleUploadButton }
							processing_action={ uploadButtonProcessing }
							disabled={ uploadButtonDisabled }
							type="submit"
						/>
					</div>
				</div>

				<div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] grid-rows-1
					mt-4
					place-items-center gap-x-3 gap-y-6
					w-full"
				>
					{
						dataToPreview && dataToPreview.map((value: string, index: number) => {
							return (
								<PicturePreviewer
									key={ index }
									index={ index }
									src={ value }
									refToUploader={ uploaderRef }
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
							onClick={ () => uploaderRef.current?.resetFiles() }
						>
								<div className="font-icon text-4xl">
									
								</div>
								<div className="font-light text-sm">
									{ t("section.main.buttons.pictures.clear") }
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
