import type { ReactElement } from "react";
import LandingPage from "../pages/LandingPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import SellerManagementPage from "../pages/admin/SellerManagementPage";
import BuyerManagementPage from "../pages/admin/BuyerManagementPage";
import DriverManagementPage from "../pages/admin/DriverManagementPage";
import OrderManagementPage from "../pages/admin/OrderManagementPage";
import RouteManagementPage from "../pages/admin/RouteManagementPage";
import AnalyticsPage from "../pages/admin/AnalyticsPage";
import PaymentsPage from "../pages/admin/PaymentsPage";
import TransactionHistoryPage from "../pages/admin/TransactionHistoryPage";
import SystemSettingsPage from "../pages/admin/SystemSettingsPage";
import TruckCapacityPage from "../pages/admin/TruckCapacityPage";
import AddTruckPage from "../pages/admin/AddTruckPage";
import PaymentSuccessPage from "../pages/buyer/PaymentSuccessPage";
import PaymentCancelPage from "../pages/buyer/PaymentCancelPage";
import SignUpPage from "../pages/SignUpPage.tsx";
import SignInPage from "../pages/SignInPage";
import RoleSelectPage from "../pages/RoleSelectPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import { MainLayout } from "../components/layout/MainLayout/MainLayout.jsx";
import ProductBrowsePage from "../pages/buyer/ProductBrowsePage";
import SelectSellerPage from "../pages/buyer/SelectSellerPage.tsx";
import CartPage from "../pages/buyer/CartPage.tsx";
import CheckoutPage from "../pages/buyer/CheckoutPage.tsx";
import DashboardPage from "../pages/seller/DashboardPage.tsx";
import ProductsPage from "../pages/seller/ProductsPage.tsx";
import AddProductPage from "../pages/seller/AddProductPage.tsx";
import EditProductPage from "../pages/seller/EditProductPage.tsx";
import InventoryPage from "../pages/seller/InventoryPage";
import SellerRatingsPage from '../pages/seller/SellerRatingsPage';
import DefaultBrowsePage from "../pages/customer/DefaultBrowsePage.tsx";
import UnauthorizedPage from "../pages/common/UnauthorizedPage.tsx";
import ServerErrorPage from "../pages/common/ServerErrorPage.tsx";
import NotFoundPage from "../pages/common/NotFoundPage.tsx";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.tsx";
import BuyerRatingsPage from '../pages/buyer/BuyerRatingsPage';
import OrderDetailPage from "../pages/seller/OrderDetailPage.tsx";
import OrdersPage from "../pages/seller/OrdersPage.tsx";
import HomePage from "../pages/buyer/HomePage.tsx";
import OrderHistoryPage from "../pages/buyer/OrderHistoryPage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";
import SecureAccountPage from "../pages/auth/SecureAccountPage";

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
    { path: "/", element: <LandingPage /> },
    { path: "/signup", element: <RoleSelectPage /> },
    { path: "/signup/:role", element: <SignUpPage /> },
    { path: "/products", element: <DefaultBrowsePage /> },
    { path: "/signin", element: <SignInPage /> },
    { path: "/seller/login", element: <SignInPage /> },
    { path: "/admin/login", element: <AdminLoginPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
    { path: "/payment-success", element: <PaymentSuccessPage /> },
    { path: "/payment-cancel", element: <PaymentCancelPage /> },
    { path: "/auth/secure-account", element: <SecureAccountPage /> },
  ],

  protected: [
    {
      path: "/admin",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <AdminDashboardPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/users",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <UserManagementPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/sellers",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <SellerManagementPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/buyers",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <BuyerManagementPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/drivers",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <DriverManagementPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/orders",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <OrderManagementPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/routes",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <RouteManagementPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/analytics",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <AnalyticsPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/payments",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <PaymentsPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/transactions",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <TransactionHistoryPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/settings",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <SystemSettingsPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/trucks",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <TruckCapacityPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/trucks/add",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <AddTruckPage />
        </MainLayout>
      ),
    },
    {
      path: "/admin/profile",
      roles: ["admin"],
      element: (
        <MainLayout role="admin" hideSidebar>
          <ProfilePage />
        </MainLayout>
      ),
    },

    // Buyer
    {
      path: "/buyer",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <HomePage />
        </MainLayout>
      ),
    },
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
      path: "/buyer/cart",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <CartPage />
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
      path: "/buyer/orders",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <OrderHistoryPage />
        </MainLayout>
      ),
    },
    {
      path: "/profile",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer" hideSidebar>
          <ProfilePage />
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
    {
      path: "/seller/profile",
      roles: ["seller"],
      element: (
        <MainLayout role="seller" hideSidebar>
          <ProfilePage />
        </MainLayout>
      ),
    },
    { path: "/buyer/ratings", element: <MainLayout role="buyer"><BuyerRatingsPage /></MainLayout> },
    {
      path: "/seller/reviews",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <SellerRatingsPage />
        </MainLayout>
      ),
    },
    {
      path: "/seller/orders",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <OrdersPage />
        </MainLayout>
      ),
    },
    {
      path: "/seller/orders/:id",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <OrderDetailPage />
        </MainLayout>
      ),
    },
    {
      path: "/buyer/checkout",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <CheckoutPage />
        </MainLayout>
      ),
    },
  ],

  fallback: <NotFoundPage />,
  error: <ServerErrorPage />,
  unauthorized: <UnauthorizedPage />,
};