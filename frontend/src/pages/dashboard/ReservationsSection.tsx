import React, { useState, useEffect } from "react";
import { ReservationsResponseSchema, type Reservation } from "./zodSchema/dashboard.schema";
import { ZodError } from "zod";
import LoadingPage from "../loading";
import { toast } from "react-toastify";
import FilterDropdown from "../../components/dashboard/FilterDropdown";
import ReservationCard from "../../components/dashboard/ReservationCard";

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
                <FilterDropdown
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
                        <div className="grid grid-cols-1 gap-4">
                            {reservations.map((reservation) => (
                                <ReservationCard
                                    key={reservation.reservationId}
                                    reservation={reservation}
                                    onStatusUpdate={handleStatusUpdate}
                                    role="seller"
                                />
                            ))}
                        </div>


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