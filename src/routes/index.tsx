// AppRoutes.tsx
// Reads the current URL and decides which page to show. Also adds security wrappers
// around pages that need login or a specific role.

import { useRoutes } from "react-router-dom";
import { PublicRoute } from "./PublicRoute";
import { PrivateRoute } from "./PrivateRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";
import { routeConfig } from "./routeConfig";
import SellerRatingsPage from '../pages/seller/SellerRatingsPage';

// Builds the full list of routes and returns whichever page matches the current URL.
export const AppRoutes = () => {
  const element = useRoutes([

    // A demo route — anyone can visit /ratings-demo without logging in.
    { path: "/ratings-demo", element: <SellerRatingsPage /> },

    // Loops through all public routes (sign-in, sign-up, etc.) and wraps each one in PublicRoute.
    // PublicRoute will redirect logged-in users away from these pages (e.g. away from /signin).
    ...routeConfig.public.map((route) => ({
      path: route.path,
      element: <PublicRoute>{route.element}</PublicRoute>,
    })),

    // Loops through all protected routes (dashboard, cart, etc.) and wraps each one in two guards:
    // PrivateRoute = checks the user is logged in.
    // RoleBasedRoute = checks the user has the right role (buyer / seller / admin).
    ...routeConfig.protected.map((route) => ({
      path: route.path,
      element: (
        <PrivateRoute>
          <RoleBasedRoute allowedRoles={route.roles}>
            {route.element}
          </RoleBasedRoute>
        </PrivateRoute>
      ),
    })),

    // If the URL doesn't match anything above, show the 404 not-found page.
    {
      path: "*",
      element: routeConfig.fallback,
    },
  ]);

  return element;
};