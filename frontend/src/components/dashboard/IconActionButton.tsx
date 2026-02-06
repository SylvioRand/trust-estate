import React from "react";

interface IconActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    accentColor: string;
}

const IconActionButton: React.FC<IconActionButtonProps> = ({ icon, label, onClick, accentColor }) => {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
            title={label}
            className="group/btn relative w-11 h-11 rounded-full flex items-center justify-center bg-white/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 hover:border-black/20 dark:hover:border-white/30 active:scale-95 overflow-hidden"
            style={{ color: accentColor }}
        >
            <div
                className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200 blur-sm"
                style={{ backgroundColor: accentColor }}
            />
            <div className="relative z-10">{icon}</div>
        </button>
    );
};

export default IconActionButton;
