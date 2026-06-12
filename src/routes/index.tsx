// AppRoutes.tsx
// Reads the current URL and decides which page to show. Also adds security wrappers
// around pages that need login or a specific role.

import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import { PublicRoute } from "./PublicRoute";
import { PrivateRoute } from "./PrivateRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";
import { routeConfig } from "./routeConfig";

const SellerRatingsPage = lazy(
  () => import("../pages/seller/SellerRatingsPage"),
);

// Builds the full list of routes and returns whichever page matches the current URL.
export const AppRoutes = () => {
  const element = useRoutes([
    { path: "/ratings-demo", element: <SellerRatingsPage /> },
    ...routeConfig.public.map((route) => ({
      path: route.path,
      element: <PublicRoute>{route.element}</PublicRoute>,
    })),
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
    { path: "*", element: routeConfig.fallback },
  ]);

  return (
    <Suspense
      fallback={<div className="text-center text-slate-300">Loading...</div>}
    >
      {element}
    </Suspense>
  );
};
