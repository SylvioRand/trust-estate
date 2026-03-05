import React, { useState } from "react";
import ActionButton from "../components/ActionButton";
import ContentDivider from "../components/ContentDivider";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "../components/PhoneInput";
import { toast } from "react-toastify";
import { VerifyUsersState } from "../hooks/VerifyUsersState";
import useDataProvider from "../provider/useDataProvider";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { apiFetch } from "../utils/fetchWithoutConsoleError";

const AddPhonePage: React.FC = () => {
	const { t } = useTranslation(["addPhone", "error"]);
	const [processingSubmit, setProcessingSubmit] = useState<boolean>(false);
	const [errorPhone, setErrorPhone] = useState<string[]>([]);
	const navigate = useNavigate();
	const { isConnected, userData } = useDataProvider();

	const location = useLocation();

	useEffect(() => {
		if ((isConnected !== null && isConnected === false) ||
			userData?.phoneVerified) {
			const from = location.state?.from || "/home";
			navigate(from, { replace: true });
		}
	}, [isConnected, userData?.phoneVerified, navigate, location.state?.from]);

	VerifyUsersState();

	const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setProcessingSubmit(true);

		const formData = new FormData(e.currentTarget);

		const data = Object.fromEntries(formData.entries()) as Record<string, string>;

		data.phoneNumber = data.phoneCountryCode + data.phoneNumber;

		delete data.phoneCountryCode;

		const { error, message } = await apiFetch("/api/users/me/phone", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		});

		if (error) {
			setErrorPhone([message ?? error]);
			toast.error(t(`error:${message ?? error}`));
			setProcessingSubmit(false);
			return;
		}

		toast.success(t("notif.success"));
		navigate("/home");
		setProcessingSubmit(false);
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
					<PhoneInput
						title={t("form.phone.label")}
						name="phoneNumber"
						nameCountryCode="phoneCountryCode"
						placeholder="XX XX XXX XX"
						error={errorPhone}
					/>

					<div className="mt-2 w-full">
						<ActionButton
							title={t("actions.confirm")}
							icon=""
							icon_place="right"
							processing_action={processingSubmit}
							type="submit"
						/>
					</div>

				</form>
			</div>
		</div>
	);
}

export default AddPhonePage;
