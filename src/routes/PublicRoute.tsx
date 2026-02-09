import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated && user?.role) {
    const redirectTo =
      user.role === "buyer"
        ? "/buyer"
        : user.role === "seller"
        ? "/seller"
        : "/admin";

    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};
