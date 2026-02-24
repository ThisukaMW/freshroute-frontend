import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Allow login pages to be accessed even when authenticated
  if (location.pathname.includes("/login")) {
    return children;
  }

  if (isAuthenticated && user?.role) {
    const redirectTo =
      user.role === "buyer"
        ? "/buyer/products"
        : user.role === "seller"
        ? "/seller"
        : "/admin";

    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};