import React from "react";

const VisitSection: React.FC = async () => {

    const res = await fetch("http://localhost:3000/reservations/mine", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    });

     if (!res.ok) {
        throw new Error("Erreur API");
    }

  return res.json();
}