// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   ai.tsx                                             :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/01/26 14:15:16 by aelison           #+#    #+#             //
//   Updated: 2026/02/23 16:32:32 by aelison          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import React, { useEffect, useState } from "react";
import { ChatTextarea } from "../components/ChatTextArea";
import { useTranslation } from "react-i18next";
import Markdown from 'react-markdown';
import { VerifyUsersState } from "../hooks/VerifyUsersState";
import { type PropertyType } from "../dataModel/modelListings";
import { Link, useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton";
import Animate from "../components/Animate";
import useDataProvider from "../provider/useDataProvider";

const AIAvatar: React.FC = () => (
	<div
		className="flex-none w-8 h-8 rounded-full
		flex items-center justify-center
		border border-accent/30
		text-accent text-sm font-bold
		select-none"
		style={{
			background: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 30%, transparent), color-mix(in srgb, var(--color-accent) 8%, transparent))"
		}}
	>
		✦
	</div>
);

const LoadingDots: React.FC = () => (
	<div className="flex items-center gap-1.5 px-1 py-0.5">
		{[0, 150, 300].map((delay, i) => (
			<div
				key={i}
				className="w-2 h-2 rounded-full bg-background/50 animate-bounce"
				style={{ animationDelay: `${delay}ms`, animationDuration: "900ms" }}
			/>
		))}
	</div>
);

interface WelcomeStateProps {
	onSuggestion: (text: string) => void;
}

const WelcomeState: React.FC<WelcomeStateProps> = ({ onSuggestion }) => {
	const { t } = useTranslation("ai");
	const suggestions = t("welcome.suggestions", { returnObjects: true }) as string[];

	return (
		<div className="flex flex-col items-center justify-center gap-7
			w-full h-[calc(100vh-14rem)]
			px-4"
		>
			{/* glowing icon */}
			<div className="relative flex items-center justify-center">
				<div
					className="absolute w-24 h-24 rounded-full"
					style={{
						background: "color-mix(in srgb, var(--color-accent) 20%, transparent)",
						filter: "blur(24px)"
					}}
				/>
				<div
					className="relative w-16 h-16 rounded-full
					flex items-center justify-center
					border border-accent/30
					text-accent text-3xl select-none"
					style={{
						background: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 35%, transparent), color-mix(in srgb, var(--color-accent) 8%, transparent))"
					}}
				>
					✦
				</div>
			</div>

			<div className="flex flex-col items-center gap-2 text-center max-w-sm">
				<h2 className="font-higuen text-2xl font-bold text-background">
					{t("welcome.title")}
				</h2>
				<p className="text-sm text-background/55 font-light leading-relaxed">
					{t("welcome.subtitle")}
				</p>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
				{suggestions.map((suggestion, i) => (
					<button
						key={i}
						onClick={() => onSuggestion(suggestion)}
						className="px-4 py-2 rounded-full text-sm
						border border-background/20
						text-background/65
						transition-all duration-200
						cursor-pointer select-none
						hover:border-accent/40 hover:text-accent"
						style={{ background: "transparent" }}
					>
						{suggestion}
					</button>
				))}
			</div>
		</div>
	);
};

type MetadataAI = {
	photos: string,
	title: string,
	price: number,
	propertyType: PropertyType,
	type: "sale" | "rent",
	id: string,
	zone: string
}

interface MetadataComponentsProps {
	metadata: MetadataAI
}

const MetadataComponents: React.FC<MetadataComponentsProps> = ({
	metadata
}) => {
	const formatter = new Intl.NumberFormat("de-DE");
	const { t } = useTranslation("common");
	console.log("metadata.photos", metadata.photos);

	return (
		<div
			className="grid grid-cols-1 grid-rows-[auto_1fr]
		min-w-60 max-w-60
		gap-2
		rounded-2xl
		shadow-standard
		border border-background/25
		transition-colors duration-300
		flex-none"
		>
			{metadata.photos && metadata.photos !== "" && (
				<div className="w-full aspect-square">
					<img
						className="rounded-2xl w-full h-full object-cover"
						src={`${import.meta.env.VITE_FRONTEND_URL}${metadata.photos}`}
						alt="Picture of a house"
					/>
				</div>
			)}
			<div
				className="flex flex-col items-start justify-center
			px-2
			mb-2
			text-left
			w-full"
			>
				<div
					className="font-higuen font-bold text-lg truncate max-w-full"
				>
					{metadata.title}
				</div>
				<div
					className="flex items-center justify-center gap-1
				text-sm"
				>
					<div className="font-icon"></div><div className="truncate max-w-50">{`${t(`propertyType.${metadata.propertyType}`)}, ${metadata.zone}`}</div>
				</div>
				<div className="font-bold my-2">
					{`${formatter.format(metadata.price)} Ar`}
				</div>
				<Link
					className="w-full"
					to={`/property/listings?id=${metadata.id}`}
				>
					<ActionButton
						title={t("viewDetails")}
					/>
				</Link>
			</div>
		</div>
	);
}

