import React from "react";

interface StatusTagProps {
    status: string;
    cancelledBy?: string | null;
    className?: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ status, cancelledBy, className = "" }) => {
    const config: Record<string, { bg: string; text: string; border: string; dot: string; label?: string }> = {
        pending: {
            bg: "bg-amber-50 dark:bg-amber-400/10",
            text: "text-amber-700 dark:text-amber-500",
            border: "border-amber-300 dark:border-amber-500/20",
            dot: "bg-amber-500"
        },
        confirmed: {
            bg: "bg-blue-50 dark:bg-blue-400/10",
            text: "text-blue-700 dark:text-blue-500",
            border: "border-blue-300 dark:border-blue-500/20",
            dot: "bg-blue-500"
        },
        rejected: {
            bg: "bg-red-50 dark:bg-red-400/10",
            text: "text-red-700 dark:text-red-500",
            border: "border-red-300 dark:border-red-500/20",
            dot: "bg-red-500"
        },
        cancelled: {
            bg: "bg-gray-100 dark:bg-gray-400/10",
            text: "text-gray-600 dark:text-gray-400",
            border: "border-gray-300 dark:border-gray-400/20",
            dot: "bg-gray-500",
            label: cancelledBy ? `cancelled by ${cancelledBy}` : "cancelled"
        },
        done: {
            bg: "bg-green-50 dark:bg-green-400/10",
            text: "text-green-700 dark:text-green-500",
            border: "border-green-300 dark:border-green-500/20",
            dot: "bg-green-500"
        },
    };

    const active = config[status] || config.pending;
    const label = active.label || status;

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 ${active.bg} ${active.border} w-fit shadow-sm ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${active.dot} animate-pulse [animation-duration:900ms]`} />
            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${active.text}`}>
                {label}
            </span>
        </div>
    );
};

export default StatusTag;
