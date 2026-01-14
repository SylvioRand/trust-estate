import React, { useRef, useState, type RefObject } from "react";
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

const	AIPage: React.FC = () => {
	const	[chatValue, setChatValue] = useState<string>("");
	const	messageRef: RefObject<MessageType[]> = useRef<MessageType[]>([]);
	const	{ t } = useTranslation("ai");

	const	handleSendButton = async () => {

		messageRef.current.unshift({ value: chatValue, side: "right" });

		// NOTE: Clear the value
		setChatValue("");

		console.log("SEND");
	}

	return (
		<div className="flex flex-col-reverse items-center justify-start
			gap-3
			px-4 md:px-7 xl:px-64
			relative
			w-full h-screen"
		>

			<div className="w-full h-28">
			</div>

			{
				messageRef.current.map((value: MessageType, index: number) => {
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

export default AIPage;
