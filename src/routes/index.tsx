import { useRoutes } from "react-router-dom";
import { PublicRoute } from "./PublicRoute";
import { PrivateRoute } from "./PrivateRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";
import { routeConfig } from "./routeConfig";
import SellerRatingsPage from '../pages/seller/SellerRatingsPage'

export const AppRoutes = () => {
  const element = useRoutes([
    { path: "/ratings-demo", element: <SellerRatingsPage driverId="demo-driver-id" /> },
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
    {
      path: "*",
      element: routeConfig.fallback,
    },
  ]);

  return element;
};