import React from "react";
import SimpleInput from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const	ForgotPassPage: React.FC = () => {
	const { t } = useTranslation("forgotPass");

	const	handleOnSubmit = (e:React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const	formData = new FormData(e.currentTarget);

		const	data = Object.fromEntries(formData.entries());

		console.log(data);
	}

	return (
		<div className="text-background w-full h-screen overflow-y-scroll">
			<div
				className="flex flex-col items-center justify-center gap-3
				xl:flex-row
				p-4
				w-full h-full"
			>
				<div
					className="flex flex-col items-start justify-center
					xl:items-end
					w-full max-w-100"
				>
					<div className="font-higuen font-bold text-2xl">
						{t("header.title")}
					</div>

					<div className="text-md opacity-75 xl:text-right">
						{t("header.subtitle", { brand: t("brand.name") })}
					</div>
				</div>

				<div
					className="hidden xl:block h-60
					opacity-75
					mx-3
					mask-[linear-gradient(to_top,transparent,white_25%,white_85%,transparent)]
					mask-alpha"
				>
					<ContentDivider
						orientation="vertical"
						line_color="var(--color-background)"
					/>
				</div>

				<form
					className="flex flex-col items-center justify-center gap-3
						w-full
						max-w-100"
					onSubmit={handleOnSubmit}
				>
					<SimpleInput
						icon="󰇮"
						title={t("form.email.label")}
						name="email"
						type="email"
						placeholder={t("form.email.placeholder")}
						error={[]}
					/>

					<div className="mt-2 w-full">
						<ActionButton
							title={t("actions.send")}
							icon=""
							icon_place="right"
							type="submit"
						/>
					</div>

					<Link to="/sign_in">
						<span className="text-[12px] font-bold
							hover:underline cursor-pointer"
						>
						{t("actions.cancel")}
						</span>
					</Link>
				</form>
			</div>
		</div>
	);
}

export default ForgotPassPage;
