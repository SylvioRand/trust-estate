import React, { useState, useEffect, useRef } from "react";
import { ReservationsResponseSchema, type Reservation } from "./zodSchema/dashboard.schema";
import { ZodError } from "zod";
import LoadingPage from "../loading";

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
                className="w-[150px] text-white border-2 border-transparent hover:border-accent/20 px-4 py-2 rounded-lg transition duration-300 flex items-center justify-between"
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

const ReservationCards: React.FC<{ reservations: Reservation[] }> = ({ reservations }) => {
    return (
        <div className="grid grid-cols-1 gap-4">
            <p className="text-accent italic font-bold">Données prêtes : {reservations.length} réservations chargées.</p>
        </div>
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

    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true);
            try {
                let url = `/api/reservations/seller/me?page=${page}&limit=3`;
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
                setLoading(false);
            }
        };

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
                        <ReservationCards reservations={reservations} />

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
                    <div className="w-full h-64 flex items-center justify-center border-2 border-dashed border-background/10 rounded-3xl">
                        <p className="text-xl font-light opacity-50 italic">Aucune réservation trouvée pour ce filtre.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationsSection;