import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/i18n";

interface NavButtonProps {
	icon: string;
	icon_size?: number;
	title: string;
	path: string;
}

const NavButton: React.FC<NavButtonProps> = ({
	icon = "",
	icon_size = 32,
	title = "Title",
	path = "/sign-in" // by default just go back to sign-in
}) => {
	const active: boolean = useLocation().pathname === path;
	const [hovered, setHovered] = useState<boolean>(false);

	return (
		<Link className="flex items-center justify-center gap-2
			transition-all duration-200"
			style={{
				padding: "4px 12px",
				borderRadius: "var(--radius-lg)",
				backgroundColor: active ? "var(--color-background)" : (hovered ? "color-mix(in srgb, var(--color-background) 25%, var(--color-foreground))" : "transparent"),
				color: active ? "var(--color-foreground)" : "var(--color-background)"
			}}
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			to={path}
		>
			{
				icon && <div className="relative
					w-4 h-8
					flex items-center justify-center
					font-icon"
					style={{
						fontSize: icon_size
					}}
				>
					<div className="absolute">
						{icon}
					</div>
				</div>
			}
			<div className="md:hidden xl:block font-bold text-[14px]">
				{title}
			</div>
		</Link>
	);
}

interface HamburgerMenuProps {
	open: boolean;
	data: NavButtonProps[];
	onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
	open = false,
	data = [],
	onClose = () => console.error("Error: HamburgerMenu doesn't have onClose func!")
}) => {
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
			<div className="flex flex-col items-start justify-start gap-3
				p-4
				transition-transform duration-200
				w-full h-full
				border-l border-background/25
				bg-foreground"
				style={{
					transform: open ? "translateX(0px)" : "translateX(100%)",
					boxShadow: open ? "0px 0px 10px rgba(0,0,0,0.25)" : "none"
				}}
			>
				<div className="font-icon text-4xl text-background
					ml-auto"
					onClick={onClose}
				>
					
				</div>
				{
					data.map((value: NavButtonProps, index: number) => {
						return (
							<NavButton
								key={index}
								icon={value.icon}
								title={value.title}
								path={value.path}
							/>
						);
					})
				}
			</div>
		</div>
	);
}

const NavBar: React.FC = () => {
	const { t } = useTranslation("nav");

	const dataNavButton: NavButtonProps[] = [
		{ icon: "", title: t("button.home"), path: "/home" },
		{ icon: "", icon_size: 22, title: t("button.property"), path: "/property" },
		{ icon: "", icon_size: 34, title: t("button.ai"), path: "/ai" },
		{ icon: "󰍂", icon_size: 28, title: t("button.signIn"), path: "/sign-in" },
		{ icon: "󰆓", icon_size: 24, title: t("button.signUp"), path: "/sign-up" },
	]; // this data should be wrapped by a useState since the signIn and signUp will merge into profile once connected.
	const [openHamburger, setOpenHamburger] = useState<boolean>(false);

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
			<div className="grid grid-cols-[auto_1fr] grid-rows-1 place-items-center
				px-4 md:px-7 xl:px-64 py-3
				z-1
				w-full h-full"
			>
				<div className="font-higuen text-[46px] text-background justify-self-start
					translate-y-1"
				>
					{t("brand.name")}
				</div>

				<div className="flex items-center justify-center justify-self-end gap-3">
					<div className="md:flex items-center justify-center justify-self-end gap-3
						hidden"
					>
						{
							dataNavButton.map((value: NavButtonProps, index: number) => {
								return (
									<NavButton
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

					<select
						name="langage"
						onChange={(e) => {
							i18n.changeLanguage(e.target.value);
						}
						}
					>
						<option value="en">🇬🇧</option>
						<option value="fr">🇫🇷</option>
						<option value="es">🇪🇸</option>
					</select>

					<div className="block justify-self-end
						md:hidden
						font-icon text-background text-4xl"
						onClick={() => setOpenHamburger(true)}
					>
						
					</div>
				</div>

				<HamburgerMenu
					open={openHamburger}
					data={dataNavButton}
					onClose={() => setOpenHamburger(false)}
				/>

			</div>
		</div>
	);
}

export default NavBar;
