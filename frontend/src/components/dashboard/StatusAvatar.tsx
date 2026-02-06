import React from "react";

interface StatusAvatarProps {
    className?: string;
}

const StatusAvatar: React.FC<StatusAvatarProps> = ({ className = "" }) => {
    return (
        <div className="flex items-center justify-center">
            <svg viewBox="0 0 100 100" className={`text-white/50 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cercle extérieur & Silhouette */}
                <circle cx="50" cy="50" r="44" stroke="var(--color-accent)" strokeWidth="2.5" />
                <g transform="translate(12.5, 12.5) scale(0.75)">
                    <path fill="var(--color-accent)" d="M50 52c7.732 0 14-6.268 14-14s-6.268-14-14-14-14 6.268-14 14 6.268 14 14 14zm0 4c-10.667 0-32 5.333-32 16v4h64v-4c0-10.667-21.333-16-32-16z" />
                </g>
            </svg>
        </div>
    );
};

export default StatusAvatar;
