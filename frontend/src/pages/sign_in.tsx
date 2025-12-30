import React, { useState } from "react";
import SimpleInput, { PasswordInput } from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type APIResponse } from "./sign_up";
import { toast } from "react-toastify";
import GoogleActionButton from "../components/GoogleButton";

const SignInPage: React.FC = () => {
	const { t } = useTranslation(["signIn", "error"]);
	const navigate = useNavigate();
	const [processSignIn, setProcessSignIn] = useState(false);
	const [errorEmail, setErrorEmail] = useState<string[]>([]);
	const [errorPassword, setErrorPassword] = useState<string[]>([]);

	const debugURL = [
		"https://mock.apidog.com/m1/1162080-1155411-default/auth/login", // 200 Success [OK]
		"https://mock.apidog.com/m1/1162080-1155411-default/auth/login?apidogResponseId=179970236", // 400 Email Not Verified [OK]
		"https://mock.apidog.com/m1/1162080-1155411-default/auth/login?apidogResponseId=190854310", // 400 Invalid Credentials [OK]
		"https://mock.apidog.com/m1/1162080-1155411-default/auth/login?apidogResponseId=166620922", // 429 Rate Limiting [KO]
	]

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setProcessSignIn(true);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());


		try {
			// const baseUrl: string = p		try {
			console.log("Here we are");
			const response = await fetch("/api/auth/login", {
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


				if (response.status === 403) {
					navigate("/verify_email");
					throw new Error("Email Verification.");
				}
				else if (response.status === 400) {
					setErrorEmail([t(errorData.message)])
					setErrorPassword([t(errorData.message)])
					toast.error(t("error:" + errorData.message));
					throw new Error("Invalid credentials");
				}
				else if (response.status === 429) {
					toast.error(t("error:" + errorData.message));
					throw new Error("Rate Limiting");
				}
			}

			setErrorEmail([]);
			setErrorPassword([]);
			navigate("/home");

		} catch (error) {
			console.error("Error: ", error);
		} finally {
			setProcessSignIn(false);
		}
	}

	const	[googleButtonDisabled, setgoogleButtonDisabled] = useState<boolean>(true);
	const	[googleProcessing, setgoogleProcessing] = useState<boolean>(false);

    const triggerGoogleLogin = () => {
		setgoogleProcessing(true);

		if (googleButtonDisabled)
		{
			setgoogleProcessing(false);
			return;
		}
		setgoogleProcessing(false);
		window.location.href = '/api/auth/google';
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
						{ t("header.title") }
					</div>

					<div className="font-inter text-md opacity-75">
						{ t("header.subtitle", { brand: t("brand.name") }) }
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
						title={ t("form.email.label") }
						name="email"
						type="email"
						placeholder={ t("form.email.placeholder") }
						error={errorEmail}
					/>

					<div
						className="flex flex-col items-center justify-center
						w-full"
					>
						<PasswordInput
							title={ t("form.password.label") }
							name="password"
							placeholder={ t("form.password.placeholder") }
							error={ errorPassword }
						/>

						<Link className="mr-auto" to="/forgot-pass">
							<span className="hover:underline cursor-pointer font-bold text-[12px]">
								{ t("form.forgotPassword") }
							</span>
						</Link>
					</div>

					<div className="mt-2 w-full">
						<ActionButton
							title={ t("actions.connect") }
							icon=""
							icon_place="right"
							type="submit"
							processing_action={ processSignIn }
						/>
					</div>

					<div
						className="w-full
						mask-[linear-gradient(to_left,transparent,white_25%,white_75%,transparent)]
						mask-alpha"
					>
						<ContentDivider
							title={ t("actions.or") }
							title_color="var(--color-background)"
							line_color="var(--color-background)"
						/>
					</div>

					<ActionButton
						title={ t("actions.continueWithGoogle") }
						icon=""
						disabled={ googleButtonDisabled }
						onClick={ triggerGoogleLogin }
						processing_action={ googleProcessing }
					/>

					<div
						className="flex items-center justify-center gap-1
						text-[12px]
						w-full mb-4"
					>
						{ t("footer.noAccount") }
						<Link to="/sign-up">
							<span className="underline cursor-pointer font-bold">
								{ t("footer.signUp") }
							</span>
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}

export default SignInPage;
