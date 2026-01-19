import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ContentDivider from "../components/ContentDivider";
import { toast } from "react-toastify";

type	EmailVerificationStatus = "loading" | "confirmed" | "invalid";

const VerifyEmailPage: React.FC = () => {
	const	{ t } = useTranslation(["verifyEmail", "error"]);
	const	[searchParams] = useSearchParams();
	const	token = searchParams.get("token");
	const	[status, setStatus] = useState<EmailVerificationStatus>("loading");
	const	navigate = useNavigate();

	const	verifyToken = async () => {
		try {
			const	response = await fetch("/api/auth/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ token }),
				credentials: "include"
			});

			if (!response.ok)
				throw new Error("Invalid or Expired Token");

			toast.success(t("success"));
			setStatus("confirmed");

			setTimeout(() => {
				console.log("GO WELCOME")
				navigate("/welcome");
			}, 2000);

		} catch (e) {
			toast.error(t("error:auth.invalid_or_expired_token"));
			setStatus("invalid");
			console.error(e);
			setTimeout(() => {
				console.log("GO HOME")
				navigate("/home");
			}, 2000);

		}
	}

	console.log("VERIFY_EMAIL");
	useEffect(() => {
		verifyToken(); // verify the token sent
	}, []);

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

				<div className="flex items-center justify-center
					m-4
					select-none
					relative">
					<div
						className="font-icon
							absolute
							origin-center
							text-[42px]"
						style={{
							animation: status === "loading" ? "var(--animate-spin)" : "var(--animate-jiggle)",
							color: status === "loading" ? "var(--color-background)" : (status === "confirmed" ? "var(--color-green-500)" : "var(--color-red-500)")
						}}
					>
						{ status === "loading" ? "󱥸" : (status === "confirmed" ? "󰄬" : "") }
					</div>
				</div>
			</div>
		</div>
	);
};

export default VerifyEmailPage;
