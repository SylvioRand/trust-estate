import React, { useEffect, useState } from "react";
import { useSearchParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingPage from "./loading";
import ContentDivider from "../components/ContentDivider";
import ActionButton from "../components/ActionButton";
import { toast } from "react-toastify";

const	debugURL: string[] = [
	"https://mock.apidog.com/m1/1162080-1155411-default/auth/resend-verification", // 201 Success
	"https://mock.apidog.com/m1/1162080-1155411-default/auth/resend-verification?apidogResponseId=139669037", // 429 Rate Limited
]

const VerifyEmailPage: React.FC = () => {
	const	{ t } = useTranslation("verifyEmail");
	const	[processResend, setProcessResend] = useState<boolean>(false);
	const	[processLogOut, setProcessLogOut] = useState<boolean>(false);
	const	[resendButtonDisabled, setResendButtonDisabled] = useState<boolean>(false);
	const	navigate = useNavigate();

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
				throw new Error("Invalid or Expired Token");
			}

			toast.success(t("buttons.resendEmail.success"));

		} catch (e) {
			console.error("VerifyEmailPage: ", e);
		} finally {
			setProcessResend(false);
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
			console.error("VerifyEmailPage: handleOnLogOut: error logging out.");
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
				</div>

			</div>
		</div>
	);
};

export default VerifyEmailPage;
