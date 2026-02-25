import React, { createContext, useContext, useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalStorageService } from "../services/storage/LocalStorageService";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = LocalStorageService.get("fr_token");
    const storedUser = LocalStorageService.get("fr_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    LocalStorageService.set("fr_token", nextToken);
    LocalStorageService.set("fr_user", nextUser);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    LocalStorageService.remove("fr_token");
    LocalStorageService.remove("fr_user");
    navigate("/", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
