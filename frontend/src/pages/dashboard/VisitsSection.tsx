import React, { useEffect } from "react";
import { VisitsResponseSchema } from "./zodSchema/dashboard.schema";

const VisitsSection: React.FC = () => {
    const fetchReservations = async () => {
        const res = await fetch("/api/reservations/mine", {
            method: "GET",
            credentials: "include"
        });

        if (!res.ok) {
            throw new Error("Erreur API");
        }

        const visits = VisitsResponseSchema.parse(await res.json());
        console.log("mes visites", visits);
    }
    useEffect(() => {
        fetchReservations();
    }, []);
    return (
        <div className="w-full h-full flex items-center justify-center p-10 outline-dashed outline-background/25 rounded-3xl">
        </div>
    );
};

export default VisitsSection;