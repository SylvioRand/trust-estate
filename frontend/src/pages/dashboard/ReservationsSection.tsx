import React, { useState, useEffect, useRef } from "react";
import { ReservationsResponseSchema, type Reservation } from "./zodSchema/dashboard.schema";
import { ZodError } from "zod";
import LoadingPage from "../loading";
import ActionButton from "../../components/ActionButton";
import PopUp from "../../components/PopUp";
import { toast } from "react-toastify";


const filterValue = ["all", "pending", "confirmed", "rejected", "cancelled", "done"]

interface DropdownProps {
    selection: string;
    setSelection: (val: string) => void;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ selection, setSelection, isOpen, setIsOpen }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-[150px] text-white border-2 border-transparent hover:border-accent/20 px-4 py-2 rounded-lg transition duration-300 flex items-center justify-between bg-[#121212]"
            >
                <span className="capitalize">{selection}</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-40 rounded-xl shadow-2xl bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden animate-fade-in">
                    <div className="py-1">
                        {filterValue.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => {
                                    setSelection(filter);
                                    setIsOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-3 text-sm transition-colors duration-200 capitalize ${selection === filter
                                    ? "bg-accent/10 text-accent font-bold"
                                    : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const IconActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    accentColor: string;
}> = ({ icon, label, onClick, accentColor }) => {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) {
                    onClick();
                }
            }}
            title={label}
            className="group/btn relative w-11 h-11 rounded-full flex items-center justify-center bg-white/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 hover:border-black/20 dark:hover:border-white/30 active:scale-95 overflow-hidden"
            style={{ color: accentColor }}
        >

            <div
                className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200 blur-sm"
                style={{ backgroundColor: accentColor }}
            />
            <div className="relative z-10">
                {icon}
            </div>
        </button>
    );
};



const ReservationCard: React.FC<{
    reservation: Reservation;
    onStatusUpdate: (id: string, action: string) => Promise<void>;
}> = ({ reservation, onStatusUpdate }) => {
    const [pendingAction, setPendingAction] = useState<{
        type: "confirm" | "reject" | "cancel" | "done";
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
                        <Tag status={status} cancelledBy={cancelledBy} />
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
                    <StatusAvatarSVG className="w-14 h-14 lg:w-12 lg:h-12 border border-(--color-content-dash)/10 rounded-full shrink-0" />
                    <div className="flex flex-col min-w-0">
                        <p className="text-(--color-accent-dash)/80 uppercase text-[9px] tracking-widest font-black mb-0.5">Visiteur</p>
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
                    <Tag status={status} cancelledBy={cancelledBy} />
                </div>
                <div className="flex gap-4 w-fit items-center justify-center shrink-0">
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
                    title={`${pendingAction.label} la réservation`}
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

                        <div className="bg-accent/10 p-4 rounded-2xl border border-accent/20">
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

const ReservationCards: React.FC<{
    reservations: Reservation[];
    onStatusUpdate: (id: string, action: string) => Promise<void>;
}> = ({ reservations, onStatusUpdate }) => {
    return (
        <div className="grid grid-cols-1 gap-4">
            {reservations.map((reservation) => (
                <ReservationCard
                    key={reservation.reservationId}
                    reservation={reservation}
                    onStatusUpdate={onStatusUpdate}
                />
            ))}
        </div>
    );
};


const Tag: React.FC<{ status: string; cancelledBy?: string | null; className?: string }> = ({ status, cancelledBy, className = "" }) => {
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


const StatusAvatarSVG: React.FC<{ className?: string }> = ({ className = "" }) => {
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

const CalendarIcon: React.FC<{ status?: string }> = () => {
    return (
        <svg className="w-4 h-4 flex-none" fill="none" stroke="var(--color-accent)" viewBox="0 0 24 24" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    );
};

const ReservationsSection: React.FC = () => {
    const [selection, setSelection] = useState("all");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMatching, setTotalMatching] = useState(0);

    const handleFilterChange = (newFilter: string) => {
        setSelection(newFilter);
        setPage(1);
    };

    const fetchReservations = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            let url = `/api/reservations/seller/me?page=${page}&limit=10`;
            if (selection !== 'all')
                url += `&status=${selection}`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error("Error fetching data: ", response.status);
                return;
            }

            const data = await response.json();
            const parsedData = ReservationsResponseSchema.parse(data);
            setReservations(parsedData.reservations);
            setTotalPages(parsedData.pagination.totalPages);
            setTotalMatching(parsedData.pagination.totalMatching);
        } catch (error) {
            if (error instanceof ZodError) {
                console.error("Zod Error Detail:", error.message);
            } else {
                console.error("Fetch error:", error);
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, action: string) => {
        try {
            const response = await fetch(`/api/reservations/${id}/${action}`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success(`Réservation ${action === 'confirm' ? 'confirmée' : action === 'reject' ? 'rejetée' : 'annulée'} avec succès`);
                await fetchReservations(false);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Une erreur est survenue lors de la mise à jour");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Erreur réseau lors de la mise à jour");
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [selection, page]);


    if (loading)
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <LoadingPage />
            </div>
        );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <Dropdown
                    selection={selection}
                    setSelection={handleFilterChange}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                />
                <span className="text-sm opacity-50 font-light">
                    {totalMatching} reservations trouvées
                </span>
            </div>

            <div className="w-full min-h-[400px] flex flex-col gap-4">
                {reservations.length > 0 ? (
                    <>
                        <ReservationCards
                            reservations={reservations}
                            onStatusUpdate={handleStatusUpdate}
                        />


                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-background/5 hover:bg-background/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xl font-bold"
                                >
                                    ‹
                                </button>

                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setPage(n)}
                                            className={`w-10 h-10 rounded-lg transition-colors ${page === n
                                                ? "bg-accent text-white font-bold"
                                                : "bg-background/5 hover:bg-background/10"
                                                }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-background/5 hover:bg-background/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xl font-bold"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl gap-4">
                        <p className="text-xl font-light opacity-50 italic">Aucune réservation trouvée pour ce filtre.</p>
                        <button
                            onClick={() => setSelection('all')}
                            className="text-accent text-sm font-bold uppercase tracking-widest hover:underline"
                        >
                            Voir toutes les réservations
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationsSection;