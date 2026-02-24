import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

import LandingPage from "../pages/LandingPage";
import SignUpCustomerPage from "../pages/SignUpCustomerPage";
import SignUpVendorPage from "../pages/SignUpVendorPage";
import SignInPage from "../pages/SignInPage";
import SellerLoginPage from "../pages/seller/SellerLoginPage";
import RoleSelectPage from "../pages/RoleSelectPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";

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
    {
      path: "/signup",
      element: <RoleSelectPage />,
    },
    {
      path: "/signup/customer",
      element: <SignUpCustomerPage />,
    },
    {
      path: "/signup/vendor",
      element: <SignUpVendorPage />,
    },
    {
      path: "/signin",
      element: <SignInPage />,
    },
    {
      path: "/seller/login",
      element: <SellerLoginPage />,
    },
    {
      path: "/admin/login",           
      element: <AdminLoginPage />,    
    },
  ],
  protected: [
    
  ],
  fallback: <Navigate to="/" replace />,
};
