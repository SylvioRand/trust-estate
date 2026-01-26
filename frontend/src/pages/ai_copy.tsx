// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   ai_copy.tsx                                        :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/01/26 14:15:16 by aelison           #+#    #+#             //
//   Updated: 2026/01/26 15:37:54 by aelison          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import React, { useState } from "react";
import { ChatTextarea } from "../components/ChatTextArea";
import { useTranslation } from "react-i18next";

interface	MessageProps {
	value: string;
	side: "left" | "right";
}

const	Message: React.FC<MessageProps> = ({
	value = "This is the content of your message",
	side = "right"
}) => {
	return (
		<div className="grid grid-cols-2 grid-rows-1
			w-full"
			style={{
				justifyContent: side === "right" ? "flex-end" : "flex-start"
			}}
		>
			<div
				className="w-full"
				style={{
					order: side === "right" ? "1" : "2"
				}}
			>
			</div>

			<div className="rounded-xl
				p-3
				border border-background/25
				shadow-standard
				max-w-120"
				style={{
					order: side === "right" ? "2" : "1",
					justifySelf: side === "right" ? "flex-end" : "flex-start"
				}}
			>
				{ value }
			</div>
		</div>
	);
}

type	MessageType = {
	value: string;
	side: "left" | "right";
}

const	AICopyPage: React.FC = () => {
	const	[chatValue, setChatValue] = useState<string>("");
	// const	messageRef: RefObject<MessageType[]> = useRef<MessageType[]>([]);
	const	[messageData, setMessageData] = useState<MessageType[]>([
		{ value: "Ok, I've actually found 2 property that match your criteria.", side: "left" },
		{ value: "I'm actually looking for an affordable apartment to rent near the capital.", side: "right" }
	]);
	const	{ t } = useTranslation("ai");

	const	handleSendButton = async () => {
		if (!chatValue.trim())
			return ;

		const userQuery = chatValue;
		setChatValue("");

		setMessageData((prev) => [
			{ value: "", side: "left"},
			{ value: userQuery, side: "right"},
			...prev
		])

		try {
			const response = await fetch("/api/ai/chat", {
				method: "POST",
				body: JSON.stringify({message: userQuery}),
				headers: { "Content-type": "application/json"}
			});
			if (!response.ok) {
				const errorMessage = await response.json();
				throw new Error(errorMessage);
			}

			console.log("Yees, you made it !");
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let remains = "";

			while (true) {
				const { value, done } = await reader.read();

				if (done) {
					console.log("End receiving llm response")
					break ;
				}

				const current_text = decoder.decode(value, { stream: true });
				const current_line = (remains + current_text).split('\n');
				remains = current_line.pop() || ""

				console.log("let's enter the loop !")
				for (const line of current_line) {
				console.log("inside the loop hehehehehehe ", line);
					if (!line.trim())
						continue;

					const data = JSON.parse(line);

					if (data.type === "content") {
						const llm_reply = data.reply;

						setMessageData((prev) => {
							const new_text = [...prev];
							new_text[0] = {
								...new_text[0],
								value: new_text[0].value + llm_reply
						};
						console.log("Hello there: ", new_text);
						return new_text;
						});
					}
					else if (data.type === "metadata"){
						console.log("Founds metadatas: ", data.links);
					}
				}
			}
		} catch (error) {
			console.log("Error in AI: ", error);
			
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
					return (
						<Message
							key={ index }
							value={ value.value }
							side={ value.side }
						/>
					);
				})
			}

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
						value={ chatValue }
						onChange={ setChatValue }
						maxRows={7}
						placeholder={ t("inputChat.placeholder") }
						onKeyDown={(e) => {
							if (e.key === "Enter" && chatValue !== "\n")
								handleSendButton();
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
							onClick={ handleSendButton }
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

export default AICopyPage;
