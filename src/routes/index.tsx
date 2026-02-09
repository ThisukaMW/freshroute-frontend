import { useRoutes } from "react-router-dom";
import { PublicRoute } from "./PublicRoute";
import { PrivateRoute } from "./PrivateRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";
import { routeConfig } from "./routeConfig";

export const AppRoutes = () => {
  const element = useRoutes([
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
