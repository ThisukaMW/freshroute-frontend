import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Protects a route by redirecting unauthenticated users to the landing page, preserving the intended destination
export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // Reads authentication state and loading flag from auth context
  const { isAuthenticated, isLoading } = useAuth();

  // Captures the current location so the user can be sent back after login
  const location = useLocation();

  // Shows a loading indicator while the session check is still in progress
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-600">
        Checking session...
      </div>
    );
  }

  // Redirects to the landing page if the user is not authenticated, carrying the original path in state
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};