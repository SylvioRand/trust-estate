import { useTranslation } from "react-i18next";
import SimpleInput, { PasswordInput } from "../components/Input";
import { useEffect, useRef, useState } from "react";
import PhoneInput from "../components/PhoneInput";
import BoxSection from "../components/BoxSection";
import ActionButton from "../components/ActionButton";
import { dataProfileExample, type ProfileDataType } from "../dataModel/modelProfile";
import { Link, useNavigate } from "react-router-dom";
import ContentDivider from "../components/ContentDivider";
import useDataProvider from "../provider/useDataProvider";
import { VerifyUsersState } from "../hooks/VerifyUsersState";
import type { PopUpAPI } from "../components/PopUp";
import PopUp from "../components/PopUp";
import type { APIResponse } from "./sign_up";
import { toast } from "react-toastify";

interface SettingsButtonProps {
	icon: string;
	title: string;
	hover_color?: string;
	onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
	icon = "",
	title = "Title",
	hover_color = "var(--color-accent)",
	onClick = () => console.error("SettingsButton: onClick not overrided.")
}) => {
	const [hovered, setHovered] = useState<boolean>(false);

	return (
		<div className="grid grid-cols-[auto_1fr] grid-rows-1
			place-items-center
			gap-3
			cursor-pointer
			px-2 py-1
			select-none
			transition-colors duration-200
			rounded-lg
			w-full"
			onPointerEnter={() => setHovered(true)}
			onPointerLeave={() => setHovered(false)}
			style={{
				backgroundColor: hovered ? hover_color : "transparent",
				boxShadow: hovered ? "var(--shadow-standard)" : "none",
				color: hovered ? "var(--color-foreground)" : "var(--color-background)",
				gridTemplateColumns: icon ? "auto 1fr" : "auto"
			}}
			onClick={onClick}
		>
			{
				icon &&
				<div className="font-icon text-2xl">
					{icon}
				</div>
			}
			<div className="justify-self-start
				w-full"
			>
				{title}
			</div>
		</div>
	);
}

const SettingsPage: React.FC = () => {
	const navigate = useNavigate();
	const { userData, isConnected, setIsConnected } = useDataProvider();
	VerifyUsersState();

	const { t } = useTranslation(["settings", "error"]);

	// Redirect if user is not connected
	if (isConnected !== null && isConnected === false)
		navigate("/sign-in");

	// NOTE: May remove those error check since the back-end looks like
	const [errorFirstName, setErrorFirstName] = useState<string[]>([]);
	const [errorLastName, setErrorLastName] = useState<string[]>([]);
	// end

	const [errorPhone, setErrorPhone] = useState<string[]>([]);
	const refFirstNameInput = useRef<HTMLInputElement | null>(null);
	const refLastNameInput = useRef<HTMLInputElement | null>(null);
	const refPhoneInput = useRef<HTMLInputElement | null>(null);

	const [isProcessingSavingInfo, setIsProcessingSavingInfo] = useState<boolean>(false);
	const handleSavingInfo = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsProcessingSavingInfo(true);
		setErrorFirstName([]);
		setErrorLastName([]);
		setErrorPhone([]);

		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries()) as Record<string, string>;

		data.phone = data.phoneCountryCode + data.phone;

		try {
			const response = await fetch("/api/users/me", {
				method: "PUT",
				headers: {
					"Content-type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(data)
			})

			const responseData = await response.json();

			if (!response.ok) {
				const errorData = responseData as APIResponse;

				if (errorData.details) {
					const details: Record<string, string[]> = errorData.details as Record<string, string[]>;
					
					for (const [key, value] of Object.entries(details)) {
						for (let i = 0; i < value.length; i++)
							toast.error(t(`error:${value[i]}`));
					}
				}
				if (response.status === 400) {
					if (errorData.details)
					{
						if (errorData.details.firstName)
							setErrorFirstName(errorData.details.firstName as string[]);
						if (errorData.details.lastName)
							setErrorLastName(errorData.details.lastName as string[]);
						if (errorData.details.phone)
							setErrorPhone(errorData.details.phone as string[]);
					}
					throw new Error(errorData.message);
				}
			}

			toast.success(t("error:auth.info_update_success"));
		} catch (error) {
			if (error instanceof Error) {
				toast.error(t(`error:${error.message}`))
			}
		} finally {
			setIsProcessingSavingInfo(false);
		}
	}

	const [errorCurrentPassword, setErrorCurrentPassword] = useState<string[]>([]);
	const [errorNewPassword, setErrorNewPassword] = useState<string[]>([]);
	const [isProcessingPasswordChange, setIsProcessingPasswordChange] = useState<boolean>(false);
	const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsProcessingPasswordChange(true);
		setErrorCurrentPassword([]);
		setErrorNewPassword([]);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries()) as Record<string, string>;

		try {
			const response = await fetch("/api/users/me/update-password", {
				method: "PUT",
				headers: {
					"Content-type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(data)
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorData = responseData as APIResponse;

				if (response.status === 400)
					setErrorCurrentPassword([errorData.message]);
				throw new Error(errorData.message);
			}
			toast.success(t(`error:${responseData?.message ?? "success"}`));
		} catch (error) {
			if (error instanceof Error) {
				toast.error(t(`error:${error.message}`))
				console.error("SettingsPage: handleChangePassword: ", t(`error:${error.message}`));
			}
		} finally {
			setIsProcessingPasswordChange(false);
		}
	}

	const refPopUpDeleteAccount = useRef<PopUpAPI>(null);
	const [openPopupDeleteAccount, setOpenPopupDeleteAccount] = useState<boolean>(false);

	const [errorDeletePassword, setErrorDeletePassword] = useState<string[]>([]);
	const [processingAccountDeletion, setProcessingAccountDeletion] = useState<boolean>(false);

	const handleLogOut = async () => {
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include"
			});

			if (!response.ok)
				throw new Error(t("error:auth.not_authenticated_user}"))

		} catch (error) {
			if (error instanceof Error)
				console.error("SettingsPage: handleLogOut: ", error.message);
		} finally {
			navigate("/home");
			setIsConnected(false);
		}
	}

	const handleAccountDeletion = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setProcessingAccountDeletion(true);
		setErrorDeletePassword([]);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries()) as Record<string, string>;

		try {
			const response = await fetch("/api/users/me", {
				method: "DELETE",
				headers: {
					"Content-type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(data)
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorData = responseData as APIResponse;

				if (response.status === 400)
					setErrorDeletePassword([errorData.message]);
				throw new Error(errorData.message);
			}
			toast.success(t(`error:${responseData?.message ?? "success"}`));
			refPopUpDeleteAccount.current?.close();
			setIsConnected(false);
			navigate("/sign-in");
		} catch (error) {
			if (error instanceof Error) {
				toast.error(t(`error:${error.message}`))
				console.error("SettingsPage: handleAccountDeletion: ", t(`error:${error.message}`));
			}
		} finally {
			setProcessingAccountDeletion(false);
		}
	}

	const [processingAddPassword, setProcessingAddPassword] = useState<boolean>(false);
	const [errorAddPassword, setErrorAddPassword] = useState<string[]>([]);

	const { setUserData } = useDataProvider();

	const handleAddPassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setProcessingAddPassword(true);
		setErrorAddPassword([]);
		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData.entries()) as Record<string, string>;

		try {
			const response = await fetch("/api/users/me/add-password", {
				method: "PUT",
				headers: {
					"Content-type": "application/json"
				},
				credentials: "include",
				body: JSON.stringify(data)
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorData = responseData as APIResponse;

				if (response.status === 400)
					setErrorAddPassword([errorData.message]);
				throw new Error(errorData.message);
			}
			toast.success(t(`error:${responseData?.message ?? "success"}`));
			setUserData(prev =>
				prev ? { ...prev, hasPassword: true } : prev
			);

		} catch (error) {
			if (error instanceof Error) {
				toast.error(t(`error:${error.message}`))
				console.error("SettingsPage: handleAddPassword: ", t(`error:${error.message}`));
			}
		} finally {
			setProcessingAddPassword(false);
		}
	}

	function	downloadGDPR()
	{
		const	data = {
			"user": {
				"id": userData?.id,
				"email": userData?.email,
				"created_at": userData?.createdAt
			},
			"profile": {
				"first_name": userData?.firstName,
				"last_name": userData?.lastName,
				"phone": userData?.phone
			},
			"security": {
				"providers": ["password", "google"]
			}
		};

		const	json = JSON.stringify(data, null, 2);
		const	blob = new Blob([json], {
			type: "application/json"
		});
		const	url = URL.createObjectURL(blob);
		const	link = document.createElement("a");
		link.href = url;
		link.download = "CASAGDPRData.json";
		link.click();

		URL.revokeObjectURL(url);
	}

	useEffect(() => {
		if (isConnected === false)
			navigate("/sign-in");
		if (refFirstNameInput.current)
			refFirstNameInput.current.value = userData?.firstName ?? "";
		if (refLastNameInput.current)
			refLastNameInput.current.value = userData?.lastName ?? "";
		if (refPhoneInput.current)
			refPhoneInput.current.value = userData?.phone.slice(4) ?? "";
	}, []);
	return (
		<div
			className="flex flex-col items-center justify-start
			overflow-y-scroll
			gap-7
			animate-fade-in
			px-4 md:px-7 xl:px-64
			w-full h-screen"
		>
			<div className="w-full h-16 flex-none">
			</div>

			<div className="grid grid-cols-[auto_1fr] grid-rows-1
				place-items-center
				w-full"
			>
				<Link
					to="/profile"
				>
					<ActionButton
						icon=""
						title={t("buttons.goBackToProfile")}
					/>
				</Link>
				<div
					className="w-full"
				>
					<ContentDivider
						line_color="linear-gradient(to right,var(--color-background) 80%,transparent)"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 grid-rows-2
				xl:grid-cols-2 xl:grid-rows-1
				gap-9
				w-full"
			>
				<form
					className="w-full"
					onSubmit={handleSavingInfo}
				>
					<BoxSection
						title={t("section.profileSettings.title")}
					>
						<div className="grid grid-cols-2 grid-rows-1 gap-3
							w-full"
						>
							<SimpleInput
								icon=""
								title={t("section.profileSettings.form.firstName.label")}
								name="firstName"
								placeholder={t("section.profileSettings.form.firstName.placeholder")}
								minLength={3}
								error={errorFirstName}
								ref={refFirstNameInput}
							/>

							<SimpleInput
								title={t("section.profileSettings.form.lastName.label")}
								name="lastName"
								placeholder={t("section.profileSettings.form.lastName.placeholder")}
								minLength={3}
								error={errorLastName}
								ref={refLastNameInput}
							/>
						</div>

						<PhoneInput
							title={t("section.profileSettings.form.phone.label")}
							name="phone"
							nameCountryCode="phoneCountryCode"
							placeholder="XX XX XXX XX"
							error={errorPhone}
							ref={refPhoneInput}
						/>

						<div className="flex items-center justify-end
							w-full"
						>
							<div>
								<ActionButton
									icon="󰆓"
									title={t("section.profileSettings.buttons.save")}
									processing_action={isProcessingSavingInfo}
									type="submit"
								/>
							</div>
						</div>
					</BoxSection>
				</form>
				<BoxSection
					title={t("section.accountSettings.title")}
				>

					{
						userData?.hasPassword &&
						<form
							className="flex flex-col items-center justify-center
							gap-4
							w-full"
							onSubmit={handleChangePassword}
						>
							<PasswordInput
								title={t("section.accountSettings.form.changePassword.currentPassword.label")}
								name="password"
								placeholder={t("section.accountSettings.form.changePassword.currentPassword.placeholder")}
								error={errorCurrentPassword}
							/>
							<PasswordInput
								title={t("section.accountSettings.form.changePassword.newPassword.label")}
								name="newPassword"
								placeholder={t("section.accountSettings.form.changePassword.newPassword.placeholder")}
								error={errorNewPassword}
								pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$"
							/>
							<div className="flex items-center justify-end
								w-full"
							>
								<div>
									<ActionButton
										icon="󰆓"
										title={t("section.accountSettings.form.changePassword.buttons.change")}
										processing_action={isProcessingPasswordChange}
										type="submit"
									/>
								</div>
							</div>
						</form>
					}
					{
						!userData?.hasPassword &&
						<form
							className="flex flex-col items-center justify-center
						gap-4
						w-full"
							onSubmit={handleAddPassword}
						>
							<PasswordInput
								title={t("section.accountSettings.form.addPassword.input.label")}
								name="password"
								placeholder={t("section.accountSettings.form.addPassword.input.placeholder")}
								error={errorAddPassword}
								pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$"
							/>
							<div
								className="grid grid-cols-[1fr_auto] grid-rows-1
							w-full"
							>
								<div className="w-full"></div>
								<ActionButton
									icon=""
									title={t("section.accountSettings.form.addPassword.buttons.save")}
									processing_action={processingAddPassword}
									type="submit"
								/>
							</div>
						</form>
					}
				</BoxSection>
			</div>

			<BoxSection
				title={t("section.settings.title")}
			>
				<div className="flex flex-col items-center justify-center
					gap-1
					w-full"
				>
					<SettingsButton
						icon="󰇚"
						title={t("section.settings.downloadGDPR")}
						onClick={ () => downloadGDPR() }
					/>
					<SettingsButton
						icon=""
						title={t("section.settings.deleteAccount")}
						hover_color="var(--color-red-500)"
						onClick={() => setOpenPopupDeleteAccount(true)}
					/>
					<SettingsButton
						icon="󰍃"
						title={t("section.settings.logout")}
						hover_color="var(--color-red-500)"
						onClick={handleLogOut}
					/>
				</div>
			</BoxSection>

			{
				openPopupDeleteAccount && <PopUp
					title={t("section.settings.popup.deleteAccount.title")}
					ref={refPopUpDeleteAccount}
					onClose={() => setOpenPopupDeleteAccount(false)}
				>
					<div
						className="font-light"
					>
						{t("section.settings.popup.deleteAccount.subTitle")}
					</div>
					<form
						className="flex flex-col items-center justify-center
					gap-4
					w-full"
						onSubmit={handleAccountDeletion}
					>
						<PasswordInput
							title={t("section.settings.popup.deleteAccount.input.title")}
							name="password"
							placeholder={t("section.settings.popup.deleteAccount.input.placeholder")}
							error={errorDeletePassword}
						/>
						<div
							className="grid grid-cols-2 grid-rows-1
						gap-4
						w-full"
						>
							<ActionButton
								title={t("section.settings.popup.deleteAccount.buttons.cancel")}
								onClick={() => refPopUpDeleteAccount.current?.close()}
							/>
							<ActionButton
								title={t("section.settings.popup.deleteAccount.buttons.confirm")}
								type="submit"
								accent_color="var(--color-red-500)"
								processing_action={processingAccountDeletion}
							/>
						</div>
					</form>
				</PopUp>
			}

			<div className="w-full h-8
				flex-none"
			>
			</div>
		</div>
	);
}

export default SettingsPage;
