import React, { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { type ListingsData, dataExampleListingsData } from "../dataModel/modelListings";
import { toast } from "react-toastify";
import MyListingsView from "./my_listings_view";
import ClientListingsView from "./client_listings_view";

const	ListingsPage: React.FC = () => {
	const	{ t } = useTranslation("listings");
	const	[fetchedData, setFetchedData] = useState<ListingsData | null>(null);
	const	[ searchParams ] = useSearchParams();
	const	listingsID = searchParams.get("id");
	const	[currentPictures, setCurrentPictures] = useState<number>(0);
	const	buttonStyle: string = "font-icon text-4xl absolute z-1 cursor-pointer bg-foreground rounded-full w-12 h-12 hover:bg-accent transition-colors duration-300 shadow-standard";

	useEffect(() => {
		const	fetchListingsData = async () => {
			try {
				const	response = await fetch(`/api/listings/${listingsID}`, {
					method: "GET",
					credentials: "include"
				});
				
				const	responseData = await response.json();
				if (response.ok)
				{
					// NOTE: Directly swap this one to simulate the data
					setFetchedData(responseData);
				}
				else
					throw new Error(responseData.message);
			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(`error:${error.message}`);
			}
		}

		//fetchListingsData();

		// NOTE: DEBUG
		setFetchedData(dataExampleListingsData);
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
				xl:grid xl:grid-cols-[1fr_60%] xl:grid-rows-1
				overflow-y-scroll
				w-full
				xl:h-full"
				>

					<div className="flex items-center justify-center
					relative
					order-1
					xl:order-2
					w-full min-h-75
					xl:pb-4
					xl:h-full"
					>
						{
							window.innerWidth >= 1024 && fetchedData.photos.map((value: string, index: number) => {
								const	active: boolean = currentPictures === index;

								return (
									<img
									key={ index }
									className="w-full h-full object-cover
									absolute
									rounded-t-4xl
									ease-in-out
									transition-transform duration-500
									xl:rounded-t-none xl:rounded-r-4xl"
									style={{
										transform: active ? "none" : "translateX(-200%)"
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

						<button
						className={ buttonStyle }
						style={{
							left: 16
						}}
						onClick={ () => setCurrentPictures(currentPictures > 0 ? currentPictures - 1 : fetchedData.photos.length - 1)}>
							
						</button>

						<button
						className={ buttonStyle }
						style={{
							right: 16
						}}
						onClick={ () => setCurrentPictures(currentPictures === fetchedData.photos.length - 1 ? 1 : currentPictures + 1)}>
							
						</button>
						<div
						className="absolute top-0 left-0
						bg-[linear-gradient(to_top,var(--color-foreground)_10%,transparent)]
						xl:bg-[linear-gradient(to_right,var(--color-foreground)_2%,transparent)]
						w-full h-full"
						></div>

					</div>

					<div
					className="flex flex-col items-center justify-start
					order-2
					xl:order-1
					px-4
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