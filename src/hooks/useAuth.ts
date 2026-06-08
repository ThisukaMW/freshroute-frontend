// This hook is the shortcut to grab auth stuff — just re-exports what AuthContext gives us

import { useAuthContext } from "../context/AuthContext";

// Call this hook in any component to get the logged-in user's info and auth functions
export const useAuth = () => {
  return useAuthContext();
};