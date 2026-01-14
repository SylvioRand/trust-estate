import React, { useRef, useState } from "react";
import house0 from "../../src/images/house0.webp";
import house1 from "../../src/images/house1.webp";
import house2 from "../../src/images/house2.webp";
import house3 from "../../src/images/house3.webp";
import { useTranslation, type UseTranslationResponse } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { TFunction } from "i18next";
import ActionButton from "../components/ActionButton";
import ToggleButton from "../components/ToggleButton";
import PhotoViewer from "../components/PhotoViewer";
import { type ListingsTags, type ListingsData, dataExampleListingsData as dataExample } from "../dataModel/modelListings";
import BoxSection from "../components/BoxSection";
import i18n from "../i18n/i18n";
import PopUp, { type PopUpAPI } from "../components/PopUp";
import { CreateDateForMemberSince, CreateDateForPost } from "../utils/Format";

interface	TagsComponentsProps {
	tags: ListingsTags;
}

export const	TagsComponents: React.FC<TagsComponentsProps> = ({
	tags = "urgent"
}) => {
	const	icon: Record<ListingsTags, string> = {
		urgent: "󰈸",
		exclusive: "󱉏",
		discount: ""
	}

	const	color: Record<ListingsTags, string> = {
		urgent: "var(--color-red-600)",
		exclusive: "var(--color-amber-600)",
		discount: "var(--color-blue-600)"
	}

	const	{ t } = useTranslation("listings");

	return (
		<div className="flex items-center justify-center gap-2
			border border-background/25
			backdrop-blur-2xl
			select-none
			rounded-full
			shadow-standard
			text-light-foreground
			flex-none
			px-3"
			style={{
				backgroundColor: `color-mix(in srgb, ${color[tags]} 75%, transparent)`
			}}
		>
			<div className="font-light text-sm"
			>
				{ t(`section.tags.${tags}`) }
			</div>
			<div className="font-icon text-xl text-shadow-md">
				{ icon[tags] }
			</div>
		</div>
	);
}

interface	PicturesLayoutProps {
	data: string[];
	translationSingleton: TFunction<"listings">;
}

const	PicturesLayoutDesktopAndTablet: React.FC<PicturesLayoutProps> = ({
	data = [],
	translationSingleton
}) => {
	const	[openPhotoViewer, setOpenPhotoViewer] = useState<boolean>(false);
	const	[photoToOpen, setPhotoToOpen] = useState<number>(0);

	function Img({
		src,
		see_more = false,
		onClick = () => console.error("PicturesLayout: onClick not overrided.")
	} : {
		src: string;
		see_more?: boolean,
		onClick: () => void
	}) {
		const	[hovered, setHovered] = useState<boolean>(false);

		return (
			<div className="w-full h-full
				select-none
				cursor-pointer
				relative"
				onClick={ onClick }
			>
				<img
					className="w-full h-full object-cover
					shadow-xl
					select-none
					cursor-pointer
					transition-transform duration-500"
					src={src}
					alt="House Picture"
					onPointerEnter={ () => setHovered(true) }
					onPointerLeave={ () => setHovered(false) }
					style={{
						transform: hovered ? "scale(110%)" : "none"
					}}
				/>

				<div className="absolute top-0 left-0
					flex items-center justify-center
					pointer-events-none
					w-full h-full
					transition-colors duration-500"
					style={{
						backgroundColor: hovered ? "rgba(0,0,0,0.75)" : "transparent"
					}}
				>
					<div className="font-icon text-light-foreground text-4xl
						transition-opacity duration-500"
						style={{
							opacity: hovered ? "100%" : "0%"
						}}
					>
						
					</div>
				</div>

				{
					see_more &&
					<div className="absolute top-0 left-0
						flex items-center justify-center
						bg-light-background/75
						w-full h-full"
					>
						<div className="font-light text-center text-sm text-light-foreground
								px-4 py-2
								backdrop-blur-2xl
								border border-light-foreground rounded-full">
							{ translationSingleton("section.pictures.buttons.seeMore") }
						</div>
					</div>
				}
			</div>
		);
    }

	return (
		<div className="md:grid grid-cols-1 grid-rows-1 place-items-center
			hidden
			relative
			gap-3
			md:grid-cols-[50%_1fr_1fr] md:grid-rows-2
			overflow-hidden
			flex-none
			w-full h-56 md:h-71 xl:h-120 aspect-video rounded-2xl">
			<div className="w-full h-full
				md:row-start-1 md:row-end-3
				overflow-hidden
				relative
				bg-red-500">
				<Img
					src={ data[0] }
					onClick={ () => {
						setPhotoToOpen(0);
						setOpenPhotoViewer(true);
					}}
				/>

				<div className="absolute top-2 left-2
					flex items-center justify-center gap-2"
				>
					{
						dataExample.tags.length > 0 && dataExample.tags.map((value: ListingsTags, index: number) => {
							return (
								<TagsComponents
									tags={ value }
								/>
							)
						})
					}
				</div>
			</div>

			<div className="hidden md:block
				w-full h-full
				overflow-hidden
				bg-blue-500">
				<Img
					src={ data[1] }
					onClick={ () => {
						setPhotoToOpen(1);
						setOpenPhotoViewer(true);
					}}
				/>
			</div>

			<div className="hidden md:block
				w-full h-full
				overflow-hidden
				bg-green-500">
				<Img
					src={ data[2] }
					onClick={ () => {
						setPhotoToOpen(2);
						setOpenPhotoViewer(true);
					}}
				/>
			</div>

			{
				data.length > 3 && 
				<div className="hidden md:block
					w-full h-full
					overflow-hidden
					bg-green-500">
					<Img
						src={ data[3] }
						onClick={ () => {
							setPhotoToOpen(3);
							setOpenPhotoViewer(true);
						}}
					/>
				</div>
			}

			{
				data.length > 4 &&
				<div className="hidden md:block
					w-full h-full
					overflow-hidden
					bg-green-500">
					<Img
						src={ data[4] }
						see_more={ data.length > 5 }
						onClick={ () => {
							setPhotoToOpen(4);
							setOpenPhotoViewer(true);
						}}
					/>
				</div>
			}

			{ openPhotoViewer &&
				<PhotoViewer
					picture={ data }
					startID={ photoToOpen }
					onClose={ () => {
						setPhotoToOpen(0);
						setOpenPhotoViewer(false);
					}}
				/>
			}

			{
				dataExample.mine === false &&
					<div className="absolute top-2 right-2">
						<ReportButton/>
					</div>
			}

		</div>
	);
}

