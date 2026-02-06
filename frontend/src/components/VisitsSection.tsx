import React from "react";

const VisitSection: React.FC = async () => {

  const res = await fetch("http://localhost:3000/reservations/mine", {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Erreur API");
  }

  return res.json();
}