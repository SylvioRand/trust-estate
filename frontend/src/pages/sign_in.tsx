import React, { useState, useEffect } from "react";
import SimpleInput, { PasswordInput } from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type APIResponse } from "./sign_up";
import { toast } from "react-toastify";
import useDataProvider from "../provider/useDataProvider";
import { VerifyUsersState } from "../hooks/VerifyUsersState";

const SignInPage: React.FC = () => {
	const { t } = useTranslation(["signIn", "error"]);
	const navigate = useNavigate();
	const [processSignIn, setProcessSignIn] = useState(false);
	const [errorEmail, setErrorEmail] = useState<string[]>([]);
	const [errorPassword, setErrorPassword] = useState<string[]>([]);
	const [googleProcessing, setgoogleProcessing] = useState<boolean>(false);
	const { isConnected } = useDataProvider();

	const location = useLocation();

	VerifyUsersState();
	useEffect(() => {
		if (isConnected === true) {
			const from = location.state?.from || "/profile";
			navigate(from, { replace: true });
		}
	}, [isConnected, navigate, location.state?.from]);

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setProcessSignIn(true);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());
		try {
			const response = await fetch("https://localhost:8443/api/auth/login", {
				method: "POST",
				headers: {
					"Content-type": "application/json"
				},
				body: JSON.stringify(data)
			})

			const responseData = await response.json();

			if (!response.ok) {
				const errorData = responseData as APIResponse;


				if (response.status === 403) {
					if (errorData.error === "email_not_verified") {
						navigate("/email-sent");
					}
					else if (errorData.error === "phone_not_verified") {
						navigate("/add-phone");
					}
				}
				else if (response.status === 400) {
					setErrorEmail([t(errorData.message)])
					setErrorPassword([t(errorData.message)])
					toast.error(t("error:" + errorData.message));
					throw new Error("");
				}
				else if (response.status === 429) {
					throw new Error("");
				}
			}

			setErrorEmail([]);
			setErrorPassword([]);
			const from = location.state?.from;

			if (from) {
				navigate(from, { replace: true });
			} else {
				const canGoBack = window.history.state && window.history.state.idx > 0;

				if (canGoBack) {
					navigate(-1);
				} else {
					navigate("/home", { replace: true });
				}
			}
		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`))
		} finally {
			setProcessSignIn(false);
		}
	}

	const triggerGoogleLogin = () => {
		const from = location.state?.from;
		setgoogleProcessing(true);
		if (from) {
			window.location.href = '/api/auth/google?fallback=' + encodeURIComponent(from);
		}
		else
			window.location.href = '/api/auth/google';
		setgoogleProcessing(false);
	};

	return (
		<div className="text-background w-full h-screen overflow-y-scroll relative">
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

					<div className="font-inter text-md opacity-75">
						{t("header.subtitle", { brand: t("brand.name") })}
					</div>
				</div>

				<div
					className="hidden xl:block h-100
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

					<div
						className="flex flex-col items-center justify-center
						w-full"
					>
						<PasswordInput
							title={t("form.password.label")}
							name="password"
							placeholder={t("form.password.placeholder")}
							error={errorPassword}
						/>

						<Link className="mr-auto" to="/sign-in/forgot-pass">
							<span className="hover:underline cursor-pointer font-bold text-[12px]">
								{t("form.forgotPassword")}
							</span>
						</Link>
					</div>

					<div className="mt-2 w-full">
						<ActionButton
							title={t("actions.connect")}
							icon=""
							icon_place="right"
							type="submit"
							processing_action={processSignIn}
						/>
					</div>

					<div
						className="w-full
						mask-[linear-gradient(to_left,transparent,white_25%,white_75%,transparent)]
						mask-alpha"
					>
						<ContentDivider
							title={t("actions.or")}
							title_color="var(--color-background)"
							line_color="var(--color-background)"
						/>
					</div>

					<ActionButton
						title={t("actions.continueWithGoogle")}
						icon=""
						disabled={false}
						onClick={triggerGoogleLogin}
						processing_action={googleProcessing}
					/>

					<div
						className="flex items-center justify-center gap-1
						text-[12px]
						w-full mb-4"
					>
						{t("footer.noAccount")}
						<Link to="/sign-up">
							<span className="underline cursor-pointer font-bold">
								{t("footer.signUp")}
							</span>
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}

export default SignInPage;