interface MessageProps {
	value: string;
	side: "left" | "right";
	metadata: MetadataAI[];
}

const Message: React.FC<MessageProps> = ({
	value = "This is the content of your message",
	side = "right",
	metadata = []
}) => {
	const isUser = side === "right";

	return (
		<div
			className="animate-fade-in flex flex-col items-start justify-center gap-2 w-full"
			style={{ animationDuration: "120ms" }}
		>
			<div
				className="flex items-end gap-2.5 animate-from-bottom px-4 md:px-7 w-full"
				style={{
					justifyContent: isUser ? "flex-end" : "flex-start",
					animationDuration: "200ms"
				}}
			>
				{!isUser && <AIAvatar />}
				<div
					className={`max-w-[70%] p-3 text-sm wrap-break-word shadow-standard ${isUser
						? "rounded-2xl rounded-br-sm border border-accent/25"
						: "rounded-2xl rounded-bl-sm border border-background/18"
						}`}
					style={{
						background: isUser
							? "color-mix(in srgb, var(--color-accent) 10%, transparent)"
							: "color-mix(in srgb, var(--color-background) 6%, transparent)"
					}}
				>
					<Markdown>{value}</Markdown>
				</div>
			</div>
			{metadata.length > 0 && (
				<div className="xl:max-w-[calc(70%+2.625rem)] flex-none py-2 px-4 gap-3 overflow-x-scroll flex items-center justify-start xl:flex-wrap xl:w-auto w-full">
					{metadata.map((meta: MetadataAI, index: number) => (
						<MetadataComponents key={index} metadata={meta} />
					))}
				</div>
			)}
		</div>
	);
}

type MessageType = {
	value: string;
	side: "left" | "right";
	metadata: MetadataAI[];
}

