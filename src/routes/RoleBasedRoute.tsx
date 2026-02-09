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

  if (!user || (allowedRoles && !allowedRoles.includes(user.role || ""))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