interface	FeaturesCardProps {
	icon: string;
	value: string;
	title: string;
}

const	FeaturesCard: React.FC<FeaturesCardProps> = ({
	icon = "X",
	value = "0",
	title = "Title"
}) => {
	return (
		<div className="flex flex-col items-center justify-center
			shadow-standard
			rounded-2xl
			border border-background/25
			w-35 h-35"
		>
			<div className="font-icon text-[42px] text-accent
				select-none
				drop-shadow-md"
			>
				{ icon }
			</div>
			<div className="font-bold text-lg">
				{ value }
			</div>
			<div className="font-light text-md mb-2">
				{ title }
			</div>
		</div>
	);
}

const	PicturesLayoutMobile: React.FC<PicturesLayoutProps> = ({
	data = []
}) => {
	const	[displayID, setDisplayID] = useState<number>(0);
	const	[openPhotoViewer, setOpenPhotoViewer] = useState<boolean>(false);
	const	[photoToOpen, setPhotoToOpen] = useState<number>(0);


	return (
		<div className="flex items-center justify-center
			relative
			md:hidden
			flex-none
			w-full h-60"
		>
			{
				data.map((value: string, index: number) => {
					const	active: boolean = index === displayID;

					return (
						<img
							key={ index }
							className="absolute
							shadow-2xl
							transition-transform duration-200
							ease-in-out
							rounded-2xl
							w-full h-full object-cover"
							src={ value }
							alt="House Picture"
							style={{
								transform: `translateX(${ (98) * (index - displayID) }%) scale(${ active ? "100%" : "90%" })`
							}}
							onClick={ () => {
								setOpenPhotoViewer(true)
								setPhotoToOpen(index)
							}}
						/>
					);
				})
			}

			<button className="flex items-center justify-center
				border border-background/25
				bg-foreground/25
				rounded-full
				px-2
				shadow-standard
				backdrop-blur-2xl
				absolute top-1/2 -left-1
				-translate-y-3"
				onClick={ () => setDisplayID(displayID === 0 ? data.length - 1 : displayID - 1 ) }
			>
				<div className="font-icon text-4xl pb-[0.1rem]">
					
				</div>
			</button>

			<button className="flex items-center justify-center
				border border-background/25
				bg-foreground/25
				rounded-full
				px-2
				shadow-standard
				backdrop-blur-2xl
				absolute top-1/2 -right-1
				-translate-y-3"
				onClick={ () => setDisplayID(displayID === data.length - 1 ? 0 : displayID + 1 ) }
			>
				<div className="font-icon text-4xl pb-[0.1rem]">
					
				</div>
			</button>

			{ openPhotoViewer &&
				<PhotoViewer
					picture={ data }
					startID={ photoToOpen }
					onClose={ () => {
						setPhotoToOpen(0);
						setOpenPhotoViewer(false);
					}}
				/>
			}
		</div>
	);
}

