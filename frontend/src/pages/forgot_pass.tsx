import React, { useState } from "react";
import SimpleInput from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useCountdown from "../components/Countdown";
import type { APIResponse } from "./sign_up";
import { toast } from "react-toastify";

const ForgotPassPage: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation(["forgotPass", "error"]);
	const [timeLeft, setTimeLeft, controls] = useCountdown();
	const [processingSubmit, setProcessingSubmit] = useState<boolean>(false);
	const [buttonSendDisabled, setButtonSendDisabled] = useState<boolean>(false);
	const [errorEmail, setErrorEmail] = useState<string[]>([]);

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setProcessingSubmit(true);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-type": "application/json"
				},
				body: JSON.stringify(data)
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorData = responseData as APIResponse;

				if (response.status === 400) {
					setErrorEmail([errorData.message]);
					throw new Error(errorData.message);
				}
			}
			toast.success(t("notification.emailSent"));
		} catch (error) {
			if (error instanceof Error && error.message !== "") {
				toast.error(t(`error:${error.message}`));
			}
		} finally {
			setProcessingSubmit(false);
			setTimeLeft(60);
			controls.start();
			setButtonSendDisabled(true);

			setTimeout(() => {
				setButtonSendDisabled(false);
				setTimeLeft(0);
				controls.stop();
			}, 60000);
		}
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
						error={errorEmail}
					/>

					<div className="mt-2 w-full">
						<ActionButton
							title={t("actions.send")}
							icon=""
							icon_place="right"
							type="submit"
							processing_action={processingSubmit}
							disabled={buttonSendDisabled}
						/>
					</div>

					{
						timeLeft > 0 &&
						<div
							className="text-sm"
						>
							{t("countdownMessage") + timeLeft}
						</div>
					}

					<Link to="/sign-in">
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
