import { useRoutes } from "react-router-dom";
import { PublicRoute } from "./PublicRoute";
import { PrivateRoute } from "./PrivateRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";
import { routeConfig } from "./routeConfig";
import SellerRatingsPage from '../pages/seller/SellerRatingsPage'

// Composes the full route tree by combining the demo route, public routes, protected routes, and the 404 fallback
export const AppRoutes = () => {
  const element = useRoutes([
    // Demo route for the seller ratings page — accessible without authentication
    { path: "/ratings-demo", element: <SellerRatingsPage /> },

    // Wraps every public route in PublicRoute to redirect authenticated users away from pages like sign-in
    ...routeConfig.public.map((route) => ({
      path: route.path,
      element: <PublicRoute>{route.element}</PublicRoute>,
    })),

    // Wraps every protected route in PrivateRoute (auth check) and RoleBasedRoute (role check)
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

    // Catches all unmatched paths and renders the 404 fallback page
    {
      path: "*",
      element: routeConfig.fallback,
    },
  ]);

  return element;
};