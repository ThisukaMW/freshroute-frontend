import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

import LandingPage from "../pages/LandingPage";

interface RouteConfig {
  path: string;
  element: ReactElement;
}

interface ProtectedRouteConfig extends RouteConfig {
  roles?: string[];
}

export const routeConfig: {
  public: RouteConfig[];
  protected: ProtectedRouteConfig[];
  fallback: ReactElement;
} = {
  public: [
    {
      path: "/",
      element: <LandingPage />,
    },
  ],
  protected: [
    // Add your protected routes here
    // Example:
    // {
    //   path: "/buyer",
    //   element: <BuyerDashboard />,
    //   roles: ["buyer"],
    // },
  ],
  fallback: <Navigate to="/" replace />,
};
