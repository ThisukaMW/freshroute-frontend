// App.tsx
// The root component. Wraps the whole app in all the "providers" (helpers every page needs),
// then renders all the pages via AppRoutes.

import React from "react";
import { AppRoutes } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PendingApprovalsProvider } from "./context/PendingApprovalsContext";
import { ToastProvider } from './context/ToastContext';
import { useFcm } from "./hooks/useFcm";
import { useAuth } from "./hooks/useAuth";

// A small helper component that lives INSIDE AuthProvider so it can read the login token.
// It starts the Firebase Cloud Messaging (push notifications) setup as soon as the user logs in.
const AppInner: React.FC = () => {
  // Gets the auth token from the login context.
  const { token } = useAuth();

  // Registers the device for push notifications whenever the token changes (i.e. on login).
  useFcm(token);

  // Wraps pages in notification and toast (popup message) helpers, then renders all routes.
  return (
    <NotificationProvider>
      <PendingApprovalsProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </PendingApprovalsProvider>
    </NotificationProvider>
  );
};

// The main App component. Wraps everything in theme and auth providers first,
// then renders AppInner which needs those providers to already be available.
const App: React.FC = () => {
  return (
    <ThemeProvider>      {/* Gives every component access to the current theme (light/dark). */}
      <AuthProvider>     {/* Gives every component access to login state and user info. */}
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;