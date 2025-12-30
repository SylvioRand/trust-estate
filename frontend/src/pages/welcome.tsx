import React from "react";
import { useTranslation } from "react-i18next";
import ActionButton from "../components/ActionButton";
import { Link } from "react-router-dom";
import ContentDivider from "../components/ContentDivider";

const	WelcomePage: React.FC = () => {
	const	{ t } = useTranslation("welcome");

	return (
		<div className="flex items-center justify-center
			relative
			overflow-hidden
			w-full h-screen"
		>

			<div className="animate-fade-in
				absolute"
				style={{
					opacity: "0%",
					animationDelay: "300ms"
				}}
			>
				<div className="bg-accent
					rounded-full
					flex items-center justify-center
					blur-3xl
					animate-random-translation
					w-100 aspect-square"
				>
					<div className="bg-foreground
						rounded-full
						w-70 aspect-square"
					>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center justify-center gap-3
				p-4
				text-center
				relative
				w-full h-full"
			>
				<div className="animate-fade-in">
					<h1 className="font-higuen text-4xl font-bold
						animate-from-top"
					>
						{ t("header.title") }
					</h1>
				</div>
				<div className="animate-fade-in max-w-200"
					style={{
						opacity: "0%",
						animationDelay: "300ms"
					}}
				>
					<h3 className="animate-from-top"
						style={{
							animationDelay: "300ms"
						}}
					>
						{ t("header.content") }
					</h3>
				</div>

				<div className="animate-fade-in max-w-75 w-full"
					style={{
						opacity: "0%",
						animationDelay: "500ms"
					}}
				>
					<Link
						className="w-full max-w-75
						animate-from-top"
						style={{
							animationDelay: "600ms"
						}}
						to="/home"
					>
						<ActionButton
							icon=""
							icon_place="right"
							title={ t("button.startNow") }
						/>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default WelcomePage;
