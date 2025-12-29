import { jwtDecode, type JwtPayload } from "jwt-decode";
import { Navigate, useLocation } from "react-router-dom";
import LoadingPage from "../pages/loading";
import type React from "react";
import { useEffect, useState, type ReactNode } from "react";

interface IProtectedRoot {
  children: ReactNode
}
const isTokenExpired = (token: string) => {
  const payload: JwtPayload = jwtDecode(token);
  console.log("payload.exp", payload.exp);

  const now = Date.now() / 1000;
  if (!payload.exp || payload.exp < now) {
    localStorage.removeItem('jwtPong');
    return true;
  }
  return false;
}

const ProtectedRoute: React.FC<IProtectedRoot> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthentificated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        const token = localStorage.getItem('jwtPong');
        if (!token)
          throw new Error('No token');

        if (isTokenExpired(token)) {
          const res = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });
          if (!res.ok)
            throw new Error('Refresh failed');

          const data = await res.json();
          localStorage.setItem('jwtPong', data.accessToken);

          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem('jwtPong');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuthentication();
  }, [location]);

  if (isLoading)
    return <LoadingPage />;
  if (!isAuthentificated)
    return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;