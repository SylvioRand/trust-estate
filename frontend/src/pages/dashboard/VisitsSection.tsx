import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { VisitsResponseSchema, type Reservation } from "./zodSchema/dashboard.schema";
import { ZodError } from "zod";
import LoadingPage from "../loading";
import { toast } from "react-toastify";
import FilterDropdown from "../../components/dashboard/FilterDropdown";
import ReservationCard from "../../components/dashboard/ReservationCard";

const VisitsSection: React.FC = () => {
    const { t } = useTranslation("dashboard");
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

    const fetchVisits = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            let url = `/api/reservations/mine?page=${page}&limit=10`;
            if (selection !== 'all')
                url += `&status=${selection}`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            const parsedData = VisitsResponseSchema.parse(data);
            setReservations(parsedData.reservations);
            setTotalPages(parsedData.pagination.totalPages);
            setTotalMatching(parsedData.pagination.totalMatching);
        } catch (error) {
            if (error instanceof ZodError) {
            } else {
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, action: string) => {
        try {
            const response = await fetch(`/api/reservations/${id}/${action}`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (response.ok) {
                toast.success(t("notifications.updateSuccess", { defaultValue: "Action effectuée avec succès" }));
                await fetchVisits(false);
            } else {
                const errorData = await response.json();
                toast.error(t("notifications.updateError", { defaultValue: "Une erreur est survenue lors de la mise à jour." }));
            }
        } catch (err) {
            toast.error(t("notifications.updateError", { defaultValue: "Une erreur est survenue lors de la mise à jour." }));
        }
    };

    useEffect(() => { fetchVisits(); }, [selection, page]);

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
                    isOpen={isOpen} setIsOpen={setIsOpen}
                />
                <span className="text-sm opacity-50 font-light">
                    {t("sections.visits.count", { count: totalMatching })}
                </span>
            </div>

            <div className="w-full min-h-[400px] flex flex-col gap-4">
                {reservations.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-4">
                            {reservations.map((res) => (
                                <ReservationCard
                                    key={res.reservationId}
                                    reservation={res}
                                    onStatusUpdate={handleStatusUpdate}
                                    role="buyer"
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8 pb-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-background/5 hover:bg-background/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xl font-bold"
                                >
                                    ‹
                                </button>
                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                        <button key={n} onClick={() => setPage(n)} className={`w-10 h-10 rounded-lg transition-colors ${page === n ? "bg-accent text-white font-bold" : "bg-background/5 hover:bg-background/10"}`}>{n}</button>
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
                        <p className="text-xl font-light opacity-50 italic">
                            {t("sections.visits.empty")}
                        </p>
                        <button
                            onClick={() => setSelection('all')}
                            className="text-accent text-sm font-bold uppercase tracking-widest hover:underline"
                        >
                            {t("sections.visits.viewAll")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitsSection;