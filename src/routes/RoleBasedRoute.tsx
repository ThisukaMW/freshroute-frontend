import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface RoleBasedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export const RoleBasedRoute = ({
  allowedRoles,
  children,
}: RoleBasedRouteProps) => {
  const { user } = useAuth();

  const userRole = user?.role?.toLowerCase() ?? "";

  if (!user || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
