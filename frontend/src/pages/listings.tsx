import React, { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { type ListingsData, type ListingsTags, dataExampleListingsData } from "../dataModel/modelListings";
import { toast } from "react-toastify";
import MyListingsView from "./my_listings_view";
import ClientListingsView from "./client_listings_view";
import { TagsComponents } from "../components/TagsComponents";

interface NavigatePictureButtonProps {
	icon: string;
	customStyle: CSSProperties;
	onClick: () => void;
	disabled: boolean;
}

const NavigatePictureButton: React.FC<NavigatePictureButtonProps> = ({
	icon = "X",
	customStyle = {},
	onClick,
	disabled = false
}) => {
	const buttonStyle: string = "font-icon text-4xl\
	absolute\
	z-1\
	bg-foreground\
	cursor-pointer\
	rounded-full\
	w-12 h-12\
	hover:bg-accent\
	transition-all duration-300\
	shadow-standard";

	return (
		<button
			className={buttonStyle}
			style={{
				pointerEvents: disabled ? "none" : "auto",
				opacity: disabled ? "0%" : "100%",
				...customStyle
			}}
			onClick={onClick}
		>
			{icon}
		</button>
	)
}

const ListingsPage: React.FC = () => {
	const { t } = useTranslation(["listings", "error", "common"]);
	const [fetchedData, setFetchedData] = useState<ListingsData | null>(null);
	const [searchParams] = useSearchParams();
	const listingsID = searchParams.get("id");
	const [currentPictures, setCurrentPictures] = useState<number>(0);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchListingsData = async () => {
			try {
				if (listingsID === null)
					navigate("/property");

				const response = await fetch(`/api/listings/${listingsID}`, {
					method: "GET",
					credentials: "include"
				});

				const responseData = await response.json();
				if (response.ok) {
					setFetchedData(responseData);
				}
				else
					throw new Error(responseData.message);
			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(`error:${error.message}`);
				navigate("/property");
			}
		}
		fetchListingsData();
	}, []);

	return (
		<div
			className="grid grid-cols-1 grid-rows-[auto_1fr]
		xl:px-64
		transition-discrete duration-300
		animate-fade-in
		overflow-y-scroll
		w-full h-screen"
		>
			<div className="flex-none w-full h-18 xl:h-14"></div>
			{
				fetchedData === null &&
				<div
					className="flex items-center justify-center
				h-full
				w-full"
				>
					<div
						className="font-icon text-4xl animate-spin"
					>
						󱥸
					</div>
				</div>
			}

			{
				fetchedData !== null &&
				<div
					className="flex flex-col items-center justify-start
				xl:grid xl:grid-cols-[1fr_50%] xl:grid-rows-1
				gap-3
				overflow-y-scroll
				w-full
				xl:h-full"
				>

					<div
						className="w-full min-h-75
					xl:h-full
					order-1
					xl:order-2
					overflow-y-hidden
					xl:overflow-x-hidden
					xl:p-4"
					>
						<div className="flex items-center justify-center
						relative
						rounded-t-4xl
						overflow-hidden
						xl:rounded-4xl
						w-full min-h-75
						xl:h-full"
						>
							{
								window.innerWidth >= 1024 && fetchedData.photos.map((value: string, index: number) => {
									const factor: number = index - currentPictures;

									return (
										<img
											key={index}
											className="w-full h-full object-cover
										absolute
										rounded-t-4xl
										xl:rounded-none
										ease-in-out
										transition-transform duration-500"
											style={{
												transform: `translateX(${100 * factor}%)`
											}}
											src={value}
											alt="House Pictures"
										/>
									);
								})
							}

							{
								window.innerWidth < 1024 && fetchedData.photos.map((value: string, index: number) => {
									const active: boolean = currentPictures === index;

									return (
										<img
											key={index}
											className="w-full h-full object-cover
										absolute
										rounded-t-4xl
										ease-in-out
										transition-transform duration-500
										shadow-standard
										xl:rounded-t-none xl:rounded-r-4xl"
											style={{
												transform: active ? "none" : "translateY(200%)"
											}}
											src={value}
											alt="House Pictures"
										/>
									);
								})
							}

							<NavigatePictureButton
								icon=""
								customStyle={{
									left: 16
								}}
								onClick={() => setCurrentPictures(currentPictures > 0 ? currentPictures - 1 : fetchedData.photos.length - 1)}
								disabled={currentPictures === 0}
							/>

							<NavigatePictureButton
								icon=""
								customStyle={{
									right: 16
								}}
								disabled={currentPictures === fetchedData.photos.length - 1}
								onClick={() => setCurrentPictures(currentPictures === fetchedData.photos.length - 1 ? 1 : currentPictures + 1)}
							/>

							<div
								className="absolute top-4 left-4
							flex flex-wrap gap-3
							w-full">
								{
									fetchedData.tags && fetchedData.tags.map((value: ListingsTags, index: number) => {
										return (
											<TagsComponents
												key={index}
												tags={value}
											/>
										);
									})
								}
							</div>
						</div>
					</div>

					<div
						className="flex flex-col items-center justify-start
					order-2
					xl:order-1
					px-4
					xl:p-4
					relative
					xl:overflow-y-scroll
					wrap-break-word
					bg-foreground
					z-1
					w-full xl:h-full"
					>
						{
							fetchedData.mine === true &&
							<MyListingsView
								fetchedData={fetchedData}
								setFetchedData={setFetchedData}
								t={t}
							/>
						}
						{
							fetchedData.mine === false &&
							<ClientListingsView
								fetchedData={fetchedData}
								setFetchedData={setFetchedData}
								t={t}
							/>
						}
					</div>
				</div>
			}
		</div>
	)
}

export default ListingsPage;
