import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

import LandingPage from "../pages/LandingPage";
import SignUpCustomerPage from "../pages/SignUpCustomerPage";
import SignUpVendorPage from "../pages/SignUpVendorPage";
import SignInPage from "../pages/SignInPage";
import SellerLoginPage from "../pages/seller/SellerLoginPage";
import RoleSelectPage from "../pages/RoleSelectPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import { MainLayout } from "../components/layout/MainLayout/MainLayout.jsx";
import { AuthLayout } from "../components/layout/AuthLayout/AuthLayout.jsx";
import ProductBrowsePage from "../pages/buyer/ProductBrowsePage";
import SelectSellerPage from "../pages/buyer/SelectSellerPage.tsx";
import CartPage from "../pages/buyer/CartPage.tsx";
import DashboardPage from "../pages/seller/DashboardPage.tsx";
import ProductsPage from "../pages/seller/ProductsPage.tsx";
import AddProductPage from "../pages/seller/AddProductPage.tsx";
import EditProductPage from "../pages/seller/EditProductPage.tsx";
import InventoryPage from "../pages/seller/InventoryPage";
import DefaultBrowsePage from "../pages/customer/DefaultBrowsePage.tsx";
import UnauthorizedPage from "../pages/common/UnauthorizedPage.tsx";
import ServerErrorPage from "../pages/common/ServerErrorPage.tsx";
import NotFoundPage from "../pages/common/NotFoundPage.tsx";

/* ---------- types ---------- */
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
  error?: ReactElement;
  unauthorized?: ReactElement;
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
      path: "/products",
      element: <DefaultBrowsePage />,
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
    {
      path: "/forgot-password",
      element: (
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      ),
    },
  ],

  protected: [
    {
      path: "/buyer/products",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <ProductBrowsePage />
        </MainLayout>
      ),
    },
    {
      path: "/buyer/products/:id/sellers",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <SelectSellerPage />
        </MainLayout>
      ),
    },
    {
      path: "/buyer/cart",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <CartPage />
        </MainLayout>
      ),
    },

    // Seller
    {
      path: "/seller",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <DashboardPage />
        </MainLayout>
      ),
    },
    {
      path: "/seller/products",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <ProductsPage />
        </MainLayout>
      ),
    },
    {
      path: "/seller/products/add",
      element: (
        <MainLayout role="seller">
          <AddProductPage />
        </MainLayout>
      ),
    },
    {
      path: "/seller/products/:id/edit",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <EditProductPage />
        </MainLayout>
      ),
    },
    {
      path: "/seller/inventory",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <InventoryPage />
        </MainLayout>
      ),
    },
  ],
  fallback: <NotFoundPage />,
  error: <ServerErrorPage />,
  unauthorized: <UnauthorizedPage />,
};