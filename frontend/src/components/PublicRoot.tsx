import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoadingPage from "../pages/loading";

/**
 * PublicRoot : Pour les pages accessibles uniquement aux NON-authentifiés
 * (login, signup, forgot-password, etc.)
 * 
 * Si l'utilisateur est déjà connecté, on le redirige vers /home
 * 
 * Note: Les tokens JWT sont stockés dans des cookies HTTP-only.
 * Le navigateur les envoie automatiquement avec credentials: 'include'
 */
const PublicRoot = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier auprès du serveur si l'utilisateur est authentifié
        // Les cookies sont envoyés automatiquement avec credentials: 'include'
        const res = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include', // Envoie automatiquement les cookies
        });

        if (res.ok) {
          // L'utilisateur est authentifié
          setIsAuthenticated(true);
        } else {
          // Pas authentifié ou session expirée
          setIsAuthenticated(false);
        }
      } catch {
        // Erreur réseau
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return <LoadingPage />;
  }

  // Si authentifié, rediriger vers la page d'accueil
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Sinon, afficher la page publique (login, signup, etc.)
  return <>{children}</>;
};

export default PublicRoot;