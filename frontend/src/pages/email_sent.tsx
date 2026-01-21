import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingPage from "./loading";
import ContentDivider from "../components/ContentDivider";
import ActionButton from "../components/ActionButton";
import { toast } from "react-toastify";
import useCountdown from "../components/Countdown";

const EmailSentPage: React.FC = () => {
	const	{ t } = useTranslation(["emailSent", "error"]);
	const	[processResend, setProcessResend] = useState<boolean>(false);
	const	[processLogOut, setProcessLogOut] = useState<boolean>(false);
	const	[resendButtonDisabled, setResendButtonDisabled] = useState<boolean>(false);
	const	navigate = useNavigate();
	const	[timeLeft, setTimeLeft, controls] = useCountdown();

	const	handleOnResend = async () => {
		setProcessResend(true);

		try {
			const	response = await fetch("/api/auth/resend-email", {
				method: "POST",
				credentials: "include"
			})

			const	data = await response.json();

			if (!response.ok)
			{
				toast.error(t("error:global.500"));
				throw new Error("Internal Server Error");
			}

			toast.success(t("buttons.resendEmail.success"));

		} catch (error) {
			if (error instanceof Error)
				console.error("EmailSentPage: ", error.message);
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
		}
	}

	const	handleOnLogOut = async () => {
		setProcessLogOut(true);

		try {
			const	response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include"
			});
		} catch (e) {
			console.error("EmailSentPage: handleOnLogOut: error logging out.");
		} finally {
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
						<li>{ t("steps.one") }</li>
						<li>{ t("steps.two") }</li>
						<li>{ t("steps.three") }</li>
						<li>{ t("steps.four") }</li>
					</ol>

					<ActionButton
						icon=""
						icon_place="right"
						title={ t("buttons.resendEmail.title") }
						processing_action={ processResend }
						onClick={ handleOnResend }
						disabled={ resendButtonDisabled }
					/>

					<ActionButton
						icon="󰍃"
						icon_place="right"
						title={ t("buttons.logOut.title") }
						processing_action={ processLogOut }
						onClick={ handleOnLogOut }
					/>


					{
						timeLeft > 0 &&
						<div className="text-sm font-light">
							{ t("buttons.resendEmail.timeLeft") }{` ${timeLeft}`}
						</div>
					}
				</div>

			</div>
		</div>
	);
};

export default EmailSentPage;