const	ReportButton: React.FC = () => {
	const	{ t } = useTranslation("listings");
	const	[hovered, setHovered] = useState<boolean>(false);

	// TODO: Make this button redirect to report page or open select tag
	return (
		<div className="backdrop-blur-2xl
			border border-background/25
			px-3 py-2 md:py-1
			h-auto max-h-12
			rounded-full
			shadow-standard
			cursor-pointer
			font-light text-sm
			flex items-center justify-center gap-2
			bg-foreground/75
			hover:bg-accent/20"
			onPointerEnter={ () => setHovered(true) }
			onPointerLeave={ () => setHovered(false) }
			style={{
				backgroundColor: `color-mix(in srgb, ${ !hovered ? "var(--color-foreground) 75%" : "var(--color-accent) 20%" }, transparent)`
			}}
		>
			<div className="flex items-center justify-center
				w-3 h-3
				relative"
			>
				<div className="font-icon text-xl
					absolute
					translate-y-[0.05rem]
					"
				>
					
				</div>
			</div>
			<div className="font-light text-sm">
				{ t("section.quickButtons.report") }
			</div>
		</div>
	);
}

interface	StatsProps {
	title: string;
	value: any;
}

const	Stats: React.FC<StatsProps> = ({
	title = "Title",
	value = "0"
}) => {
	return (
		<div className="flex flex-col items-center justify-center"
		>
			<div className="font-higuen font-bold text-3xl text-accent
				text-shadow-md"
			>
				{ value }
			</div>
			<div className="font-extralight text-sm">
				{ title }
			</div>
		</div>
	);
}

