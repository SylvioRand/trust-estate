import React, { useEffect, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { type ListingsData, dataExampleListingsData } from "../dataModel/modelListings";
import { toast } from "react-toastify";
import MyListingsView from "./my_listings_view";
import ClientListingsView from "./client_listings_view";

interface	NavigatePictureButtonProps {
	icon: string;
	fetchedData: ListingsData;
	currentPictures: number;
	customStyle: CSSProperties;
	onClick: () => void;
	disabled: boolean;
}

const	NavigatePictureButton: React.FC<NavigatePictureButtonProps> = ({
	icon = "X",
	fetchedData,
	currentPictures = 0,
	customStyle = {},
	onClick,
	disabled = false
}) => {
	const	buttonStyle: string = "font-icon text-4xl\
	absolute\
	z-1\
	bg-foreground\
	rounded-full\
	w-12 h-12\
	hover:bg-accent\
	transition-all duration-300\
	shadow-standard";

	return (
		<button
		className={ buttonStyle }
		style={{
			pointerEvents: disabled ? "none" : "auto",
			opacity: disabled ? "0%" : "100%",
			...customStyle
		}}
		onClick={ onClick }
		>
			{ icon }
		</button>
	)
}

const	ListingsPage: React.FC = () => {
	const	{ t } = useTranslation(["listings", "error", "common"]);
	const	[fetchedData, setFetchedData] = useState<ListingsData | null>(null);
	const	[ searchParams ] = useSearchParams();
	const	listingsID = searchParams.get("id");
	const	[currentPictures, setCurrentPictures] = useState<number>(0);
	const	navigate = useNavigate();

	useEffect(() => {
		const	fetchListingsData = async () => {
			try {
				if (listingsID === null)
					navigate("/property");

				const	response = await fetch(`/api/listings/${listingsID}`, {
					method: "GET",
					credentials: "include"
				});
				
				const	responseData = await response.json();
				if (response.ok)
				{
					console.log(responseData);
					// NOTE: Directly swap this one to simulate the data
					setFetchedData(responseData);
				}
				else
					throw new Error(responseData.message);
			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(`error:${error.message}`);
				setTimeout(() => navigate("/property"), 1000);
			}
		}

		fetchListingsData();

		// NOTE: DEBUG
		// setFetchedData(dataExampleListingsData);
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
			<div className="flex-none w-full h-18"></div>
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
				overflow-y-scroll
				w-full
				p-4
				xl:h-full"
				>

					<div className="flex items-center justify-center
					relative
					order-1
					xl:order-2
					overflow-y-hidden
					xl:overflow-x-hidden
					rounded-t-4xl
					xl:rounded-4xl
					w-full min-h-75
					xl:h-full"
					>
						{
							window.innerWidth >= 1024 && fetchedData.photos.map((value: string, index: number) => {
								const	active: boolean = currentPictures === index;
								const	factor: number = index - currentPictures;

								return (
									<img
									key={ index }
									className="w-full h-full object-cover
									absolute
									rounded-t-4xl
									xl:rounded-none
									ease-in-out
									transition-transform duration-500"
									style={{
										transform: `translateX(${100 * factor}%)`
									}}
									src={ value }
									alt="House Pictures"
									/>
								);
							})
						}

						{
							window.innerWidth < 1024 && fetchedData.photos.map((value: string, index: number) => {
								const	active: boolean = currentPictures === index;

								return (
									<img
									key={ index }
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
									src={ value }
									alt="House Pictures"
									/>
								);
							})
						}

						<NavigatePictureButton
						fetchedData={ fetchedData }
						currentPictures={ currentPictures }
						icon=""
						customStyle={{
							left: 16
						}}
						onClick={ () => setCurrentPictures(currentPictures > 0 ? currentPictures - 1 : fetchedData.photos.length - 1)}
						disabled={ currentPictures === 0 }
						/>

						<NavigatePictureButton
						fetchedData={ fetchedData }
						currentPictures={ currentPictures }
						icon=""
						customStyle={{
							right: 16
						}}
						disabled={ currentPictures === fetchedData.photos.length - 1 }
						onClick={ () => setCurrentPictures(currentPictures === fetchedData.photos.length - 1 ? 1 : currentPictures + 1)}
						/>
					</div>

					<div
					className="flex flex-col items-center justify-start
					order-2
					xl:order-1
					xl:px-4
					relative
					xl:p-4
					xl:overflow-y-scroll
					bg-foreground
					z-1
					w-full xl:h-full"
					>
						{
							fetchedData.mine === true &&
							<MyListingsView
							fetchedData={ fetchedData }
							t={ t }
							/>
						}
						{
							fetchedData.mine === false &&
							<ClientListingsView
							fetchedData={ fetchedData }
							t={ t }
							/>
						}
					</div>
				</div>
			}
		</div>
	)
}

export default ListingsPage;