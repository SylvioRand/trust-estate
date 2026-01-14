import React, { useRef, useLayoutEffect, type CSSProperties } from "react";

type ChatTextareaProps = {
	value: string;
	onChange: (value: string) => void;
	maxRows?: number;
	placeholder?: string;
	customStyle?: CSSProperties;
	onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
};

export const ChatTextarea: React.FC<ChatTextareaProps> = ({
	value,
	onChange,
	maxRows = 6,
	placeholder = "Type a message…",
	customStyle = {},
	onKeyDown
}) => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	useLayoutEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = "auto";

		const computed = window.getComputedStyle(textarea);
		const lineHeight = parseFloat(computed.lineHeight);

		const maxHeight = lineHeight * maxRows;

		const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
		textarea.style.height = `${nextHeight}px`;

		textarea.scroll(0, textarea.scrollHeight);

		textarea.style.overflowY =
			textarea.scrollHeight > maxHeight ? "auto" : "hidden";
	}, [value, maxRows]);

	return (
		<textarea
			ref={textareaRef}
			value={value}
			rows={1}
			placeholder={placeholder}
			onChange={(e) => onChange(e.target.value)}
			onKeyDown={ (e) => {
				onKeyDown(e);
			}}
			style={{
				all: "unset",
				boxSizing: "border-box",
				width: "100%",
				font: "inherit",
				lineHeight: "1.4",
				padding: "8px 12px",
				borderRadius: "12px",
				resize: "none",
				overflowY: "hidden",
				whiteSpace: "pre-wrap",
				wordBreak: "break-word",
				caretColor: "var(--color-accent)",
				...customStyle
			}}
		/>
	);
};
