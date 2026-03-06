import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/i18n";
import useDataProvider from "../provider/useDataProvider";

interface NavButtonProps {
	icon: string;
	icon_size?: number;
	title: string;
	path: string;
}

const MobileNavButton: React.FC<NavButtonProps> = ({
	icon = "",
	icon_size = 32,
	title = "Title",
	path = "/sign-in" // by default just go back to sign-in
}) => {
	const location = useLocation();
	const [active, setActive] = useState<boolean>(false);
	const [hovered, setHovered] = useState<boolean>(false);

	useEffect(() => {
		setActive(location.pathname.includes(path));
	}, [location.pathname, path]);

	return (
		<Link
			className="flex items-center justify-start
				relative
				p-2
				w-full h-12"
			to={path}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
		>
			<div className="absolute top-0 left-0
				bg-linear-to-r from-accent to-transparent
				transition-opacity duration-500
				w-full h-full"
				style={{
					opacity: active ? "50%" : "0%"
				}}
			>
			</div>

			<div className="absolute left-0
				flex items-center justify-center
				-translate-x-[50%]
				rounded-full
				bg-accent
				blur-sm
				transition-opacity duration-500
				h-[70%] aspect-square"
				style={{
					opacity: active ? "100%" : "0%"
				}}
			>
				<div className="h-[50%] aspect-square
					bg-background
					rounded-full"
				>
				</div>
			</div>


			<div className="absolute
				-translate-x-9 translate-y-3
				blur-md
				rotate-z-90
				scale-x-400
				transition-opacity duration-500"
				style={{
					opacity: active ? "100%" : "0%"
				}}
			>
				<svg
					width="80"
					height="110"
					viewBox="0 0 210 297"
					version="1.1"
					id="svg1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g id="layer1">
						<path
							d="M103.89355,128.09256 L128.6209,186.10211 L27.137833,186.10211 L51.956802,128.09256 L77.87937,41.231752 Z"
							id="path3"
							fill="var(--color-accent)"
							stroke="none"
						/>
					</g>
				</svg>
			</div>



			<div className="z-1
				transition-colors duration-500"
				style={{
					color: active ? "var(--color-foreground)" : "var(--color-background)"
				}}
			>
				{title}
			</div>
		</Link>
	);
}

interface HamburgerMenuProps {
	open: boolean;
	data: NavButtonProps[];
	dataUser: NavButtonProps[];
	onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
	open = false,
	data = [],
	dataUser = [],
	onClose = () => { }
}) => {
	const { isConnected, userData } = useDataProvider();

	return (
		<div className="fixed top-0 right-0
			grid grid-cols-[1fr_225px] grid-rows-1
			w-full h-screen"
			style={{
				pointerEvents: open ? "auto" : "none"
			}}
		>
			<div className="w-full h-full"
				onClick={onClose}
			>
			</div>
			<div className="grid grid-cols-1 grid-rows-[auto_1fr_auto] gap-3
				transition-transform duration-200
				w-full h-full
				border-l border-background/25
				overflow-hidden
				bg-foreground"
				style={{
					transform: open ? "translateX(0px)" : "translateX(100%)",
					boxShadow: open ? "0px 0px 10px rgba(0,0,0,0.25)" : "none"
				}}
			>
				<div className="font-icon text-4xl text-background
					p-2
					ml-auto"
					onClick={onClose}
				>
					
				</div>
				<div className="flex flex-col items-start justify-start
					w-full h-full"
				>
					{
						data.map((value: NavButtonProps, index: number) => {
							return (
								<MobileNavButton
									key={index}
									icon={value.icon}
									title={value.title}
									path={value.path}
								/>
							);
						})
					}
				</div>
				<div className="flex flex-col items-start justify-end gap-3
					flex-none
					pb-4"
				>
					{
						(location.pathname !== "/add-phone" && location.pathname !== "/email-sent") &&
						(isConnected === false || isConnected === null) && dataUser.map((value: NavButtonProps, index: number) => {
							return (
								<MobileNavButton
									key={index}
									icon={value.icon}
									title={value.title}
									path={value.path}
								/>
							);
						})
					}

					{
						(location.pathname !== "/add-phone" && location.pathname !== "/email-sent") &&
						isConnected === true && userData &&
						<MobileNavButton
							icon=""
							title={userData.email}
							path="/profile"
						/>
					}
				</div>
			</div>
		</div>
	);
}

