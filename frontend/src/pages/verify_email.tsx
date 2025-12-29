
import React from "react";
import SimpleInput, { PasswordInput } from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const VerifyEmailPage: React.FC = () => {
	const { t } = useTranslation("verifyEmail");

	return (
		<div className="text-background w-full h-screen overflow-y-scroll">
			<div
				className="flex flex-col items-center justify-center gap-3
				p-4
				w-full h-full"
			>
				<div
					className="flex flex-col items-center justify-center
					w-full max-w-100"
				>
					<div className="font-bold text-2xl">
						{t("header.title")}
					</div>

					<div className="font-thin text-md opacity-75 text-center">
						{t("header.subtitle", { brand: t("brand.name") })}
					</div>
				</div>

				<div
					className="w-full
					max-w-100
					mask-[linear-gradient(to_left,transparent,white_25%,white_75%,transparent)]
					mask-alpha"
				>
					<ContentDivider
						title_color="var(--color-background)"
						line_color="var(--color-background)"
					/>
				</div>

				<div
					className="flex flex-col items-center justify-center gap-3
						w-full
						max-w-100"
				>
					<Link to="/sign_in">
						<span className="text-[12px] font-bold
							hover:underline cursor-pointer"
						>
							{t("actions.back")}
						</span>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default VerifyEmailPage;
