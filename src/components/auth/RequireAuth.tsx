import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";

type Props = { children: ReactNode };

const RequireAuth = ({ children }: Props) => {
  const location = useLocation();
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  
  return <>{children}</>;
};

export default RequireAuth;

