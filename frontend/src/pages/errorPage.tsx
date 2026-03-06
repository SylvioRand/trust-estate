import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import ActionButton from "../components/ActionButton";
import WaveCanvas from "../components/WavyLines";

const ErrorPage: React.FC = () => {
    const { t } = useTranslation("errorPage");
    const error = useRouteError();

    let title = t("titleError");
    let message = t("messageError");

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            title = t("title404");
            message = t("message404");
        }
    }

    return (
        <div className="flex items-center justify-center
			relative
			overflow-hidden
			w-full h-screen
            bg-foreground text-background"
        >
            <div className="absolute top-0 left-0
				blur-xl
				drop-shadow-xl
				w-full h-full"
            >
                <WaveCanvas
                    color="var(--color-accent)"
                    waveCount={3}
                    spacing={40}
                    thickness={12}
                />
            </div>

            <div className="flex flex-col items-center justify-center gap-6
				p-4
				text-center
				relative
				w-full h-full"
            >
                <div className="animate-fade-in flex flex-col gap-2">
                    <h1 className="font-higuen text-6xl font-bold
						animate-from-top text-accent"
                    >
                        {isRouteErrorResponse(error) ? error.status : "Error"}
                    </h1>
                    <h2 className="font-higuen text-3xl font-bold
						animate-from-top"
                        style={{ animationDelay: "100ms" }}
                    >
                        {title}
                    </h2>
                </div>
                <div className="animate-fade-in max-w-200"
                    style={{
                        opacity: "0%",
                        animationDelay: "300ms"
                    }}
                >
                    <div className="animate-from-bottom font-inter font-light text-lg"
                        style={{
                            animationDelay: "300ms"
                        }}
                    >
                        {message}
                    </div>
                </div>

                <div className="animate-fade-in max-w-75 w-full"
                    style={{
                        opacity: "0%",
                        animationDelay: "500ms"
                    }}
                >
                    <Link
                        className="w-full max-w-75
						animate-from-bottom"
                        style={{
                            animationDelay: "600ms"
                        }}
                        to="/home"
                    >
                        <ActionButton
                            icon="󰚴"
                            icon_place="left"
                            title={t("buttonBackHome")}
                        />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ErrorPage;
