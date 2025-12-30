import React, { useState } from "react";
import SimpleInput, { PasswordInput } from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

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


	const debugURL = [
		"https://mock.apidog.com/m1/1162080-1155411-default/register", // 200 Success [OK]
		"https://mock.apidog.com/m1/1162080-1155411-default/register?apidogResponseId=183293900", // 400 Email Exists [OK]
		"https://mock.apidog.com/m1/1162080-1155411-default/register?apidogResponseId=156854327", // 400 Phone Exists [OK]
		"https://mock.apidog.com/m1/1162080-1155411-default/register?apidogResponseId=156281196", // 400 Validation [OK]
		"https://mock.apidog.com/m1/1162080-1155411-default/register?apidogResponseId=119839537" // 429 Rate Limiting [OK]
	]

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setProcessSignUp(true);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		// Reset all error first
		setErrorEmail([]);
		setErrorPhone([]);
		setErrorFirstName([]);
		setErrorLastName([]);
		setErrorPassword([]);

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-type": "application/json"
				},
				body: JSON.stringify(data)
			})

			const responseData = await response.json();
			console.log("Response Body:", responseData);

			if (!response.ok) {
				const errorData = responseData as APIResponse;

				if (errorData.error === "email_exists") {
					setErrorEmail(["error:" + errorData.message]);
					throw new Error("Email already in used.");
				}
				else if (errorData.error === "phone_exists") {
					setErrorPhone(["error:" + errorData.message]);
					throw new Error("Phone already in used.");
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
					toast.error(t("error:" + errorData.message));
					throw new Error("Rate Limited.");
				}
			}

			navigate("/verify-email-notice");

		} catch (error) {
			console.error("Error: ", error);
		} finally {
			setProcessSignUp(false);
		}
	}

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
							error={errorFirstName}
						/>

						<SimpleInput
							title={t("form.lastName.label")}
							name="lastName"
							placeholder={t("form.lastName.placeholder")}
							error={errorLastName}
						/>
					</div>

					<SimpleInput
						icon="󰏲"
						title={t("form.phone.label")}
						name="phone"
						type="tel"
						placeholder={t("form.phone.placeholder")}
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
						<span className="underline cursor-pointer font-bold">
							{t("legal.terms")}
						</span>{" "}
						{t("legal.and")}{" "}
						<span className="underline cursor-pointer font-bold">
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
						type="submit"
					/>

					<div
						className="flex items-center justify-center gap-1
						text-[12px]
						w-full mb-4"
					>
						{t("footer.alreadyHaveAccount")}
						<Link to="/sign_in">
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
