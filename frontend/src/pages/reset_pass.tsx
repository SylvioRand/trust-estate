import React, { useState } from "react";
import { PasswordInput } from "../components/Input";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { passwordRules } from "../const/constant";
import { apiFetch } from "../utils/fetchWithoutConsoleError";

const ResetPassPage: React.FC = () => {
	const { t } = useTranslation(["resetPass", "error"]);
	const navigate = useNavigate();
	const [errorPassword, setErrorPassword] = useState<string[]>([]);
	const [processingSubmit, setProcessingSubmit] = useState<boolean>(false);
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		// NOTE: If there is no token in the query, just redirect to sign-in
		if (token === null) {
			toast.error(t(`error:ERROR`));
			navigate("/sign-in");
			return;
		}

		e.preventDefault();
		setProcessingSubmit(true);
		setErrorPassword([]);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries());

		data.token = token ?? "";
		if (data.newPassword !== data.confirmPassword) {
			setErrorPassword([t("auth.passwordAndConfirmationIsDifferent")]);
			setProcessingSubmit(false);
			return;
		}

		delete data.confirmPassword;

		try {
			const { error, message, data: responseData } = await apiFetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-type": "application/json" },
				body: JSON.stringify(data)
			});

			if (error) {
				toast.error(t(`error:${message ?? "auth.invalid_or_expired_token"}`));
				navigate("/sign-in");
				return;
			}
			toast.success(t(`error:${(responseData as any)?.message ?? "success"}`));
			navigate("/sign-in", { state: { fromResetPass: true } });
		} catch (error) {
			if (error instanceof Error && error.message !== "") {
				toast.error(t(`error:${error.message}`));
			}
		} finally {
			setProcessingSubmit(false);
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
					<PasswordInput
						title={t("form.password.label")}
						name="newPassword"
						placeholder={t("form.password.placeholder")}
						error={errorPassword}
						pattern={passwordRules}
					/>

					<PasswordInput
						title={t("form.confirm.label")}
						name="confirmPassword"
						placeholder={t("form.password.placeholder")}
						error={errorPassword}
					/>

					<div className="mt-2 w-full">
						<ActionButton
							title={t("actions.change")}
							icon=""
							icon_place="right"
							type="submit"
							processing_action={processingSubmit}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}

export default ResetPassPage;
