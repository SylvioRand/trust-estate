import React from "react";
import { useTranslation } from "react-i18next";
import house0 from "../../src/images/house0.webp";
import house1 from "../../src/images/house1.webp";
import house2 from "../../src/images/house2.webp";
import house3 from "../../src/images/house3.webp";
import { VerifyUsersState } from "../hooks/VerifyUsersState";

interface CardProps {
	icon: string;
	title: string;
	content: string;
}

const	Card: React.FC<CardProps> = ({
	icon = "X",
	title = "Title",
	content = "Content"
}) => {
	return (
		<div className="grid grid-cols-1 grid-rows-[auto_1fr]
			transition-transform duration-200
			hover:-translate-y-4
			border border-background/25
			ease-in-out
			rounded-xl
			shadow-xl
			p-4
			w-full h-63"
		>

			<div className="grid grid-cols-[auto_1fr] grid-rows-1
				w-full"
			>
				<div className="font-higuen font-bold text-xl w-full">
					{ title }
				</div>
				<div className="flex items-center justify-center
					ml-auto
					relative
					w-5 h-5"
				>
					<div className="absolute
						bg-linear-to-t from-[color-mix(in_srgb,var(--color-foreground)_25%,var(--color-accent))] via-[color-mix(in_srgb,var(--color-foreground)_25%,var(--color-accent))] to-accent
						bg-clip-text
						text-transparent
						font-icon text-4xl"
					>
						{ icon }
					</div>
				</div>
			</div>

			<div className="font-inter font-light text-md mt-auto"
			>
				{ content }
			</div>
		</div>
	);
}

interface DataAboutUsProps {
	title: string;
	value: string;
}

const	DataAbousUs: React.FC<DataAboutUsProps> = ({
	title = "Title",
	value = "2+"

}) => {
	return (
		<div className="flex flex-col items-center justify-center">
			<div className="font-bold text-3xl
				mr-auto ml-0 xl:ml-auto xl:mr-0
				bg-linear-to-t from-[color-mix(in_srgb,var(--color-foreground)_25%,var(--color-accent))] via-[color-mix(in_srgb,var(--color-foreground)_25%,var(--color-accent))] to-accent
				bg-clip-text
				text-transparent">
				{ value }
			</div>
			<div className="font-light text-sm">
				{ title }
			</div>
		</div>
	)
}

const	HomePage: React.FC = () => {
	const	{ t } = useTranslation("home");

	const	statsData: DataAboutUsProps[] = [
		{ title: t("aboutUs.stats.0"), value: "24/7" },
		{ title: t("aboutUs.stats.1"), value: "42+" },
		{ title: t("aboutUs.stats.2"), value: "4.8/5" },
		{ title: t("aboutUs.stats.3"), value: "7+" }
	]

	const	cardData: CardProps[] = [
		{ icon: "󰓎", title: t("aboutUs.card.AI.title"), content: t("aboutUs.card.AI.content") },
		{ icon: "󰄬", title: t("aboutUs.card.verifiedProperty.title"), content: t("aboutUs.card.verifiedProperty.content") },
		{ icon: "", title: t("aboutUs.card.accurateValuation.title"), content: t("aboutUs.card.accurateValuation.content") },
		{ icon: "󰥔", title: t("aboutUs.card.instantNotification.title"), content: t("aboutUs.card.instantNotification.content") }
	]
	VerifyUsersState();
	return (
		<div className="flex flex-col items-center justify-start gap-4
			overflow-y-scroll
			relative
			pointer-events-auto
			w-full h-screen"
		>

			<div className="w-full h-15
				block xl:hidden
				flex-none"
			>
			</div>

			<div className="flex flex-col items-center justify-start
				flex-none
				xl:grid xl:grid-cols-2 xl:grid-rows-1
				gap-7
				place-items-center
				xl:h-full
				p-4"
			>


				<div className="grid grid-cols-2 grid-rows-1 gap-4
					justify-self-center xl:justify-self-start
					w-auto h-auto
					order-1 xl:order-2"
				>
					<div className="flex flex-col items-center justify-self-center gap-4
						xl:-translate-y-3
						xl:max-w-70"
					>
						<img
							className="w-full rounded-xl shadow-2xl"
							alt="Picture of a modern house"
							src={ house0 }
						/>

						<img
							className="w-full rounded-xl shadow-2xl"
							alt="Picture of a modern house"
							src={ house2 }
						/>
					</div>
					<div className="flex flex-col items-center justify-self-center gap-4
						xl:translate-y-3
						xl:max-w-70"
					>
						<img
							className="w-full rounded-xl shadow-2xl"
							alt="Picture of a modern house"
							src={ house1 }
						/>

						<img
							className="w-full rounded-xl shadow-2xl"
							alt="Picture of a modern house"
							src={ house3 }
						/>
					</div>
				</div>

				<div className="flex flex-col items-center justify-center gap-4
					xl:grid xl:grid-cols-1 xl:grid-rows-2 xl:h-[30%]
					place-items-center
					order-2 xl:order-1"
				>
					<div className="flex flex-col items-start xl:items-end justify-center gap-4
						justify-self-center xl:justify-self-end
						xl:max-w-145
						xl:text-right"
					>
						<div className="font-higuen font-bold text-[42px] leading-tight
							bg-linear-to-t from-[color-mix(in_srgb,var(--color-foreground)_25%,var(--color-background))] to-background
							bg-clip-text text-transparent
							">
							{ t("header.title") }
						</div>
						<div className="font-inter font-light text-md">
							{ t("header.subtitle") }
						</div>


					</div>

					<div className="grid grid-cols-2 grid-rows-2
						my-4
						md:grid-cols-4 md:grid-rows-1
						w-full
						gap-4
						place-items-start
						xl:place-items-end"
					>
						{ statsData.map((value: DataAboutUsProps, index: number) => {
							return (
								<DataAbousUs
									key={ index }
									title={ value.title }
									value={ value.value }
								/>
							);
						})}
					</div>
				</div>

			</div>

			<div className="flex flex-col items-center justify-center gap-12
				px-4 py-12
				shadow-[0px_0px_7px_rgba(0,0,0,0.25)]
				flex-none
				bg-foreground border-y border-background/25
				w-full"
			>
				<div className="flex flex-col items-center justify-center">
					<div className="font-higuen font-bold text-3xl">
						{ t("aboutUs.whyUs.title") }
					</div>
					
					<div className="font-inter font-light text-md">
						{ t("aboutUs.whyUs.reason") }
					</div>
				</div>

				<div className="flex flex-col items-center justify-evenly
					md:grid md:grid-cols-2 md:grid-rows-2
					xl:flex xl:flex-row 
					gap-8
					max-w-350
					w-full"
				>
					{
						cardData.map((value: CardProps, index: number) => {
							return (
								<Card
									key={ index }
									icon = { value.icon }
									title = { value.title }
									content = { value.content }
								/>
							);
						})
					}
				</div>

			</div>

			<div className="w-full h-50 flex-none">
			</div>


		</div>
	);
}

export default HomePage;
