// PrivateRoute.tsx
// The bouncer for protected pages. If you're not logged in, you get sent to the home page.
// Shows a loading spinner while it checks if you're logged in.

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// children = the protected page to show if the user IS logged in.
export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // Gets login status, loading state, user object, and token from auth context.
  const { isAuthenticated, isLoading, user, token } = useAuth();

  // Reads the current URL so we can remember it and send the user back after login.
  const location = useLocation();

  // Still checking if the user has a valid session — show a simple loading message.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-600">
        Checking session...
      </div>
    );
  }

  // User is definitely NOT logged in — log it and redirect them to the home page.
  if (!isAuthenticated) {
    console.log('NOT AUTHENTICATED - redirecting. user:', user, 'token:', token, 'isLoading:', isLoading);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User IS logged in — show the protected page.
  return children;
};