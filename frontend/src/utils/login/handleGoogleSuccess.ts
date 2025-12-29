import type { CredentialResponse } from "@react-oauth/google";
import type { NavigateFunction } from "react-router-dom";

export const handleGoogleSuccess = async (response: CredentialResponse, navigate: NavigateFunction) => {
  if (!response.credential) return;

  try {
    console.log("1. Envoi requête POST...");

    const res = await fetch("/api/auth/oauth/google/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });


    if (!res.ok) {
      const errorText = await res.text();
      console.error("3. ❌ Erreur HTTP:", errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("4. ✅ SUCCÈS - Données reçues:", data);

    if (data.accessToken) {
      localStorage.setItem('jwtPong', data.accessToken);
      console.log("5. Token stocké - Navigation vers /");
      navigate("/");
    }

  } catch (err) {
    console.error("6. ❌ Erreur fetch:", err);
  }
};