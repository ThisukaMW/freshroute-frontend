// PublicRoute.tsx
// Wraps public pages (like sign-in). If the user is already logged in,
// it sends them straight to their dashboard instead of showing the public page.

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// children = whatever page is wrapped inside this component.
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  // Gets whether the user is logged in, and their role (buyer / seller / admin).
  const { isAuthenticated, user } = useAuth();

  // Reads the current URL path so we can check if it's on the always-public list.
  const location = useLocation();

  // These pages are always visible, even when logged in (e.g. payment result pages).
  // We never want to redirect away from these.
  const alwaysPublic = [
    "/login",
    "/payment-success",
    "/payment-cancel",
    "/reset-password",
    "/auth/secure-account",
    "/forgot-password",
    "/pending-approval",
  ];

  // If the current path is in the always-public list, just show the page as-is.
  if (alwaysPublic.some((path) => location.pathname.includes(path))) {
    return children;
  }

  // If the user IS logged in, figure out where to send them based on their role.
  // buyer → product browse, seller → seller dashboard, admin → admin dashboard.
  if (isAuthenticated && user?.role) {
    const redirectTo =
      user.role === "buyer"
        ? "/buyer/products"
        : user.role === "seller"
        ? "/seller"
        : "/admin";

    // Sends the user to their dashboard and remembers where they came from.
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is NOT logged in — show the public page normally.
  return children;
};