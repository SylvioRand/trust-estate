import { useTranslation } from "react-i18next";
import SimpleInput, { PasswordInput } from "../components/Input";
import { useEffect, useRef, useState } from "react";
import PhoneInput from "../components/PhoneInput";
import BoxSection from "../components/BoxSection";
import ActionButton from "../components/ActionButton";
import { dataProfileExample, type ProfileDataType } from "../dataModel/modelProfile";
import { Link, useNavigate } from "react-router-dom";
import ContentDivider from "../components/ContentDivider";

interface	SettingsButtonProps {
	icon: string;
	title: string;
	hover_color?: string;
	onClick: () => void;
}

const	SettingsButton: React.FC<SettingsButtonProps> = ({
	icon = "",
	title = "Title",
	hover_color = "var(--color-midtone)",
	onClick = () => console.error("SettingsButton: onClick not overrided.")
}) => {
	const	[hovered, setHovered] = useState<boolean>(false);

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
			onPointerEnter={ () => setHovered(true) }
			onPointerLeave={ () => setHovered(false) }
			style={{
				backgroundColor: hovered ? hover_color : "transparent",
				boxShadow: hovered ? "var(--shadow-standard)" : "none",
				color: hovered ? "var(--color-foreground)" : "var(--color-background)",
				gridTemplateColumns: icon ? "auto 1fr" : "auto"
			}}
			onClick={ onClick }
		>
			{
				icon &&
					<div className="font-icon text-2xl">
						{ icon }
					</div>
			}
			<div className="justify-self-start
				w-full"
			>
				{ title }
			</div>
		</div>
	);
}

const	SettingsPage: React.FC = () => {
	const	{ t } = useTranslation(["settings"]);
	const	[errorFirstName, setErrorFirstName] = useState<string[]>([]);
	const	[errorLastName, setErrorLastName] = useState<string[]>([]);
	const	[errorPhone, setErrorPhone] = useState<string[]>([]);
	const	refFirstNameInput = useRef<HTMLInputElement | null>(null);
	const	refLastNameInput = useRef<HTMLInputElement | null>(null);
	const	refPhoneInput = useRef<HTMLInputElement | null>(null);

	const	[fetchedUserData, setFetchedUserData] = useState<ProfileDataType>(dataProfileExample);
	const	[isProcessingSavingInfo, setIsProcessingSavingInfo] = useState<boolean>(false);
	const	handleSavingInfo = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("Saving Info!");
		// NOTE: handle all possible error here.
	}

	const	[errorCurrentPassword, setErrorCurrentPassword] = useState<string[]>([]);
	const	[errorNewPassword, setErrorNewPassword] = useState<string[]>([]);
	const	[isProcessingPasswordChange, setIsProcessingPasswordChange] = useState<boolean>(false);
	const	handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("Change Password!");
		// NOTE: handle all possible error here.
	}

	const	navigate = useNavigate();

	const	handleLogOut = async () => {
		try {
			const	response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include"
			});
		} catch (e) {
			console.error("SettingsPage: handleLogOut: error logging out.");
		} finally {
			navigate("/home");
		}
	}

	useEffect(() => {
		if (refFirstNameInput.current)
			refFirstNameInput.current.value = fetchedUserData.firstName;
		if (refLastNameInput.current)
			refLastNameInput.current.value = fetchedUserData.lastName;
		if (refPhoneInput.current)
			refPhoneInput.current.value = fetchedUserData.phone.slice(4);
	}, []);
	return (
		<div
			className="flex flex-col items-center justify-start
			overflow-y-scroll
			gap-7
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
						title={ t("buttons.goBackToProfile") }
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
					onSubmit={ handleSavingInfo }
				>
					<BoxSection
						title={ t("section.profileSettings.title") }
					>
						<div className="grid grid-cols-2 grid-rows-1 gap-3
							w-full"
						>
							<SimpleInput
								icon=""
								title={t("section.profileSettings.form.firstName.label")}
								name="firstName"
								placeholder={t("section.profileSettings.form.firstName.placeholder")}
								error={errorFirstName}
								ref={ refFirstNameInput }
							/>

							<SimpleInput
								title={t("section.profileSettings.form.lastName.label")}
								name="lastName"
								placeholder={t("section.profileSettings.form.lastName.placeholder")}
								error={errorLastName}
								ref={ refLastNameInput }
							/>
						</div>

						<PhoneInput
							title={t("section.profileSettings.form.phone.label")}
							name="phone"
							nameCountryCode="phoneCountryCode"
							placeholder="XX XX XXX XX"
							error={errorPhone}
							ref={ refPhoneInput }
						/>

						<div className="flex items-center justify-end
							w-full"
						>
							<div>
								<ActionButton
									icon="󰆓"
									title={ t("section.profileSettings.buttons.save") }
									processing_action={ isProcessingSavingInfo }
									type="submit"
								/>
							</div>
						</div>
					</BoxSection>
				</form>

				<form
					className="w-full"
					onSubmit={ handleChangePassword }
				>
					<BoxSection
						title={ t("section.accountSettings.title") }
					>
						<PasswordInput
							title={ t("section.accountSettings.form.changePassword.currentPassword.label") }
							name="password"
							placeholder={ t("section.accountSettings.form.changePassword.currentPassword.placeholder") }
							error={ errorCurrentPassword }
						/>
						<PasswordInput
							title={ t("section.accountSettings.form.changePassword.newPassword.label") }
							name="password"
							placeholder={ t("section.accountSettings.form.changePassword.newPassword.placeholder") }
							error={ errorNewPassword }
						/>
						<div className="flex items-center justify-end
							w-full"
						>
							<div>
								<ActionButton
									icon="󰆓"
									title={ t("section.accountSettings.form.changePassword.buttons.change") }
									processing_action={ isProcessingPasswordChange }
									type="submit"
								/>
							</div>
						</div>
					</BoxSection>
				</form>
			</div>

			<BoxSection
				title={ t("section.settings.title") }
			>
				<div className="flex flex-col items-center justify-center
					gap-1
					w-full"
				>
					<SettingsButton
						icon=""
						title={ t("section.settings.deleteAccount") }
						hover_color="var(--color-red-500)"
						onClick={ () => console.log("deleteAccount") }
					/>
					<SettingsButton
						icon="󰍃"
						title={ t("section.settings.logout") }
						hover_color="var(--color-red-500)"
						onClick={ handleLogOut }
					/>
				</div>
			</BoxSection>

			<div className="w-full h-8
				flex-none"
			>
			</div>
		</div>
	);
}

export default SettingsPage;
