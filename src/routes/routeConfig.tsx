import { Navigate } from "react-router-dom";
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

import { MainLayout } from "../components/layout/MainLayout/MainLayout";

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
      path: "/admin/login",
      element: <AdminLoginPage />,
    },

    {
      path: "/payment-success",
      element: <PaymentSuccessPage />,
    },
    {
      path: "/payment-cancel",
      element: <PaymentCancelPage />,
    },
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


  ],
  fallback: <Navigate to="/" replace />,
};