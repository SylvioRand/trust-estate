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

const MyListingsBento: React.FC<MyListingsBentoProps> = ({ data }) => {
	const formatter = new Intl.NumberFormat("de-DE");
	const { t } = useTranslation("common");

	const statusIcon: Record<"archived" | "active" | "blocked", string> = {
		archived: "",
		active: "",
		blocked: ""
	};
	const statusColors: Record<"archived" | "active" | "blocked", string> = {
		archived: "var(--color-red-500)",
		active: "transparent",
		blocked: "var(--color-red-500)"
	};

	return (
		<div
			className="group grid grid-cols-1 grid-rows-[auto_1fr]
			rounded-2xl
			relative
			w-full
			overflow-hidden
			transition-all duration-500 ease-out
			hover:-translate-y-1"
			style={{
				background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
				boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.06) inset",
				border: "1px solid rgba(255,255,255,0.08)",
			}}
		>
			<div
				className="absolute top-3 left-3
				flex flex-wrap gap-1.5
				z-10
				w-[calc(100%-1.5rem)]"
			>
				{data.tags && data.tags.map((value: ListingsTags, index: number) => (
					<TagsComponents key={index} tags={value} />
				))}
			</div>

			<div
				className="flex items-center justify-center
				relative
				overflow-hidden
				w-full aspect-square"
			>
				<div
					className="absolute inset-0 z-[1] flex items-center justify-center
					transition-opacity duration-300"
					style={{
						backgroundColor: data.status !== "active"
							? "color-mix(in srgb, black 55%, transparent)"
							: "transparent",
					}}
				>
					<div
						className="font-icon text-[64px] drop-shadow-lg"
						style={{
							color: statusColors[data.status],
							textShadow: `0px 0px 20px ${statusColors[data.status]}, 0px 0px 40px ${statusColors[data.status]}40`
						}}
					>
						{statusIcon[data.status]}
					</div>
				</div>

				<div
					className="absolute bottom-0 left-0 w-full h-1/3 z-[1] pointer-events-none"
					style={{
						background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)"
					}}
				/>

				<img
					className="w-full h-full object-cover
					transition-transform duration-700 ease-out
					group-hover:scale-105"
					src={data.photos[0]}
					alt="User listing house picture"
				/>
			</div>

			<div
				className="grid grid-cols-1 grid-rows-[auto_auto]
				gap-3
				place-items-start
				p-4"
			>
				<div className="grid grid-cols-1 gap-1 w-full">
					<div
						className="font-higuen font-bold
						text-base leading-snug
						truncate w-full
						tracking-wide"
					>
						{data.title}
					</div>

					<div
						className="flex items-center gap-1.5
						w-full text-xs
						opacity-60"
					>
						<div className="font-icon text-xs"></div>
						<div className="truncate w-full">{data.zone}</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-2 w-full">
					<div
						className="font-bold text-sm tracking-wider"
						style={{ color: "var(--color-gold, #c9a84c)" }}
					>
						{`${formatter.format(data.price)} Ar`}
					</div>
					<Link className="w-full" to={`/property/listings?id=${data.id}`}>
						<ActionButton title={t("viewDetails")} />
					</Link>
				</div>
			</div>
		</div>
	);
};