const NavigationButton: React.FC<NavButtonProps> = ({
	icon = "",
	icon_size = 32,
	title = "Title",
	path = "/sign-in" // by default just go back to sign-in
}) => {
	const location = useLocation();
	const [active, setActive] = useState<boolean>(false);
	const [hovered, setHovered] = useState<boolean>(false);

	useEffect(() => {
		// setActive(location.pathname === path);
		setActive(location.pathname.includes(path));
	}, [location.pathname, path])

	return (
		<Link
			to={path}
			className="relative
			flex items-center justify-center
			cursor-pointer
			h-full
			overflow-hidden
			min-w-20
			select-none"
			onClick={() => {
				if (path === "/sign-up")
					sessionStorage.setItem("fromSignUp", path);
				else if (path !== "/sign-in")
					sessionStorage.removeItem("fromSignUp");
			}}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
		>
			<div className="text-sm p-2
				z-1
				transition-all duration-200"
				style={{
					color: active ? "var(--color-accent)" : hovered ? "color-mix(in srgb, var(--color-accent) 25%, var(--color-background))" : "var(--color-background)",
					textShadow: active ? "0px 0px 2px black" : "none"
				}}
			>
				{title}
			</div>

			<div className="absolute
				bottom-0
				translate-y-[50%]
				bg-accent
				blur-sm
				rounded-full
				transition-opacity duration-500
				w-[40%] aspect-square"
				style={{
					opacity: active ? "100%" : "0%"
				}}
			>
			</div>

			<div className="absolute
				blur-md
				transition-opacity duration-500
				translate-x-3 translate-y-5"
				style={{
					opacity: active ? "100%" : "0%"
				}}
			>
				<svg
					width="80"
					height="110"
					viewBox="0 0 210 297"
					version="1.1"
					id="svg1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g id="layer1">
						<path
							d="M103.89355,128.09256 L128.6209,186.10211 L27.137833,186.10211 L51.956802,128.09256 L77.87937,41.231752 Z"
							id="path3"
							fill="var(--color-accent)"
							stroke="none"
						/>
					</g>
				</svg>
			</div>


			<div className="absolute
				bottom-0
				transition-all duration-200
				origin-center
				h-[0.1rem]
				bg-[linear-gradient(to_left,transparent,var(--color-accent),transparent)]
				"
				style={{
					width: active ? "100%" : "0%",
					opacity: active ? "100%" : "0%"
				}}
			>
			</div>

		</Link>
	);
}

const NavBar: React.FC = () => {
	const { t } = useTranslation("nav");
	const [openHamburger, setOpenHamburger] = useState<boolean>(false);
	const { isConnected, userData } = useDataProvider();
	const location = useLocation();

	const preferredLangage: string = navigator.language.split("-")[0];

	const dataNavButton: NavButtonProps[] = [
		{ icon: "", title: t("button.home"), path: "/home" },
		{ icon: "", icon_size: 22, title: t("button.property"), path: "/property" },
		{ icon: "", icon_size: 34, title: t("button.ai"), path: "/ai" },
		...(isConnected && location.pathname !== "/email-sent" ? [{ icon: "󰕒", icon_size: 28, title: t("button.dashboard.title"), path: "/dashboard" }] : [])];
	const userNavButton: NavButtonProps[] = [
		{ icon: "󰍂", icon_size: 28, title: t("button.signIn"), path: "/sign-in" },
		{ icon: "󰆓", icon_size: 24, title: t("button.signUp"), path: "/sign-up" }
	]

	return (
		<div className="fixed top-0 left-0
			z-999999
			pointer-events-auto
			backdrop-blur-xl
			bg-linear-to-t from-transparent to-foreground
			border-b border-background/25
			w-full
			h-15"
			style={{
				boxShadow: "0px 0px 10px rgba(0,0,0,0.25)"
			}}
		>
			<div className="grid grid-cols-[auto_1fr] md:grid-cols-[1fr_auto_1fr] grid-rows-1 place-items-center
				px-4 md:px-7 xl:px-64
				transition-discrete duration-500
				z-1
				w-full h-full"
			>
				<div className="font-higuen text-[46px] text-background justify-self-start
					translate-y-1"
				>
					{t("brand.name")}
				</div>

				<div className="md:flex items-center justify-center gap-3
						h-full
						hidden"
				>
					{
						(location.pathname !== "/email-sent" && location.pathname !== "/add-phone") &&
						dataNavButton.map((value: NavButtonProps, index: number) => {
							return (
								<NavigationButton
									key={index}
									icon={value.icon}
									icon_size={value.icon_size ?? 32}
									title={value.title}
									path={value.path}
								/>
							);
						})
					}
				</div>

				<div className="flex items-center justify-center justify-self-end gap-3 h-full">
					<div className="md:flex items-center justify-center gap-3
						h-full
						hidden"
					>
						{
							(location.pathname !== "/add-phone" && location.pathname !== "/email-sent") &&
							(isConnected === false || isConnected === null || userData === null) && userNavButton.map((value: NavButtonProps, index: number) => {
								return (
									<NavigationButton
										key={index}
										icon={value.icon}
										icon_size={value.icon_size ?? 32}
										title={value.title}
										path={value.path}
									/>
								);
							})
						}

						{
							(location.pathname !== "/add-phone" && location.pathname !== "/email-sent") &&
							isConnected === true && userData &&
							<div className="flex items-center justify-center gap-3 h-full">
								<NavigationButton
									icon=""
									icon_size={32}
									title={userData.email}
									path="/profile"
								/>
							</div>
						}


					</div>

					<select
						name="langage"
						style={{
							backgroundColor: "transparent"
						}}
						onChange={
							(e) => {
								i18n.changeLanguage(e.target.value);
							}
						}
						defaultValue={preferredLangage}
					>
						<option value="en">🇬🇧</option>
						<option value="fr">🇫🇷</option>
						<option value="es">🇪🇸</option>
					</select>

					{
						(location.pathname !== "/email-sent" && location.pathname !== "/add-phone") &&
						<div
							className="block justify-self-end
							md:hidden
							font-icon text-background text-4xl"
							onClick={() => setOpenHamburger(true)}
						>
							
						</div>
					}
				</div>

				<HamburgerMenu
					open={openHamburger}
					data={dataNavButton}
					dataUser={userNavButton}
					onClose={() => setOpenHamburger(false)}
				/>

			</div>
		</div>
	);
}

export default NavBar;
