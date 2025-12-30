import TextInput from "../components/texte_input";
import { useState, useEffect, useRef } from "react";

const	ChatBot: React.FC = () => {
    const [text, setText] = useState("");
    const [submitted, setSubmitted] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handleKeyDown = (e : React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) 
        {
            e.preventDefault();
            if (text.trim() !== ""){
            setSubmitted([text, ...submitted]);
            setText("");}
        }
    };

    const handleSubmit = () => {
        const cleaned = text.trim();
        if (cleaned.length > 0) 
        { setSubmitted([cleaned, ...submitted]); }
        else if (text.trim() !== "") { 
            setSubmitted([text, ...submitted]);
        }
        setText("");
    };
    
    useEffect(() => {
         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
}, [submitted]);

    return (
       
        <div className="flex flex-col h-screen">
            <div className="flex-1 flex flex-col-reverse min-h-0 pb-2 mr-2 ml-2 overflow-y-auto ">
                <div ref={messagesEndRef}/>
                {submitted.length > 0 ? (
                    submitted.map((msg, index) => (
                        <div className="flex flex-col">
                            <div
                                key={index}
                                className="self-end inline-block px-4 py-2 bg-gray-200 rounded-lg text-gray-800 break-words max-w-xs mb-2">
                                    {msg}
                            </div>
                            <div  className="self-start inline-block px-4 py-2 bg-gray-200 rounded-lg text-gray-800 break-words max-w-xs mb-2">
                                🤖 bot answer!
                            </div>
                        </div>
                    ))
                ) : (
                    <div></div>
                )}
            </div>
         
            <TextInput type="text" value={text} onChange={(e) => setText(e.target.value)}
              onSubmit={handleSubmit} onKeyDown={handleKeyDown}/>
        </div>
    );
}

export default ChatBot;