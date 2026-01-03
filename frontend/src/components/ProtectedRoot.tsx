import { Navigate, useLocation } from "react-router-dom";
import LoadingPage from "../pages/loading";
import type React from "react";
import { useEffect, useState, type ReactNode } from "react";

interface IProtectedRoot {
  children: ReactNode
}

/**
 * ProtectedRoute : Pour les pages accessibles uniquement aux AUTHENTIFIÉS
 * (home, profile, settings, etc.)
 * 
 * Si l'utilisateur n'est pas connecté, on le redirige vers /sign-in
 * 
 * Note: Les tokens JWT sont stockés dans des cookies HTTP-only.
 * Le backend gère automatiquement le refresh des tokens via les cookies.
 * Le frontend n'a qu'à faire ses requêtes avec credentials: 'include'
 */
const ProtectedRoute: React.FC<IProtectedRoot> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        // Vérifier l'état de l'utilisateur
        // Les cookies (accessToken + refreshToken) sont envoyés automatiquement
        // Le backend s'occupe du refresh si nécessaire
        const res = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include', // Envoie automatiquement les cookies
        });

        if (res.ok) {
          // Utilisateur authentifié et vérifié
          setIsAuthenticated(true);
        } else if (res.status === 403) {
          // Authentifié mais email/téléphone non vérifié
          const errorData = await res.json();
          
          if (errorData.error === 'phone_number_not_verified') {
            setRedirectTo('/add-phone');
          } else if (errorData.error === 'email_not_verified') {
            setRedirectTo('/email-sent');
          } else {
            setIsAuthenticated(false);
          }
        } else {
          // 401 ou autre erreur = pas authentifié
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuthentication();
  }, [location.pathname]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return <LoadingPage />;
  }

  // Redirection vers une page de vérification si nécessaire
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Pas authentifié = redirection vers login
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Authentifié et vérifié = afficher la page protégée
  return <>{children}</>;
};

export default ProtectedRoute;