const AIPage: React.FC = () => {
	const [chatValue, setChatValue] = useState<string>("");
	const [messageData, setMessageData] = useState<MessageType[]>([
	]);
	const [canSend, setCanSend] = useState<boolean>(true);
	const { t } = useTranslation(["ai", "error", "common"]);
	const { userData } = useDataProvider();
	const navigate = useNavigate();

	const handleSendButton = async () => {
		if (!chatValue.trim() || !canSend)
			return;

		const userQuery = chatValue;
		setChatValue("");
		setCanSend(false);
		setMessageData((prev) => [
			{ value: "", side: "left", metadata: [] },
			{ value: userQuery, side: "right", metadata: [] },
			...prev
		])

		try {
			const response = await fetch("/api/ai/chat/", {
				method: "POST",
				body: JSON.stringify({ message: userQuery }),
				headers: { "Content-type": "application/json" }
			});
			if (!response.ok) {
				throw new Error(t(`error:ERROR`));
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let remains = "";

			if (!reader)
				throw new Error("Failed to get reader");

			while (true) {
				const { value, done } = await reader.read();

				if (done) {
					break;
				}

				const current_text = decoder.decode(value, { stream: true });
				const current_line = (remains + current_text).split('\n');
				remains = current_line.pop() || ""

				for (const line of current_line) {
					if (!line.trim())
						continue;

					const data = JSON.parse(line);

					if (data.type === "content") {
						const llm_reply = data.reply;

						setMessageData((prev) => {
							const new_text = [...prev];
							if (new_text.length > 0) {
								new_text[0] = {
									...new_text[0],
									value: new_text[0].value + llm_reply
								};
							}
							return new_text;
						});
					}
					else if (data.type === "metadata") {
						setMessageData((prev) => {
							return (
								prev.map((value: MessageProps, index: number) => {
									return (index === 0 ? { ...value, metadata: data.metadata } : value);
								})
							)
						})
					}
				}
			}
		} catch (error) {
			setMessageData((prev) => [
				{ value: "ERROR: IA PART: ", side: "left", metadata: [] } as MessageType,
				...prev
			].filter((msg) => msg.value !== ""));
		} finally {
			setCanSend(true);
		}
	}

	// If user email are not verified, redirect to /email-sent
	// Verify on component mount, and when userData are changed
	useEffect(() => {
		if (userData && userData.emailVerified === false)
			navigate("/email-sent")
	}, [userData]);
	useEffect(() => {
		if (userData && userData.emailVerified === false)
			navigate("/email-sent")
	}, []);
	return (
		<div className="flex flex-col-reverse items-center justify-start
			overflow-y-scroll
			gap-4
			xl:px-64
			relative
			w-full h-screen"
		>
			{/* bottom spacer — sits below the input bar */}
			<div className="w-full h-28 flex-none" />

			{/* messages / empty state */}
			{messageData.length === 0
				? <WelcomeState onSuggestion={(text) => setChatValue(text)} />
				: messageData.map((msg: MessageType, index: number) => {

					/* loading state */
					if (msg.value === "" && msg.side === "left")
						return (
							<div
								key={index}
								className="flex items-end gap-2.5 animate-fade-in px-4 md:px-7 w-full"
								style={{ animationDuration: "150ms" }}
							>
								<AIAvatar />
								<div
									className="rounded-2xl rounded-bl-sm border border-background/18 shadow-standard px-3 py-2"
									style={{ background: "color-mix(in srgb, var(--color-background) 6%, transparent)" }}
								>
									<LoadingDots />
								</div>
							</div>
						);

					/* error state */
					if (msg.value === "ERROR: IA PART: " && msg.side === "left")
						return (
							<div
								key={index}
								className="flex items-end gap-2.5 animate-fade-in px-4 md:px-7 w-full"
								style={{ animationDuration: "150ms" }}
							>
								<div
									className="flex-none w-8 h-8 rounded-full flex items-center justify-center border border-red-500/30"
									style={{ background: "color-mix(in srgb, #ef4444 12%, transparent)" }}
								>
									<div
										className="font-icon text-lg text-red-500 animate-pulse"
										style={{ textShadow: "0 0 6px color-mix(in srgb, #ef4444 60%, transparent)" }}
									>

									</div>
								</div>
								<div
									className="rounded-2xl rounded-bl-sm p-3 text-sm font-light border border-red-500/20 shadow-standard"
									style={{ background: "color-mix(in srgb, #ef4444 6%, transparent)" }}
								>
									{t("error:ERROR")}
								</div>
							</div>
						);

					return (
						<Message
							key={index}
							value={msg.value}
							side={msg.side}
							metadata={msg.metadata}
						/>
					);
				})
			}

			{/* top spacer — sits below the NavBar */}
			<div className="w-full h-20 flex-none" />

			{/* gradient fade at bottom */}
			<div
				className="fixed bottom-0 left-0 w-full h-32 pointer-events-none"
				style={{ background: "linear-gradient(to top, var(--color-foreground) 40%, transparent)" }}
			/>

			{/* input bar */}
			<div className="fixed bottom-5 px-4 md:px-7 xl:px-64 w-full">
				<div
					className="grid grid-cols-[1fr_auto] grid-rows-1
					place-items-center
					border border-background/20
					backdrop-blur-2xl
					rounded-2xl
					shadow-standard
					w-full
					transition-all duration-200
					focus-within:border-accent/35
					focus-within:shadow-[0_4px_20px_color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
				>
					<div className="w-full flex flex-col">
						<ChatTextarea
							value={chatValue}
							onChange={setChatValue}
							maxRows={7}
							placeholder={t("inputChat.placeholder")}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									if (chatValue.trim() !== "" && canSend)
										handleSendButton();
								}
							}}
						/>
						{chatValue.length > 3000 && (
							<div
								className="px-3 pb-1.5 text-xs text-right select-none"
								style={{
									color: chatValue.length > 4500
										? "#ef4444"
										: "color-mix(in srgb, var(--color-background) 45%, transparent)"
								}}
							>
								{chatValue.length} / 5000
							</div>
						)}
					</div>

					<div className="flex items-end justify-center h-full">
						<button
							className="flex items-center justify-center
							m-2
							rounded-xl
							cursor-pointer
							select-none
							w-8 h-8
							transition-all duration-150"
							style={{
								background: "var(--color-accent)",
								opacity: canSend ? "1" : "0.3",
								boxShadow: canSend ? "0 0 10px color-mix(in srgb, var(--color-accent) 50%, transparent)" : "none"
							}}
							disabled={!canSend}
							onClick={handleSendButton}
						>
							<div className="font-icon text-3xl -translate-x-[0.085rem] text-foreground">
								
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AIPage;
