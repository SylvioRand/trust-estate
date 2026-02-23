import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ContentDivider from "../components/ContentDivider";
import ActionButton from "../components/ActionButton";
import { toast } from "react-toastify";
import useCountdown from "../components/Countdown";
// import { VerifyUsersState } from "../hooks/VerifyUsersState";
import useDataProvider from "../provider/useDataProvider";

const EmailSentPage: React.FC = () => {
	const { t } = useTranslation(["emailSent", "error"]);
	const [processResend, setProcessResend] = useState<boolean>(false);
	const [processLogOut, setProcessLogOut] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [resendButtonDisabled, setResendButtonDisabled] = useState<boolean>(false);
	const navigate = useNavigate();
	const [timeLeft, setTimeLeft, controls] = useCountdown();
	const { setIsConnected, setUserData } = useDataProvider();

	const handleOnResend = async () => {
		setProcessResend(true);
		if (isLoading) {
			return;
		}
		setIsLoading(true);
		try {
			const response = await fetch("/api/auth/resend-email", {
				method: "POST",
				credentials: "include"
			})

			const data = await response.json();

			if (!response.ok) {
				if (data.error === "email_already_verified") {
					toast.error(t(`error:${data.message}`));
					navigate("/home");
				}
				else {
					if (data.message !== null)
						throw new Error(t(`${data.message}`));
				}
				throw new Error("");
			}

			toast.success(t("buttons.resendEmail.success"));

		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`));
		} finally {
			setProcessResend(false);
			setTimeLeft(60);
			controls.start();
			setResendButtonDisabled(true);

			setTimeout(() => {
				setResendButtonDisabled(false);
				setTimeLeft(0);
				controls.stop();
			}, 60000);
			setIsLoading(false);
		}
	}

	const handleOnLogOut = async () => {
		setProcessLogOut(true);

		try {
			await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include"
			});
		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`));
		} finally {
			setIsConnected(false);
			setUserData(null);
			navigate("/home");
			setProcessLogOut(false);
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

				<div className="flex flex-col items-center justify-center gap-4">
					<ol className="list-disc pl-3">
						<li>{t("steps.one")}</li>
						<li>{t("steps.two")}</li>
						<li>{t("steps.three")}</li>
						<li>{t("steps.four")}</li>
					</ol>

					<ActionButton
						icon=""
						icon_place="right"
						title={t("buttons.resendEmail.title")}
						processing_action={processResend}
						onClick={handleOnResend}
						disabled={resendButtonDisabled}
					/>

					<ActionButton
						icon="󰍃"
						icon_place="right"
						title={t("buttons.logOut.title")}
						processing_action={processLogOut}
						onClick={handleOnLogOut}
					/>


					{
						timeLeft > 0 &&
						<div className="text-sm font-light">
							{t("buttons.resendEmail.timeLeft")}{` ${timeLeft}`}
						</div>
					}
				</div>

			</div>
		</div>
	);
};

export default EmailSentPage;
