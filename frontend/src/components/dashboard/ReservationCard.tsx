import React, { useState } from "react";
import { type Reservation } from "../../pages/dashboard/zodSchema/dashboard.schema";
import ActionButton from "../ActionButton";
import PopUp from "../PopUp";
import StatusTag from "./StatusTag";
import StatusAvatar from "./StatusAvatar";
import IconActionButton from "./IconActionButton";

interface ReservationCardProps {
    reservation: Reservation;
    onStatusUpdate: (id: string, action: string) => Promise<void>;
    role: "seller" | "buyer";
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onStatusUpdate, role }) => {
    const [pendingAction, setPendingAction] = useState<{
        type: string;
        label: string;
        description: string;
        color: string;
        icon: string;
    } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const { status, cancelledBy, listing, buyer, slot, reservationId } = reservation;

    const dateObj = new Date(slot);
    const dateParts = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).split(' ');
    const formattedDate = `${dateParts[0]} ${dateParts[1].slice(0, 3).toUpperCase()}.`;
    const formattedTime = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const fullDate = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const isSeller = role === "seller";
    const partyLabel = isSeller ? "Visiteur" : "Vendeur";

    return (
        <div className="group relative flex flex-col lg:flex-row w-full bg-(--color-card-bg-dash) backdrop-blur-[2px] rounded-2xl border border-(--color-content-dash)/10 hover:border-accent/40 transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="absolute inset-0 bg-linear-to-r from-accent/0 via-accent/2 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative p-6 lg:p-5 flex flex-col lg:flex-row items-center gap-5 lg:w-[35%] bg-white/1">
                {/* Miniature Image */}
                <div className="relative w-full lg:w-24 h-48 lg:h-24 rounded-xl overflow-hidden shadow-md border border-(--color-content-dash)/15 shrink-0">
                    {listing.photos?.[0] ? (
                        <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-accent/5 flex items-center justify-center text-accent/20 text-[10px] font-black uppercase tracking-widest italic animate-pulse">Photo</div>
                    )}
                    <div className="absolute top-3 left-3 lg:hidden">
                        <StatusTag status={status} cancelledBy={cancelledBy} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 w-full min-w-0">
                    <div className="flex items-center gap-2 opacity-50">
                        <span className="w-3 h-px bg-(--color-content-dash)" />
                        <p className="text-(--color-content-dash) text-[9px] uppercase font-bold tracking-[0.2em]">Propriété</p>
                    </div>
                    <h2 className="text-(--color-content-dash) font-bold text-xl lg:text-lg leading-tight line-clamp-2 lg:line-clamp-1">
                        {listing.title}
                    </h2>
                    <div className="flex flex-col gap-1 mt-1">
                        <p className="text-(--color-accent-dash) font-black text-base tracking-tighter">{listing.price.toLocaleString()} Ar</p>
                        <div className="flex items-center gap-1 opacity-50 text-(--color-content-dash)">
                            <svg className="w-4 h-4 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-[10px] uppercase font-bold tracking-tighter leading-none">{listing.zone || "Zone N/A"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px w-full bg-linear-to-r from-transparent via-white/5 to-transparent lg:hidden" />

            <div className="flex-1 flex flex-col lg:flex-row p-6 lg:p-5 gap-6 lg:gap-0 lg:border-l lg:border-white/5 items-center min-w-0">
                <div className="flex items-center gap-4 w-full lg:flex-1 lg:px-6 min-w-0">
                    <StatusAvatar className="w-14 h-14 lg:w-12 lg:h-12 border border-(--color-content-dash)/10 rounded-full shrink-0" />
                    <div className="flex flex-col min-w-0">
                        <p className="text-(--color-accent-dash)/80 uppercase text-[9px] tracking-widest font-black mb-0.5">{partyLabel}</p>
                        <h1 className="text-(--color-content-dash) text-lg font-bold leading-none mb-1 truncate">{buyer.firstName} {buyer.lastName}</h1>
                        <p className="text-(--color-content-dash)/60 text-xs font-medium tracking-tight truncate">{buyer.phone}</p>
                    </div>
                </div>

                <div className="w-full lg:w-[180px] flex flex-col items-start justify-center lg:border-l lg:border-white/5 lg:pl-6 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-baseline gap-2">
                                <svg className="w-4 h-4 text-(--color-accent-dash) shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span className="text-(--color-content-dash) font-bold text-base uppercase tracking-tight">
                                    {formattedDate}
                                </span>
                            </div>
                            <span className="text-(--color-accent-dash) font-black text-xl tracking-tight leading-none">
                                {formattedTime}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 lg:p-5 bg-white/2 lg:bg-transparent flex flex-col items-center justify-center gap-4 lg:min-w-[150px] lg:border-l lg:border-white/5 shrink-0">
                <div className="hidden lg:block shrink-0">
                    <StatusTag status={status} cancelledBy={cancelledBy} />
                </div>
                <div className="flex gap-4 w-fit items-center justify-center shrink-0">
                    {isSeller ? (
                        <>
                            {status === "pending" && (
                                <>
                                    <IconActionButton
                                        label="Rejeter"
                                        onClick={() => setPendingAction({
                                            type: "reject",
                                            label: "Rejeter",
                                            description: "Êtes-vous sûr de vouloir rejeter ce rendez-vous ? Cette action est irréversible.",
                                            color: "#ef4467",
                                            icon: "✕"
                                        })}
                                        accentColor="#ef4467"
                                        icon={
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        }
                                    />
                                    <IconActionButton
                                        label="Confirmer"
                                        onClick={() => setPendingAction({
                                            type: "confirm",
                                            label: "Confirmer",
                                            description: "En confirmant ce rendez-vous, vous vous engagez à être disponible au créneau choisi.",
                                            color: "#10b981",
                                            icon: "✓"
                                        })}
                                        accentColor="#10b981"
                                        icon={
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                        }
                                    />
                                </>
                            )}
                            {status === "confirmed" && (
                                <IconActionButton
                                    label="Annuler RDV"
                                    onClick={() => setPendingAction({
                                        type: "cancel",
                                        label: "Annuler",
                                        description: "Êtes-vous sûr de vouloir annuler ce rendez-vous ? Un message sera envoyé au client.",
                                        color: "#ef4467",
                                        icon: "✕"
                                    })}
                                    accentColor="#ef4467"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    }
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {(status === "pending" || status === "confirmed") && (
                                <IconActionButton
                                    label="Annuler ma demande"
                                    onClick={() => setPendingAction({
                                        type: "cancel",
                                        label: "Annuler",
                                        description: "Êtes-vous sûr de vouloir annuler votre demande de visite ? Le vendeur en sera informé.",
                                        color: "#ef4467",
                                        icon: "✕"
                                    })}
                                    accentColor="#ef4467"
                                    icon={
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    }
                                />
                            )}
                        </>
                    )}
                    {(status === "rejected" || status === "cancelled" || status === "done") && (
                        <div className="flex flex-col items-center gap-1 opacity-20 select-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[8px] font-black uppercase tracking-tighter italic">Histo</span>
                        </div>
                    )}
                </div>
            </div>
            {pendingAction && (
                <PopUp
                    title={`${pendingAction.label} ${isSeller ? "la réservation" : "ma visite"}`}
                    onClose={() => setPendingAction(null)}
                >
                    <div className="flex flex-col gap-6 p-2 text-background">
                        <div className="flex flex-col gap-2">

                            <p className="text-sm font-bold uppercase tracking-widest opacity-60">
                                Détails du rendez-vous
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📅</span>
                                <p className="text-lg font-black truncate capitalize">
                                    {fullDate}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⏰</span>
                                <p className="text-lg font-black">
                                    {formattedTime}
                                </p>
                            </div>
                        </div>

                        <div className="bg-linear-to-r from-accent/10 to-transparent p-4 rounded-2xl border border-accent/20">
                            <p className="text-xs leading-relaxed opacity-80">
                                {pendingAction.description}
                            </p>
                        </div>

                        <div className="flex gap-4 mt-2 w-full">
                            <div className="flex-1">
                                <ActionButton
                                    title="Retour"
                                    padding="p-4"
                                    base_color="var(--color-darktone)"
                                    accent_color="var(--color-background)"
                                    onClick={() => setPendingAction(null)}
                                />
                            </div>
                            <div className="flex-1">
                                <ActionButton
                                    title={isUpdating ? "Traitement..." : pendingAction.label}
                                    icon={isUpdating ? "" : pendingAction.icon}
                                    processing_action={isUpdating}
                                    padding="p-4"
                                    onClick={async () => {
                                        setIsUpdating(true);
                                        try {
                                            await onStatusUpdate(reservationId, pendingAction.type);
                                            setPendingAction(null);
                                        } finally {
                                            setIsUpdating(false);
                                        }
                                    }}
                                    accent_color={pendingAction.color}
                                />
                            </div>

                        </div>
                    </div>
                </PopUp>
            )}

        </div>
    );
};

export default ReservationCard;
