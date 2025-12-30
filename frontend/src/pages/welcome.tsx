import React from "react";

const WelcomePage: React.FC = () => {
    return (
        <div className="flex items-center justify-center
            w-full h-screen"
        >
            <div className="flex flex-col items-center justify-center gap-3
				p-4
				w-full h-full"
            >
                <h1 className="text-2xl font-bold">
                    Welcome to Trust Estate
                </h1>
            </div>
        </div>
    );
}

export default WelcomePage;
