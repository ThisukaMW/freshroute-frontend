import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Wraps public pages and redirects already-authenticated users to their role-specific dashboard
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  // Reads authentication state and user info from auth context
  const { isAuthenticated, user } = useAuth();

  // Captures the current location to support bypass logic for specific paths
  const location = useLocation();

  // Paths that should always render even when the user is authenticated (e.g. payment result pages)
  const alwaysPublic = ["/login", "/payment-success", "/payment-cancel"];

  // Skips the redirect check and renders children directly for always-public paths
  if (alwaysPublic.some((path) => location.pathname.includes(path))) {
    return children;
  }

  // Redirects authenticated users to their role-specific dashboard instead of showing the public page
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