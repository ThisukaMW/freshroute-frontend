/**
 * AuthContext.tsx
 * Manages login, logout, and current user data for the whole app.
 * Any component can read user info or call login/logout through this context.
 */

import React, { createContext, useContext, useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalStorageService } from "../services/storage/LocalStorageService";

/* shape of a logged-in user object */
interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

/* everything this context provides to the app */
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

/* creates the auth context — starts as null until AuthProvider wraps the app */
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  /* current logged-in user data — null if not logged in */
  const [user, setUser] = useState<User | null>(null);

  /* auth token from the server — null if not logged in */
  const [token, setToken] = useState<string | null>(null);

  /* true while checking localStorage on first load */
  const [isLoading, setIsLoading] = useState(true);

  /* for redirecting to home on logout */
  const navigate = useNavigate();

  /* on first load — checks localStorage for saved token and user, restores session if found */
  /*Did this person log in before and close the tab?
  YES → bring them back in, skip the login page
  NO  → they need to log in fresh*/
  useEffect(() => {
    const storedToken = LocalStorageService.get("fr_token");
    const storedUser = LocalStorageService.get("fr_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  /* saves token and user to state and localStorage when user logs in */
  const login = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    LocalStorageService.set("fr_token", nextToken);
    LocalStorageService.set("fr_user", nextUser);
  }, []);

  /* clears token and user from state and localStorage, then redirects to home */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    LocalStorageService.remove("fr_token");
    LocalStorageService.remove("fr_user");
    navigate("/", { replace: true });
  }, [navigate]);

  /* updates part of the user object when user chnage any part (only the part that changed) (e.g. name change) in state and localStorage */
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      LocalStorageService.set("fr_user", updated);
      return updated;
    });
  }, []);

  /* bundles all values and functions — only re-creates when something actually changes */
  //only re-create the box if one of THESE values changed
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token, /* true if token exists, false if null */
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, token, isLoading, login, logout, updateUser]
  );

  /* wraps children so the whole app can access auth data */
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* hook to use auth context — throws an error if used outside AuthProvider */
//a function that any component calls to get the logged-in user's data
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};