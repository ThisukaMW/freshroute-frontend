import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface RoleBasedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

// Renders children only if the authenticated user's role is in the allowed list, otherwise redirects to /unauthorized
export const RoleBasedRoute = ({
  allowedRoles,
  children,
}: RoleBasedRouteProps) => {
  // Pulls the current user object from auth context
  const { user } = useAuth();

  // Normalises the user's role to lowercase for case-insensitive comparison
  const userRole = user?.role?.toLowerCase() ?? "";

  // Redirects to /unauthorized if there is no user or their role is not permitted
  if (!user || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};