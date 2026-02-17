import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { CreateDateForMemberSince } from "../utils/Format";
import useDataProvider from "../provider/useDataProvider";
import { VerifyUsersState } from "../hooks/VerifyUsersState";
import type { ListingsTags, MyListingsData } from "../dataModel/modelListings";
import { toast } from "react-toastify";
import { TagsComponents } from "../components/TagsComponents";
import Animate from "../components/Animate";

interface MyListingsBentoProps {
	data: MyListingsData;
}

const MyListingsBento: React.FC<MyListingsBentoProps> = ({
	data
}) => {
	const formatter = new Intl.NumberFormat("de-DE");
	const { t } = useTranslation("common");
	const statusIcon: Record<"archived" | "active" | "blocked", string> = {
		archived: "",
		active: "",
		blocked: ""
	}
	const statusColors: Record<"archived" | "active" | "blocked", string> = {
		archived: "var(--color-red-500)",
		active: "transparent",
		blocked: "var(--color-red-500)"
	}

	return (
		<div
			className="grid grid-cols-1 grid-rows-[auto_1fr]
		rounded-xl
		shadow-standard
		relative
		w-full"
		>
			<div
				className="absolute top-2 left-2
			flex flex-wrap gap-2
			z-2
			w-full"
			>
				{
					data.tags && data.tags.map((value: ListingsTags, index: number) => {
						return (
							<TagsComponents
								key={index}
								tags={value}
							/>
						);
					})
				}
			</div>

			<div
				className="flex items-center justify-center
			relative
			overflow-hidden
			w-full aspect-square"
			>
				<div
					className="absolute top-0 left-0
				flex items-center justify-center
				w-full h-full
				select-none
				rounded-t-xl
				z-1"
					style={{
						backgroundColor: data.status !== "active" ? "color-mix(in srgb, black 50%, transparent)" : "transparent",
					}}
				>
					<div
						className="font-icon text-[64px]"
						style={{
							color: statusColors[data.status],
							textShadow: `0px 0px 7px ${statusColors[data.status]}`
						}}
					>
						{statusIcon[data.status]}
					</div>
				</div>

				<img
					className="w-full h-full object-cover
				rounded-t-xl"
					src={data.photos[0]}
					alt="User listing house picture"
				/>
			</div>
			<div
				className="grid grid-cols-1 grid-rows-[auto_auto]
			gap-3
			place-items-start
			rounded-b-xl
			p-3
			border-x border-b border-background/25"
			>
				<div
					className="grid grid-cols-1 grid-rows-[auto_auto]
				place-items-start
				w-full">
					<div
						className="font-higuen font-bold
					text-lg
					truncate w-full"
					>
						{data.title}
					</div>

					<div
						className="flex items-center justify-center gap-1
					w-full
					text-sm"
					>
						<div className="font-icon"></div><div className="truncate w-full">{data.zone}</div>
					</div>
				</div>

				<div
					className="grid grid-cols-1 grid-rows-[auto_auto]
				w-full"
				>
					<div
						className="font-bold">
						{`${formatter.format(data.price)} Ar`}
					</div>
					<Link
						className="w-full"
						to={`/property/listings?id=${data.id}`}
					>
						<ActionButton
							title={t("viewDetails")}
						/>
					</Link>
				</div>
			</div>
		</div>
	);
}