const	ListingsPage: React.FC = () => {
	const	{ t } = useTranslation("listings");
	const	formatter = new Intl.NumberFormat("de-DE");

	const	[searchParams] = useSearchParams();
	const	listingsID = searchParams.get("id"); // retrieve the value of the listings here

	const	pictures: string[] = [
		house2,
		house0,
		house1,
		house2,
		house1,
		house0
	]

	// const	FetchListingsAndDisplay = async () => {
		// const	response = await fetch(`/api/listings/${ listingsID }`, {
		// 	method: "GET"
		// });
	// }

	const	iconFeatures: Record<string, string> = {
		bedrooms: "󰋣",
		bathrooms: "󱠘",
		wc_separate: "󰦫",
		parking_type: "󰄋",
		garden_private: "󰉊",
		water_access: "󰖌",
		electricity_access: ""
	}

	// NOTE: need to fetch first to see if it's favorite or not, or maybe just send it through query
	const	[isFavorite, setIsFavorite] = useState<boolean>(false);


	// NOTE: I invert the value of isAvailable to get the correct UI representation
	const	[openPopupAvailability, setOpenPopupAvailability] = useState<boolean>(false);
	const	availabilityPopupRef = useRef<PopUpAPI>(null);
	const	[isAvailable, setIsAvailable] = useState<boolean>(dataExample.isAvailable);
	const	availabilityActiveSection = 
		(dataExample.type === "sale" ? "markSold"
			: (isAvailable ? "markRented" : "unmarkRented"));

	const	[openPopupArchive, setOpenPopupArchive] = useState<boolean>(false);
	const	archivePopupRef = useRef<PopUpAPI>(null);
	const	[isArchiveDisabled, setIsArchiveDisabled] = useState<boolean>(dataExample.status === "archived" || dataExample.status === "blocked");

	return (
		<div className="flex flex-col items-center justify-start gap-7
			overflow-y-scroll
			overflow-x-hidden
			relative
			pointer-events-auto
			px-4 md:px-7 xl:px-64
			transition-discrete duration-500
			w-full h-screen"
		>
			<div className="w-full h-15 md:h-20
				flex-none"
			>
			</div>


			<PicturesLayoutMobile
				data={ pictures } // NOTE: should send the pictures of the listings here
				translationSingleton={ t }
			/>

			<PicturesLayoutDesktopAndTablet
				data={ pictures } // NOTE: should send the pictures of the listings here
				translationSingleton={ t }
			/>

			<div className="grid grid-cols-1 grid-rows-2 gap-7
				xl:grid-cols-[65%_1fr] xl:grid-rows-1
				w-full"
			>
				<div className="flex flex-col items-center justify-start gap-7">
					<div className="grid grid-cols-[1fr_auto] grid-rows-1
						md:hidden
						gap-3
						w-full"
					>
						<div className="flex items-center justify-start
							gap-2
							flex-none
							overflow-y-scroll
							w-full"
						>
							{
								dataExample.tags.length > 0 && dataExample.tags.map((value: ListingsTags, index: number) => {
									return (
										<TagsComponents
											tags={ value }
										/>
									)
								})
							}
						</div>

						{
							dataExample.mine === false && <ReportButton/>
						}

					</div>

					<div className="grid grid-cols-1 grid-rows-2 gap-4
						md:grid-cols-[1fr_auto] md:grid-rows-1
						w-full"
					>
						<div className="flex flex-col items-start justify-end
							gap-3
							w-full h-full"
						>
							<div className="flex flex-col items-start justify-center w-full">
								<div className="flex items-center justify-center gap-2">
									<div className="font-inter font-bold text-2xl">
										{ dataExample.title }
									</div>
									<div className="rounded-full
										shadow-standard
										px-3 py-1
										select-none
										text-sm
										border border-background/25"
									>
										{ dataExample.type === "sale" ? t("section.listingType.sale") : t("section.listingType.rent") }
									</div>
								</div>
								<div className="flex items-center justify-center gap-1
									font-inter
									text-md
									opacity-80"
								>
									<div className="font-icon"></div>{ dataExample.zone}
								</div>
							</div>

							<div className="font-inter font-bold text-3xl">
								{ formatter.format(dataExample.price) } Ariary
							</div>
						</div>

						<div className="grid grid-cols-1 grid-rows-2
							w-full"
						>
							{
								dataExample.mine === false &&
								<>
									<ToggleButton
										title={ t("section.quickButtons.favorites") }
										icon=""
										icon_toggled="󰋑"
										accent_color="var(--color-red-500)"
										toggled={ isFavorite }
										translateY={1}
										onClick={ () => setIsFavorite(isFavorite ? false : true) }
									/>

									<ActionButton
										title={ t("section.quickButtons.visit") }
										icon="󰃭"
									/>
								</>
							}

							{
								dataExample.mine === true &&
								<>
									<ActionButton
										title={ t("section.quickButtons.editPost") } // NOTE: Should redirect to the edit post page
										icon=""
									/>

									<ActionButton
										title={ t("section.quickButtons.visitSlot") } // NOTE: Should redirect to the Reservation Page
										icon="󰃭"
									/>
								</>
							}
						</div>

					</div>

					<div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4
						w-full
						place-items-center"
					>
						{
							Object.entries(dataExample.features).map(([key, value]) => {
								const	data: string = value.toString();

								return (
									<FeaturesCard
										key={ key }
										title={ t(`section.features.${key}`) }
										icon={ iconFeatures[key] }
										value={ (data === "true" || data === "false") ? (data === "true" ? t("yes") : t("no")) : data }
									/>
								);
							})
						}
					</div>

					<BoxSection
						title={ t("section.description.title") }
					>
						<div className="font-light">
							{ dataExample.description }
						</div>
					</BoxSection>
				</div>

				<div className="flex flex-col items-center justify-start gap-7"
				>
					<BoxSection
						title={ t("section.post.title") }
					>
						<div className="font-light">
							{ t("section.post.publicationDate") + " " + CreateDateForPost(dataExample.createdAt) }
						</div>

						{
							dataExample.updatedAt && 
								<div className="font-light text-sm">
									{ t("section.post.updateDate") + " " + CreateDateForPost(dataExample.updatedAt) }
								</div>
						}
						{
							dataExample.mine === true &&
								<>
									{
										<ToggleButton
											icon=""
											icon_toggled="󰄬"
											title={
												dataExample.type === "rent" ? (!isAvailable ? t("section.post.availability.buttons.rented") : t("section.post.availability.buttons.markRented"))
													: (!isAvailable ? t("section.post.availability.buttons.sold") : t("section.post.availability.buttons.markSold"))
											}
											accent_color="var(--color-green-500)"
											toggled={ !isAvailable }
											customStyle={{
												cursor: (dataExample.type === "sale" && !isAvailable ? "not-allowed" : "pointer")
											}}
											onClick={ () => {
												if (dataExample.type === "sale" && !isAvailable)
													return ;
												setOpenPopupAvailability(true);
											}}
										/>
									}

									<ActionButton
										title={ dataExample.status === "archived" ? t("section.post.archive.buttons.disabled") : t("section.post.archive.buttons.title") }
										icon="󰀼"
										onClick={ () => setOpenPopupArchive(true) }
										disabled={ isArchiveDisabled }
									/>
								</>
						}
						{
							dataExample.mine === false &&
								<ToggleButton
									title={ isAvailable ? t("section.post.availability.status.available") : t("section.post.availability.status.not_available") }
									toggled={ true }
									accent_color={ !isAvailable ? "var(--color-red-500)" : "var(--color-green-500)"}
									customStyle={{
										cursor: "auto"
									}}
								/>
						}
					</BoxSection>

					{
						dataExample.mine === false && dataExample.sellerVisible === true &&
						<BoxSection
							title={ t("section.contact.title") }
						>
							<div className="flex flex-col items-start justify-center
								w-full"
							>
								<div className="text-md">
									{ dataExample.seller?.name }
								</div>
								<div className="font-extralight text-md">
									{ dataExample.seller?.email }
								</div>
								<div className="font-extralight text-md">
									{ dataExample.seller?.phone }
								</div>
								<div className="font-extralight text-md mt-4"
								>
									{
										t("section.contact.memberSince") + " " + CreateDateForMemberSince(dataExample.seller?.memberSince ?? "2100-02-10T23:00:00Z")
									}
								</div>
							</div>
						</BoxSection>
					}
					{
						dataExample.mine === false &&
							<BoxSection
								title={ t("section.stats.title") }
							>
								<div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] grid-rows-1
									gap-7
									mb-4
									w-full"
								>
									{
										Object.entries(dataExample.sellerStats).map(([key, value]) => {
											return (
												<Stats
													title={ t(`section.stats.sellerStats.${key}`) }
													value={ value }
												/>
											);
										})
									}
								</div>
							</BoxSection>
					}
					{
						dataExample.mine === true &&
							<BoxSection
								title={ t("section.postStats.title") }
							>
								<div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] grid-rows-1
									gap-7
									mb-4
									w-full"
								>
									{
										Object.entries(dataExample.stats).map(([key, value]) => {
											return (
												<Stats
													title={ t(`section.postStats.${key}`) }
													value={ value }
												/>
											);
										})
									}
								</div>
							</BoxSection>
					}
				</div>

			</div>

			{
				openPopupArchive && <PopUp
					ref={ archivePopupRef }
					title={ t("section.post.archive.popup.title") }
					onClose={ () => setOpenPopupArchive(false) }
				>
					<div className="flex flex-col items-center justify-center
						w-full"
					>
						<div className="font-extralight text-sm">
							{ t("section.post.archive.popup.warning") }
						</div>
						<div className="flex items-center justify-center gap-3
							whitespace-pre-line
							mt-7
							ml-auto"
						>
							<ActionButton
								title={ t("section.post.archive.popup.continue") }
								accent_color="var(--color-red-500)"
								onClick={() => {
									archivePopupRef.current?.close(); // ask the popup to close
								}}
							/>
						</div>
					</div>
				</PopUp>
			}

			{
				openPopupAvailability && <PopUp
					ref={ availabilityPopupRef }
					title={ t(`section.post.availability.popup.${ availabilityActiveSection }.title`) }
					onClose={ () => setOpenPopupAvailability(false) }
				>
					<div className="flex flex-col items-center justify-center
						w-full"
					>
						<div className="font-extralight text-sm">
							{ t(`section.post.availability.popup.${ availabilityActiveSection }.explanation`) }
						</div>
						<div className="flex items-center justify-center gap-3
							whitespace-pre-line
							mt-7
							ml-auto"
						>
							<ActionButton
								title={ t(`section.post.availability.popup.${ availabilityActiveSection }.accept`) }
								accent_color="var(--color-red-500)"
								onClick={ () => {
									if (dataExample.type === "sale")
									{
										setIsAvailable(false);
									}
									else if (dataExample.type === "rent")
									{
										if (isAvailable)
										{
											// TODO: send request to database and act in consequence
											setIsAvailable(false);
										}
										else
										{
											// TODO: send request to database and act in consequence
											setIsAvailable(true);
										}
									}
									availabilityPopupRef.current?.close();
								}}
							/>
						</div>
					</div>
				</PopUp>
			}

			<div className="w-full h-15
				flex-none"
			>
			</div>

		</div>
	);
}

export default ListingsPage;
