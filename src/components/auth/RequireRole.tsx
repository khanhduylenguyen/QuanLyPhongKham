import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";

type Props = { roles: ("admin" | "doctor" | "receptionist" | "patient")[]; children: ReactNode };

const RequireRole = ({ roles, children }: Props) => {
  const location = useLocation();
  const user = getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
};

export default RequireRole;


