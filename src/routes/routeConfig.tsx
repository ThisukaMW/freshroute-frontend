import type { ComponentType, ReactElement } from "react";
import { lazy } from "react";
import { MainLayout } from "../components/layout/MainLayout/MainLayout.jsx";
import { useAuth } from "../hooks/useAuth";

const pageModules = import.meta.glob("../pages/**/*.{ts,tsx,jsx}");

const lazyPage = (pathBase: string) => {
  const loader =
    pageModules[`${pathBase}.tsx`] ??
    pageModules[`${pathBase}.ts`] ??
    pageModules[`${pathBase}.jsx`] ??
    pageModules[pathBase];

  if (!loader) {
    throw new Error(`Missing page module: ${pathBase}`);
  }

  return lazy(loader as () => Promise<{ default: ComponentType<unknown> }>);
};

const LandingPage = lazyPage("../pages/LandingPage");
const AdminLoginPage = lazyPage("../pages/admin/AdminLoginPage");
const AdminDashboardPage = lazyPage("../pages/admin/AdminDashboardPage");
const AdminAggregatorPage = lazyPage("../pages/admin/AdminAggregatorPage");
const UserManagementPage = lazyPage("../pages/admin/UserManagementPage");
const SellerManagementPage = lazyPage("../pages/admin/SellerManagementPage");
const BuyerManagementPage = lazyPage("../pages/admin/BuyerManagementPage");
const DriverManagementPage = lazyPage("../pages/admin/DriverManagementPage");
const OrderManagementPage = lazyPage("../pages/admin/OrderManagementPage");
const RouteManagementPage = lazyPage("../pages/admin/RouteManagementPage");
const AnalyticsPage = lazyPage("../pages/admin/AnalyticsPage");
const PaymentsPage = lazyPage("../pages/admin/PaymentsPage");
const TransactionHistoryPage = lazyPage(
  "../pages/admin/TransactionHistoryPage",
);
const SystemSettingsPage = lazyPage("../pages/admin/SystemSettingsPage");
const TruckCapacityPage = lazyPage("../pages/admin/TruckCapacityPage");
const AddTruckPage = lazyPage("../pages/admin/AddTruckPage");
const PaymentSuccessPage = lazyPage("../pages/buyer/PaymentSuccessPage");
const PaymentCancelPage = lazyPage("../pages/buyer/PaymentCancelPage");
const SignUpPage = lazyPage("../pages/SignUpPage");
const SignInPage = lazyPage("../pages/SignInPage");
const RoleSelectPage = lazyPage("../pages/RoleSelectPage");
const ForgotPasswordPage = lazyPage("../pages/auth/ForgotPasswordPage");
const ProductBrowsePage = lazyPage("../pages/buyer/ProductBrowsePage");
const SelectSellerPage = lazyPage("../pages/buyer/SelectSellerPage");
const CartPage = lazyPage("../pages/buyer/CartPage");
const DashboardPage = lazyPage("../pages/seller/DashboardPage");
const ProductsPage = lazyPage("../pages/seller/ProductsPage");
const AddProductPage = lazyPage("../pages/seller/AddProductPage");
const EditProductPage = lazyPage("../pages/seller/EditProductPage");
const InventoryPage = lazyPage("../pages/seller/InventoryPage");
const SellerRatingsPage = lazyPage("../pages/seller/SellerRatingsPage");
const DefaultBrowsePage = lazyPage("../pages/customer/DefaultBrowsePage");
const UnauthorizedPage = lazyPage("../pages/common/UnauthorizedPage");
const ServerErrorPage = lazyPage("../pages/common/ServerErrorPage");
const NotFoundPage = lazyPage("../pages/common/NotFoundPage");
const ResetPasswordPage = lazyPage("../pages/auth/ResetPasswordPage");
const BuyerRatingsPage = lazyPage("../pages/buyer/BuyerRatingsPage");
const OrderDetailPage = lazyPage("../pages/seller/OrderDetailPage");
const OrdersPage = lazyPage("../pages/seller/OrdersPage");
const HomePage = lazyPage("../pages/buyer/HomePage");
const OrderHistoryPage = lazyPage("../pages/buyer/OrderHistoryPage");
const ProfilePage = lazyPage("../pages/ProfilePage");
const SecureAccountPage = lazyPage("../pages/auth/SecureAccountPage");
const RateOrderPage = lazyPage("../pages/buyer/RateOrderPage");
const CheckoutPage = lazyPage("../pages/buyer/CheckoutPage");
const NotificationsPage = lazyPage("../pages/NotificationPage");
const PendingApprovalsPage = lazyPage("../pages/admin/PendingApprovalsPage");
const PendingApprovalPage = lazyPage("../pages/PendingApprovalPage");

// Shape of a basic public route — path and the element to render
interface RouteConfig {
  path: string;
  element: ReactElement;
}

// Extends RouteConfig with an optional roles array for role-based access control
interface ProtectedRouteConfig extends RouteConfig {
  roles?: string[];
}

const NotificationsRoute = () => {
  const { user } = useAuth();
  const role = (user?.role?.toLowerCase() ?? "buyer") as
    | "buyer"
    | "seller"
    | "admin";
  return (
    <MainLayout role={role}>
      <NotificationsPage />
    </MainLayout>
  );
};

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
    { path: "/pending-approval", element: <PendingApprovalPage /> },
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
    // Admin order aggregator override page
    {
      path: "/admin/aggregator",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <AdminAggregatorPage />
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
    {
      path: "/admin/approvals",
      roles: ["admin"],
      element: (
        <MainLayout role="admin">
          <PendingApprovalsPage />
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
    // {
    //   path: "/buyer/products/:id",
    //   roles: ["buyer"],
    //   element: (
    //     <MainLayout role="buyer">
    //       <ProductDetailPage  />
    //     </MainLayout>
    //   ),
    // },
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
      path: "/buyer/checkout",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <CheckoutPage />
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
    {
      path: "/buyer/ratings",
      element: (
        <MainLayout role="buyer">
          <BuyerRatingsPage />
        </MainLayout>
      ),
    },
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
    {
      path: "/notifications",
      roles: ["buyer", "seller", "admin"],
      element: <NotificationsRoute />,
    },
  ],

  // Rendered when no route matches — 404 not found page
  fallback: <NotFoundPage />,
  // Rendered when an unexpected server or runtime error occurs
  error: <ServerErrorPage />,
  // Rendered when a user tries to access a route their role isn't permitted for
  unauthorized: <UnauthorizedPage />,
};