const ProfilePage: React.FC = () => {
	const navigate = useNavigate();
	const { userData, isConnected } = useDataProvider();
	VerifyUsersState();
	const { t } = useTranslation(["profile", "listings", "common", "error"]);
	const [myListings, setMyListings] = useState<MyListingsData[]>([]);
	const [creditBalance, setCreditBalance] = useState<number>(0);

	useEffect(() => {
		if (isConnected !== null && isConnected === false)
			navigate("/sign-in");
	}, [isConnected]);

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
				setMyListings(responseData.data ?? []);
			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(t(`error:${error.message}`))
			}
		};

		getMyData();
	}, []);
	console.log(myListings);
	useEffect(() => {
		const credit = async () => {
			try {
				const response = await fetch('/api/credits/balance', {
					method: 'GET',
					credentials: 'include'
				});
				const responseData = await response.json();

				if (!response.ok) {
					toast.error(t(`error:${responseData.message}`));
					throw new Error(responseData.message);
				}
				if (responseData && typeof responseData.balance === "number") {
					setCreditBalance(responseData.balance);
				}
			} catch (error) {
				if (error instanceof Error && error.message !== "")
					toast.error(t(`error:${error.message}`));
			}
		};

		credit();
	}, []);

	return (
		<div
			className="flex flex-col items-center justify-start
			px-4 md:px-7 xl:px-64
			overflow-y-scroll
			animate-fade-in
			w-full h-screen"
		>
			<div className="w-full h-20 flex-none" />

			{/* Hero Banner */}
			<div
				className="w-full
				flex-none
				relative
				overflow-hidden
				rounded-2xl"
				style={{
					height: "160px",
					boxShadow: "0 8px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset",
				}}
			>
				<img
					className="w-full h-full object-cover"
					src="https://www.maxfosterphotography.com/images/xl/Radiant-Swirl.jpg"
					alt="Abstract image"
				/>
				{/* Vignette overlay */}
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)"
					}}
				/>
			</div>

			{/* Profile Card */}
			<div
				className="w-full mt-px rounded-b-2xl"
				style={{
					background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
					border: "1px solid rgba(255,255,255,0.07)",
					borderTop: "none",
					boxShadow: "0 8px 32px rgba(0,0,0,0.14)"
				}}
			>
				<div
					className="grid grid-cols-1 grid-rows-2
					md:grid-cols-[1fr_auto] md:grid-rows-1
					w-full"
				>
					{/* User Info */}
					<div
						className="flex flex-col items-start justify-center
						px-5 py-5
						w-full
						gap-0.5"
					>
						{/* Name */}
						<div
							className="font-bold text-xl tracking-wide truncate w-full"
						>
							{userData?.firstName}
							{userData?.lastName &&
								<span className="ml-2">{userData.lastName}</span>
							}
						</div>

						{/* Email */}
						<div className="text-sm opacity-50 truncate w-full font-light mt-0.5">
							{userData?.email}
						</div>

						{/* Phone */}
						{userData?.phone &&
							<div className="text-sm opacity-50 truncate w-full font-light">
								{userData.phone}
							</div>
						}

						{/* Member since */}
						{userData?.createdAt &&
							<div
								className="text-xs opacity-40 mt-3 tracking-widest uppercase font-light"
							>
								{t("listings:section.contact.memberSince") + " " + CreateDateForMemberSince(userData?.createdAt)}
							</div>
						}

						{/* Credits badge */}
						{userData !== null && creditBalance !== null &&
							<div className="mt-4">
								<div
									className="inline-flex items-center gap-2
									px-3 py-1.5
									rounded-full
									text-xs font-semibold
									transition-all duration-300"
									style={{
										background: "linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)",
										border: "1px solid rgba(201,168,76,0.35)",
										color: "var(--color-gold, #c9a84c)",
										boxShadow: "0 0 12px rgba(201,168,76,0.08)"
									}}
								>
									<span className="font-icon text-sm"></span>
									<span className="font-bold">{creditBalance}</span>
									<span
										className="font-light opacity-70"
									>
										{t("credits")}
									</span>
								</div>
							</div>
						}
					</div>

					{/* Action Buttons */}
					<div
						className="flex flex-row md:flex-col items-center justify-center
						px-4 py-4
						gap-2"
					>
						<Link className="w-full" to="/profile/settings">
							<ActionButton
								icon=""
								title={t("buttons.settings")}
							/>
						</Link>
						<ActionButton
							icon={userData?.role === "MODERATOR" ? "" : "󰚧"}
							icon_size={22}
							title={userData?.role === "MODERATOR" ? t("buttons.flagged") : t("buttons.publish")}
							onClick={() => {
								if (userData?.role === "MODERATOR")
									navigate("/profile/moderator/flagged");
								else
									navigate("/profile/publish");
							}}
						/>
					</div>
				</div>
			</div>

			{/* Divider */}
			<div className="w-full my-6">
				<ContentDivider
					line_color="linear-gradient(to left,
					transparent,
					var(--color-background) 10%,
					var(--color-background) 90%,
					transparent)"
				/>
			</div>

			{/* Empty state */}
			{myListings.length === 0 &&
				<div
					className="flex flex-col items-center justify-center
					select-none
					w-full
					py-16
					gap-3
					opacity-40"
				>
					<div
						className="font-icon text-[96px] leading-none"
					>
						
					</div>
					<div className="text-sm font-light tracking-widest uppercase">
						{t("noMyListings")}
					</div>
				</div>
			}
			<div
				className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))]
				gap-4
				w-full"
			>
				{myListings && myListings.map((value: MyListingsData, index: number) => (
					<Animate
						key={index}
						customStyle={{ width: "100%" }}
						delay={`${80 * index}ms`}
					>
						<MyListingsBento
							data={value}
						/>
					</Animate>
				))}
			</div>

			<div className="w-full h-10 flex-none" />
		</div>
	);
};

export default ProfilePage;