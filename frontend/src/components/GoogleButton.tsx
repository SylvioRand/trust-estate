import React, { useState } from 'react';

interface GoogleActionButtonProps {
    icon?: string;
    icon_size?: number;
    color?: string;
    text_color?: string;
    title?: string;
    disabled?: boolean;
}

const GoogleActionButton: React.FC<GoogleActionButtonProps> = ({
    icon = '󰊭',
    icon_size = 32,
    color = 'white',
    text_color = 'var(--color-background)',
    title = 'Google',
    disabled = false,
}) => {
    const [hovered, setHovered] = useState(false);

    const hasIcon = !!icon;

    const triggerGoogleLogin = () => {
        if (disabled) return;
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="w-full max-w-[350px] mx-auto relative">
            <button
                type="button"
                disabled={disabled}
                onClick={triggerGoogleLogin}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                className={`
          relative flex items-center justify-center w-full px-3 gap-4
          transition-all duration-200
          ${!hasIcon ? 'py-[11px]' : ''}
          ${hovered && !disabled ? 'scale-103' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default'}
        `}
                style={{
                    background: color,
                    color: text_color,
                    borderRadius: hovered && !disabled ? 'var(--radius-4xl)' : 'var(--radius-lg)',
                    boxShadow: hovered && !disabled ? `0px 0px 7px ${color}` : 'none',
                }}
            >
                {hasIcon && (
                    <span
                        className={`font-icon ${hovered && !disabled ? 'animate-jiggle scale-110' : ''}`}
                        style={{ fontSize: icon_size, color: text_color }}
                    >
                        {icon}
                    </span>
                )}
                <span className="font-bold text-[18px]">{title}</span>
            </button>
        </div>
    );
};

export default GoogleActionButton;