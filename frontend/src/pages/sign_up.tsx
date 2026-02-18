import React, { useState, useEffect } from "react";
import SimpleInput, { PasswordInput } from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { VerifyUsersState } from "../hooks/VerifyUsersState";
import useDataProvider from "../provider/useDataProvider";
import PhoneInput from "../components/PhoneInput";

export type APIResponse = {
	error: string;
	message: string;
	details?: Record<string, string[]>;
}

const SignUpPage: React.FC = () => {
	const { t } = useTranslation(["signUp", "error"]);
	const navigate = useNavigate();
	const [processSignUp, setProcessSignUp] = useState<boolean>(false);
	const [errorEmail, setErrorEmail] = useState<string[]>([]);
	const [errorPhone, setErrorPhone] = useState<string[]>([]);
	const [errorFirstName, setErrorFirstName] = useState<string[]>([]);
	const [errorLastName, setErrorLastName] = useState<string[]>([]);
	const [errorPassword, setErrorPassword] = useState<string[]>([]);

	const { isConnected, setIsConnected } = useDataProvider();

	const location = useLocation();

	useEffect(() => {
		if (isConnected === true) {
			const from = location.state?.from || "/profile";
			navigate(from, { replace: true });
		}
	}, [isConnected, navigate, location.state?.from]);

	VerifyUsersState();

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setProcessSignUp(true);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries()) as Record<string, string>;

		// Reset all error first
		setErrorEmail([]);
		setErrorPhone([]);
		setErrorFirstName([]);
		setErrorLastName([]);
		setErrorPassword([]);

		try {
			data.phone = data.phoneCountryCode + data.phone;
			delete data.phoneCountryCode;

			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-type": "application/json"
				},
				body: JSON.stringify(data)
			})

			const responseData = await response.json();

			if (!response.ok) {
				const errorData = responseData as APIResponse;

				if (errorData.error === "email_exists") {
					setErrorEmail([errorData.message]);
					throw new Error("auth.email_already_exists");
				}
				else if (errorData.error === "phone_exists") {
					setErrorPhone([errorData.message]);
					throw new Error("auth.phone_already_exists");
				}
				else if (errorData.error === "validation_failed") {
					if (errorData.details && typeof errorData.details === "object") {
						const entries = Object.entries(errorData.details) as [string, string | string[]][];

						for (const [key, value] of entries) {
							let tmp: string[] = Array.isArray(value) ? value : [value];

							if (tmp.length === 0) continue;


							if (key === "email") {
								setErrorEmail(tmp);
							}
							else if (key === "firstName") {
								setErrorFirstName(tmp);
							}
							else if (key === "lastName") {
								setErrorLastName(tmp);
							}
							else if (key === "password") {
								setErrorPassword(tmp);
							}
							else if (key === "phone") {
								setErrorPhone(tmp);
							}
						}
					}
					throw new Error("Invalid Request.");
				}
				else if (errorData.error === "rate_limited") {
					throw new Error("common.rate_limited");
				}
			}

			setIsConnected(true);
			navigate("/email-sent");

		} catch (error) {
			if (error instanceof Error && error.message !== "")
				toast.error(t(`error:${error.message}`))
		} finally {
			setProcessSignUp(false);
		}
	}

	const [googleProcessing, setgoogleProcessing] = useState<boolean>(false);

	const triggerGoogleLogin = () => {
		setgoogleProcessing(true);

		window.location.href = '/api/auth/google';
		setgoogleProcessing(false);
	};

	return (
		<div className="text-background w-full h-screen overflow-y-scroll">
			<div
				className="flex flex-col items-center justify-start md:justify-center gap-3
				xl:flex-row
				p-4
				w-full h-full"
			>
				<div className="w-full h-12
					block md:hidden
					flex-none"
				>
				</div>

				<div
					className="flex flex-col items-start justify-center
					xl:items-end
					w-full max-w-100"
				>
					<div className="font-higuen font-bold text-2xl">
						{t("header.title")}
					</div>

					<div className="text-md opacity-75">
						{t("header.subtitle", { brand: t("brand.name") })}
					</div>
				</div>

				<div
					className="hidden xl:block h-150
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
						max-w-100"
					onSubmit={handleOnSubmit}
				>
					<div className="grid grid-cols-2 grid-rows-1 gap-3">
						<SimpleInput
							icon=""
							title={t("form.firstName.label")}
							name="firstName"
							placeholder={t("form.firstName.placeholder")}
							minLength={3}
							maxLength={50}
							error={errorFirstName}
						/>

						<SimpleInput
							title={t("form.lastName.label")}
							name="lastName"
							minLength={3}
							maxLength={50}
							placeholder={t("form.lastName.placeholder")}
							error={errorLastName}
						/>
					</div>

					<PhoneInput
						title={t("form.phone.label")}
						name="phone"
						nameCountryCode="phoneCountryCode"
						placeholder="XX XX XXX XX"
						maxLength={9}
						error={errorPhone}
					/>

					<SimpleInput
						icon="󰇮"
						title={t("form.email.label")}
						name="email"
						type="email"
						placeholder={t("form.email.placeholder")}
						error={errorEmail}
					/>

					<PasswordInput
						title={t("form.password.label")}
						name="password"
						placeholder={t("form.password.placeholder")}
						error={errorPassword}
						pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$"
					/>
					<div
						className="flex items-center justify-start w-full"
					>
						<div
							className="text-left font-light text-[12px]"
						>
							{t("form.password.notice")}
						</div>
					</div>

					<div className="mt-2 w-full">
						<ActionButton
							title={t("actions.createAccount")}
							icon=""
							icon_place="right"
							type="submit"
							processing_action={processSignUp}
						/>
					</div>

					<div className="text-[12px]">
						{t("legal.accept")}{" "}
						<span
							className="underline cursor-pointer font-bold"
							onClick={() => navigate("/terms-of-service")}
						>
							{t("legal.terms")}
						</span>{" "}
						{t("legal.and")}{" "}
						<span
							className="underline cursor-pointer font-bold"
							onClick={() => navigate("/privacy-policy")}
						>

							{t("legal.privacy")}
						</span>
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
						type="button"
						onClick={triggerGoogleLogin}
						processing_action={googleProcessing}
					/>

					<div
						className="flex items-center justify-center gap-1
						text-[12px]
						w-full mb-4"
					>
						{t("footer.alreadyHaveAccount")}
						<Link to="/sign-in">
							<span className="underline cursor-pointer font-bold">
								{t("footer.signIn")}
							</span>
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}

export default SignUpPage;
