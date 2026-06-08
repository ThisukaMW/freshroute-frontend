/**
 * ThemeContext.tsx
 * Manages dark/light theme for the whole app.
 * Any component can read the current theme or toggle it using this context.
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

/* shape of what this context provides */
interface ThemeContextType {
  theme: string;        /* current theme — "dark" or "light" */
  toggleTheme: () => void; /* function to switch between dark and light */
}

/* creates the theme context box — starts as null */
const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {

  /* current theme — starts as dark */
  const [theme, setTheme] = useState("dark");

  /* whenever theme changes — adds or removes "dark" class on the root html element */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  /* switches theme between dark and light */
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /* bundles theme and toggleTheme — only re-creates when theme changes */
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  /* wraps children so the whole app can access theme data */
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/* hook to use theme context — throws error if used outside ThemeProvider */
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
};
