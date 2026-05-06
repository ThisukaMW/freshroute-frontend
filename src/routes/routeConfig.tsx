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
// SignUpPage handles both customer and vendor registration via the :role URL param
import SignUpPage from "../pages/SignUpPage.tsx";
import SignInPage from "../pages/SignInPage";
// RoleSelectPage is the landing point for /signup — users pick Customer or Vendor here
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
import RateOrderPage from '../pages/buyer/RateOrderPage';

// Shape of a basic public route — path and the element to render
interface RouteConfig {
  path: string;
  element: ReactElement;
}

// Extends RouteConfig with an optional roles array for role-based access control
interface ProtectedRouteConfig extends RouteConfig {
  roles?: string[];
}

// Central route registry — consumed by the router to register all public and protected routes
export const routeConfig: {
  public: RouteConfig[];
  protected: ProtectedRouteConfig[];
  fallback: ReactElement;
  error?: ReactElement;
  unauthorized?: ReactElement;
} = {

  // ─── Public Routes ────────────────────────────────────────────────────────
  // Accessible by anyone regardless of authentication state
  public: [
    // Root landing page — marketing and entry point for all users
    { path: "/", element: <LandingPage /> },
    // Role picker — user selects Customer or Vendor before reaching a signup form
    { path: "/signup", element: <RoleSelectPage /> },
    // Dynamic signup form — :role param is either 'customer' or 'vendor'
    { path: "/signup/:role", element: <SignUpPage /> },
    // Public product browse — visible without login for discovery
    { path: "/products", element: <DefaultBrowsePage /> },
    // Unified sign-in page — backend detects role and redirects accordingly
    { path: "/signin", element: <SignInPage /> },
    // Seller-specific login alias — same page, separate entry point for vendors
    { path: "/seller/login", element: <SignInPage /> },
    // Dedicated admin login — separate from the main sign-in flow
    { path: "/admin/login", element: <AdminLoginPage /> },
    // Password reset request page — user enters email to receive reset link
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    // Password reset confirmation page — reached via link in the reset email
    { path: "/reset-password", element: <ResetPasswordPage /> },
    // Stripe payment success callback — shown after a successful checkout
    { path: "/payment-success", element: <PaymentSuccessPage /> },
    // Stripe payment cancel callback — shown when user cancels at checkout
    { path: "/payment-cancel", element: <PaymentCancelPage /> },
    // Account security page — reached via link in a security verification email
    { path: "/auth/secure-account", element: <SecureAccountPage /> },
  ],

  // ─── Protected Routes ─────────────────────────────────────────────────────
  // Require authentication; roles array limits access to specific user types
  protected: [

    // ── Admin routes ────────────────────────────────────────────────────────

    // Admin overview dashboard — entry point after admin login
    {
      path: "/admin",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <AdminDashboardPage />
        </MainLayout>
      ),
    },
    // Full user list — admin can view, search and manage all platform users
    {
      path: "/admin/users",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <UserManagementPage />
        </MainLayout>
      ),
    },
    // Seller management — admin can approve, suspend or review vendor accounts
    {
      path: "/admin/sellers",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <SellerManagementPage />
        </MainLayout>
      ),
    },
    // Buyer management — admin can view and manage customer accounts
    {
      path: "/admin/buyers",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <BuyerManagementPage />
        </MainLayout>
      ),
    },
    // Driver management — admin can assign, track and manage delivery drivers
    {
      path: "/admin/drivers",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <DriverManagementPage />
        </MainLayout>
      ),
    },
    // Order management — admin can view and action all platform orders
    {
      path: "/admin/orders",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <OrderManagementPage />
        </MainLayout>
      ),
    },
    // Route management — admin configures delivery zones and driver routes
    {
      path: "/admin/routes",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <RouteManagementPage />
        </MainLayout>
      ),
    },
    // Analytics dashboard — platform-wide sales, orders and usage insights
    {
      path: "/admin/analytics",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <AnalyticsPage />
        </MainLayout>
      ),
    },
    // Payments overview — admin can review all payment transactions
    {
      path: "/admin/payments",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <PaymentsPage />
        </MainLayout>
      ),
    },
    // Full transaction history — detailed log of all financial activity
    {
      path: "/admin/transactions",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <TransactionHistoryPage />
        </MainLayout>
      ),
    },
    // System settings — platform configuration and feature toggles
    {
      path: "/admin/settings",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <SystemSettingsPage />
        </MainLayout>
      ),
    },
    // Truck capacity overview — admin manages delivery vehicle capacity
    {
      path: "/admin/trucks",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <TruckCapacityPage />
        </MainLayout>
      ),
    },
    // Add new truck — form to register a new delivery vehicle
    {
      path: "/admin/trucks/add",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <AddTruckPage />
        </MainLayout>
      ),
    },
    // Admin profile — hideSidebar keeps the layout clean for profile editing
    {
      path: "/admin/profile",
      roles: ["admin"],
      element: (
        <MainLayout role="admin" hideSidebar>
          <ProfilePage />
        </MainLayout>
      ),
    },

    // ── Buyer routes ─────────────────────────────────────────────────────────

    // Buyer home — personalised landing page after login
    {
      path: "/buyer",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <HomePage />
        </MainLayout>
      ),
    },
    // Product browse — buyer searches and filters available products
    {
      path: "/buyer/products",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <ProductBrowsePage />
        </MainLayout>
      ),
    },
    // Cart — buyer reviews selected items before proceeding to checkout
    {
      path: "/buyer/cart",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <CartPage />
        </MainLayout>
      ),
    },
    // Seller selection — buyer picks which vendor to buy a specific product from
    {
      path: "/buyer/products/:id/sellers",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <SelectSellerPage />
        </MainLayout>
      ),
    },
    // Order history — buyer views past and active orders with status
    {
      path: "/buyer/orders",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <OrderHistoryPage />
        </MainLayout>
      ),
    },
    // Buyer profile — hideSidebar keeps the layout clean for profile editing
    {
      path: "/profile",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer" hideSidebar>
          <ProfilePage />
        </MainLayout>
      ),
    },

    {
      path: "/buyer/rate/:orderId/:productId",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <RateOrderPage />
        </MainLayout>
      ),
    },

    // ── Seller routes ─────────────────────────────────────────────────────────

    // Seller dashboard — vendor overview of orders, earnings and activity
    {
      path: "/seller",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <DashboardPage />
        </MainLayout>
      ),
    },
    // Seller product list — vendor manages all their listed products
    {
      path: "/seller/products",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <ProductsPage />
        </MainLayout>
      ),
    },
    // Add product — form for the vendor to create a new product listing
    {
      path: "/seller/products/add",
      element: (
        <MainLayout role="seller">
          <AddProductPage />
        </MainLayout>
      ),
    },
    // Edit product — vendor updates pricing, stock or details of an existing product
    {
      path: "/seller/products/:id/edit",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <EditProductPage />
        </MainLayout>
      ),
    },
    // Inventory — vendor manages stock levels and availability toggles
    {
      path: "/seller/inventory",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <InventoryPage />
        </MainLayout>
      ),
    },
    // Seller profile — hideSidebar keeps the layout clean for profile editing
    {
      path: "/seller/profile",
      roles: ["seller"],
      element: (
        <MainLayout role="seller" hideSidebar>
          <ProfilePage />
        </MainLayout>
      ),
    },
    // Buyer ratings — buyer can view and submit ratings for completed orders
    { path: "/buyer/ratings", element: <MainLayout role="buyer"><BuyerRatingsPage /></MainLayout> },
    // Seller reviews — vendor views all customer ratings left for their store
    {
      path: "/seller/reviews",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <SellerRatingsPage />
        </MainLayout>
      ),
    },
    // Seller orders list — vendor views all incoming and historical orders
    {
      path: "/seller/orders",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <OrdersPage />
        </MainLayout>
      ),
    },
    // Order detail — vendor views full details and status of a specific order
    {
      path: "/seller/orders/:id",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <OrderDetailPage />
        </MainLayout>
      ),
    },
    // Checkout — buyer enters delivery details and completes payment
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

  // Rendered when no route matches — 404 not found page
  fallback: <NotFoundPage />,
  // Rendered when an unexpected server or runtime error occurs
  error: <ServerErrorPage />,
  // Rendered when a user tries to access a route their role isn't permitted for
  unauthorized: <UnauthorizedPage />,
};