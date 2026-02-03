// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   ai.tsx                                             :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/01/26 14:15:16 by aelison           #+#    #+#             //
//   Updated: 2026/02/03 07:09:01 by aelison          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import React, { useState } from "react";
import { ChatTextarea } from "../components/ChatTextArea";
import { useTranslation } from "react-i18next";
import Markdown from 'react-markdown';
import { VerifyUsersState } from "../hooks/VerifyUsersState";
import { type PropertyType } from "../dataModel/modelListings";
import { Link } from "react-router-dom";

type	MetadataAI = {
	photos: string,
	title: string,
	price: number,
	propertyType: PropertyType,
	type: "sale" | "rent",
	id: string,
	zone: string
}

// TO REMOVE
const	exampleMetadataAI: MetadataAI = {
	photos: "https://media.istockphoto.com/id/2175973016/photo/modern-luxury-home-exterior-at-sunset.webp?s=2048x2048&w=is&k=20&c=hd0Y7MsJVp6yVsyb4iTM4FWAHgPggp90TB3mQ9GHVcI=",
	title: "A little heaven in earth",
	price: 2500000000,
	propertyType: "house",
	type: "sale",
	id: "alda213bad2414pncoh-2318hdadhakbbqe-129723basdiuuljio",
	zone: "Analakely"
}

interface	MetadataComponentsProps {
	metadata: MetadataAI
}

const	MetadataComponents: React.FC<MetadataComponentsProps> = ({
	metadata
}) => {
	const	[hovered, setHovered] = useState<boolean>(false);
	const	formatter = new Intl.NumberFormat("de-DE");
	const	{ t } = useTranslation("common");

	return (
		<Link
		to={ `/property/listings?id=${metadata.id}` }
		className="w-80 h-30
		gap-2
		grid grid-cols-[auto_1fr] grid-rows-1
		rounded-2xl
		shadow-standard
		cursor-pointer
		transition-colors duration-300
		flex-none"
		onPointerEnter={ () => setHovered(true) }
		onPointerLeave={ () => setHovered(false) }
		style={{
			backgroundColor: hovered ? "var(--color-accent)" : "var(--color-midtone)"
		}}
		>
			<div
			className="flex items-center justify-center
			relative
			select-none
			overflow-hidden
			rounded-l-xl
			h-full aspect-square">
				<img
				className="w-full h-full object-cover
				transition-transform duration-300"
				style={{
					transform: hovered ? "scale(106%)" : "none"
				}}
				src={ metadata.photos }
				alt="User listing house picture"
				/>
			</div>
			<div
			className="grid grid-cols-1 grid-rows-4
			h-full
			transition-colors duration-300
			py-2 pr-2"
			style={{
				color: hovered ? "var(--color-light-background)" : "var(--color-light-foreground)"
			}}
			>
				<div
				className="font-higuen font-bold truncate text-lg">
					{ metadata.title }
				</div>

				<div
				className="flex items-center justify-start gap-1 font-light text-sm"
				>
					<div className="font-icon"></div><div>{ `${t(`propertyType.${metadata.propertyType}`)}, ${metadata.zone}` }</div>
				</div>

				<div
				className="truncate
				font-bold
				justify-self-end
				text-right
				row-start-4 row-end-5">
					{ `${formatter.format(metadata.price)} Ar` }
				</div>
			</div>
		</Link>
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
	return (
		<div
		className="animate-fade-in
		flex flex-col items-start justify-center
		gap-3
		w-full"
		style={{
		  animationDuration: "50ms"
		}}
		>
			<div
		  className="flex
		  animate-from-bottom
			w-full"
			style={{
				justifyContent: side === "right" ? "flex-end" : "flex-start",
			animationDuration: "50ms"
			}}
			>
				<div className="rounded-xl
			  max-w-[70%]
					p-3
					border border-background/25
					text-sm
					wrap-break-word
					shadow-standard"
					style={{
						order: side === "right" ? "2" : "1",
					}}
				>
					<Markdown>
						{value}
					</Markdown>
				</div>
			</div>
			<div
			className="max-w-[70%] flex-none
			py-3
			grid grid-cols-2 grid-rows-1 gap-3
			"
			>
				{
					metadata.map((value: MetadataAI, index: number) => {
						return (
							<MetadataComponents
							key={ index }
							metadata={ value }
							/>
						);
					})
				}
			</div>
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
		{ value: "I found those links.", side: "left", metadata: [ exampleMetadataAI, exampleMetadataAI, exampleMetadataAI, exampleMetadataAI, exampleMetadataAI, exampleMetadataAI ] }
	]);

	const [canSend, setCanSend] = useState<boolean>(true);
	const { t } = useTranslation(["ai", "error", "common"]);

	VerifyUsersState();

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
				setMessageData((prev) => [
					{ value: "ERROR: IA PART: ", side: "left" } as MessageType,
					...prev
				].filter((msg) => msg.value !== ""));
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
									return (index === 0 ? {...value, metadata: data.metadata} : value);
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

	return (
		<div className="flex flex-col-reverse items-center justify-start
			overflow-y-scroll
			gap-3
			px-4 md:px-7 xl:px-64
			relative
			w-full h-screen"
		>

			<div className="w-full h-24 flex-none">
			</div>

			{
				messageData.map((value: MessageType, index: number) => {
					if (value.value === "ERROR: IA PART: " && value.side === "left")
						return (
							<div
							className="flex items-center justify-start
							w-full"
							>
								<div
								className="flex items-center justify-center gap-3
								rounded-xl
								p-3
								shadow-standard
								max-w-[70%]
								outline-solid outline-1 outline-red-500/50"
								>
									<div
									className="flex items-center justify-center">
										<div
										className="font-icon text-4xl text-red-500 animate-pulse"
										style={{
											textShadow: "0px 0px 4px color-mix(in srgb, var(--color-red-500) 75%, transparent)"
										}}
										>
											
										</div>
									</div>
									<div
									className="font-light
									text-sm">
										{ t("error:ERROR") }
									</div>
								</div>
							</div>
					);
					if (value.value === "")
						return (
							<div
							className="flex items-center justify-start
							w-full"
							>
								<div
								className="font-light
								text-sm
								animate-fade-in"
								>
			   						{ t("message.processing") }
								</div>
							</div>
						);
					return (
						<Message
							key={index}
							value={value.value}
							side={value.side}
							metadata={value.metadata}
						/>
					);
				})
			}

			<div className="w-full h-20 flex-none"></div>
			<div
			className="fixed bottom-0 left-0
			bg-linear-to-t from-foreground to-transparent
			w-full h-24"
			>
				
			</div>
			<div className="fixed bottom-8
				px-4 md:px-7 xl:px-64
				w-full"
			>
				<div className="grid grid-cols-[1fr_auto] grid-rows-1
					shadow-standard
					place-items-center
					border border-background/25
					backdrop-blur-2xl
					rounded-xl
					w-full"
				>
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

					<div className="flex items-end justify-center
						h-full"
					>
						<button className="flex items-center justify-center
							bg-accent
							m-2
							rounded-lg
							shadow-[0px_0px_3px_var(--color-accent)]
							cursor-pointer
							select-none
							w-8 h-8"
							disabled={!canSend}
							onClick={handleSendButton}
						>
							<div className="font-icon text-3xl
								-translate-x-[0.085rem]"
							>
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
