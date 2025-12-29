import { Navigate } from "react-router-dom";

const PublicRoot = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('jwtToken');

  if (token) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default PublicRoot;