import { useState, type ChangeEvent, type KeyboardEvent, type MouseEventHandler } from "react";

type BubbleProps = { onClick?: MouseEventHandler<HTMLDivElement> };

export default function Bubble({ onClick }: BubbleProps) {
    return (
        <div
            onClick={onClick}
            className="bg-blue-300 rounded-full w-16 h-16 flex justify-center items-center cursor-pointer"
        >
            <img className="w-12 h-12" src="/icon/robot.png" alt="chat bot" />
        </div>
    );
}

export function ChatInterface() {
    const [message, setMessage] = useState<string>("");
    const [value, setValue] = useState<string[]>([]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && message.trim() !== "") {
            setValue([...value, message]);
            setMessage("");
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };

    return (
        <div className="flex flex-col justify-end bg-blue-100 border rounded-lg shadow-md w-90 h-150 p-4">
            <div className="flex-1 overflow-y-auto mb-2">
                {value.map((msg, index) => (
                    <div
                        key={index}
                        className="bg-gray-100 text-black rounded max-w-[60%] wrap-break-word p-2 mb-1"
                    >
                        {msg}
                    </div>
                ))}
            </div>
            <div className="flex flex-row items-center justify-between">
                <img
                    className="w-8 h-8 cursor-pointer"
                    src="/icon/camera.png"
                    alt="Drop photo"
                />
                <input
                    className="text-black rounded flex-1 h-10 p-2 border mx-2"
                    type="text"
                    value={message}
                    placeholder="Ecrire un message..."
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                />
                <img
                    className="w-8 h-8 cursor-pointer"
                    src="/icon/send.png"
                    alt="Send message"
                />
            </div>
        </div>
    );
}

export function ClickBot() {
    const [click, setClick] = useState(false);
    const handleClick = () => setClick(!click);

    return (
        <div className="flex flex-col items-center space-y-2">
            <Bubble onClick={handleClick} />
            {click && <ChatInterface />}
        </div>
    );
}

