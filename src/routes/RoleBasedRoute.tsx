// RoleBasedRoute.tsx
// Checks that the logged-in user's role matches what the page allows.
// If not, sends them to /unauthorized instead of showing the page.

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// allowedRoles = list of roles that are allowed to see this page (e.g. ["admin"]).
// children = the page to show if the role check passes.
interface RoleBasedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

// Renders the page only when the user's role is in the allowed list.
export const RoleBasedRoute = ({
  allowedRoles,
  children,
}: RoleBasedRouteProps) => {
  // Gets the current logged-in user from auth context.
  const { user } = useAuth();

  // Makes the role lowercase so "Buyer" and "buyer" both match correctly.
  const userRole = user?.role?.toLowerCase() ?? "";

  // No user at all, or their role isn't in the allowed list → go to /unauthorized.
  if (!user || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Role is allowed — show the page.
  return children;
};