const ProfilePage: React.FC = () => {
	const navigate = useNavigate();
	const { userData, isConnected } = useDataProvider();
	VerifyUsersState();
	const { t } = useTranslation(["profile", "listings", "common", "error"]);
	const [myListings, setMyListings] = useState<MyListingsData[]>([]);

	// Redirect if user is not connected
	if (isConnected !== null && isConnected === false)
		navigate("/sign-in");

	useEffect(() => {
		const getMyData = async () => {
			try {
				const response = await fetch('/api/listings/mine?limit=100', {
					method: 'GET',
					credentials: 'include'
				});
				const responseData = await response.json();

				if (!response.ok) {
					if (responseData.details) {
						const details: Record<string, string[]> = responseData.details as Record<string, string[]>;

						for (const [key, value] of Object.entries(details)) {
							for (let i = 0; i < value.length; i++)
								toast.error(t(`error:${value[i]}`));
						}
					}
					throw new Error(responseData.message);
				}
				setMyListings(responseData.data);
			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(t(`error:${error.message}`))
			}
		};

		getMyData();
	}, []);

	return (
		<div className="flex flex-col items-center justify-start
			px-4 md:px-7 xl:px-64
			overflow-y-scroll
			animate-fade-in
			w-full h-screen"
		>
			<div className="w-full h-20 flex-none"></div>

			<div className="w-full h-36
				flex-none
				flex items-center justify-center
				relative
				overflow-hidden
				drop-shadow-standard
				rounded-xl"
			>
				<img
					className="w-full h-full object-cover"
					src="https://www.maxfosterphotography.com/images/xl/Radiant-Swirl.jpg"
					alt="Abstract image"
				/>
			</div>


			<div className="grid grid-cols-1 grid-rows-2
				md:grid-cols-[1fr_auto] md:grid-rows-1
				w-full"
			>
				<div className="flex flex-col items-center justify-center
					p-2
					md:p-4
					w-full"
				>
					<div className="font-bold
						w-full
						truncate
						mr-auto"
					>
						{userData?.firstName}
					</div>

					{
						userData && userData.lastName &&
						<div className="font-bold
						w-full
						truncate
						mr-auto"
						>
							{userData.lastName}
						</div>
					}

					<div className="font-light
						w-full
						truncate
						whitespace-pre-line
						mr-auto"
					>
						{userData?.email}
					</div>

					{
						userData && userData.phone &&
						<div className="font-light
						w-full
						truncate
						whitespace-pre-line
						mr-auto"
						>
							{userData.phone}
						</div>
					}

					{
						userData && userData.createdAt &&
						<div className="font-light
						w-full
						truncate
						whitespace-pre-line
						mt-4
						mr-auto"
						>
							{
								t("listings:section.contact.memberSince")
								+ " "
								+ CreateDateForMemberSince(userData?.createdAt)
							}
						</div>
					}
				</div>
				<div className="grid grid-cols-1 grid-rows-2
					md:grid-cols-[auto_auto] md:grid-rows-1
					place-items-start
					p-2
					md:p-4
					gap-0
					xl:gap-4"
				>
					<Link
						className="w-full"
						to="/profile/settings"
					>
						<ActionButton
							icon=""
							title={t("buttons.settings")}
						/>
					</Link>
					<ActionButton
						icon={userData?.role === "MODERATOR" ? "" : "󰚧"}
						icon_size={22}
						title={userData?.role === "MODERATOR" ? t("buttons.flagged") : t("buttons.publish")}
						onClick={
							() => {
								if (userData?.role === "MODERATOR")
									navigate("/profile/moderator/flagged")
								else
									navigate("/profile/publish")
							}
						}
					/>
				</div>
			</div>

			<div
				className="w-full my-4"
			>
				<ContentDivider
					line_color="linear-gradient(to left,
					transparent,
					var(--color-background) 10%,
					var(--color-background) 90%,
					transparent)"
				/>
			</div>

			{
				myListings.length === 0 &&
				<div
					className="flex flex-col items-center justify-center
					select-none
					w-full"
				>
					<div
						className="flex items-center justify-center
						w-48 aspect-square
						relative"
					>
						<div
							className="font-icon text-[256px]
							absolute"
						>
							
						</div>
					</div>
					<div className="font-light">
						{t("noMyListings")}
					</div>
				</div>
			}
			<div
				className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] grid-rows-1
		gap-3
		xl:px-0
		w-full"
			>
				{
					myListings && myListings.map((value: MyListingsData, index: number) => {
						return (
							<Animate
								customStyle={{
									width: "100%"
								}}
								delay={`${100 * index}ms`}
							>
								<MyListingsBento
									key={index}
									data={value}
								/>
							</Animate>
						);
					})
				}
			</div>
			<div
				className="w-full h-6 flex-none"></div>
		</div>
	);
}

export default ProfilePage;
