// import { Navigate } from "react-router-dom";
// import type { ReactElement } from "react";
// //import InventoryPage from "../pages/seller/InventoryPage";
// //import ProductBrowsePage from "../pages/buyer/ProductBrowsePage";
// //import ProductsPage from "../pages/seller/ProductsPage";
// //import LandingPage from "../pages/LandingPage";
// //import AddProductPage from "../pages/seller/AddProductPage.tsx";
// import ProductBrowsePage from "../pages/buyer/ProductBrowsePage.tsx";
// import InventoryPage from "../pages/seller/InventoryPage.tsx";
// import SelectSellerPage from "../pages/buyer/SelectSellerPage.tsx";
// //import SelectSellerPage from "../pages/buyer/SelectSellerPage.tsx";
// //import DashboardPage from "../pages/seller/DashboardPage.tsx";

// interface RouteConfig {
//   path: string;
//   element: ReactElement;
// }

// interface ProtectedRouteConfig extends RouteConfig {
//   roles?: string[];
// }

// export const routeConfig: {
//   public: RouteConfig[];
//   protected: ProtectedRouteConfig[];
//   fallback: ReactElement;
// } = {
//   public: [
    
//     {
//       path: "/",
//       element: <InventoryPage/>,
//     },
//   ],
//   protected: [
//     // Add your protected routes here
//     // Example:
//     // {
//     //   path: "/buyer",
//     //   element: <BuyerDashboard />,
//     //   roles: ["buyer"],
//     // },
//     {
//       path: "/buyer/products/:id/sellers",
//       roles: ["buyer"],
//       element: (
//         <MainLayout role="buyer"><SelectSellerPage</MainLayout> 
          
        
//       ),
//     },
//   ],
//   fallback: <Navigate to="/" replace />,
// };


import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

import LandingPage from "../pages/LandingPage";
import SignUpCustomerPage from "../pages/SignUpCustomerPage";
import SignUpVendorPage from "../pages/SignUpVendorPage";
import SignInPage from "../pages/SignInPage";
import SellerLoginPage from "../pages/seller/SellerLoginPage";
import RoleSelectPage from "../pages/RoleSelectPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";



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
import OrderDetailPage from "../pages/seller/OrderDetailPage.tsx";
import OrdersPage from "../pages/seller/OrdersPage.tsx";
import HomePage from "../pages/buyer/HomePage.tsx";
import OrderHistoryPage from "../pages/buyer/OrderHistoryPage.tsx";
import CheckoutPage from "../pages/buyer/CheckoutPage.tsx";

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
    
    
    // {
    //  path: "/signin",
    //   element: <SignInPage />,
    // },
    // {
    //   path: "/signup",
    //   element: <RoleSelectPage />,
    // },
    // {
    //   path: "/signup/customer",
    //   element: <SignUpCustomerPage />,
    // },
    // {
    //   path: "/signup/vendor",
    //   element: <SignUpVendorPage />,
    // },
   

    
    // {
    //   path: "/seller/login",
    //   element: <SellerLoginPage />,
    // },
    // {
    //   path: "/admin/login",
    //   element: <AdminLoginPage />,
    // },

    // Auth pages using the new AuthLayout shell
    // {
    //   path: "/auth/login",
    //   element: <Navigate to="/" replace />,
    // },
    // {
    //   path: "/auth/register",
    //   element: (
    //     <AuthLayout>
    //       <RegisterPage />
    //     </AuthLayout>
    //   ),
    // },
    // {
    //   path: "/auth/forgot-password",
    //   element: (
    //     <AuthLayout>
    //       <ForgotPasswordPage />
    //     </AuthLayout>
    //   ),
    // },
    

  ],

  protected: [
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
      path: "/buyer/products/:id/sellers",
      roles: ["buyer"],
      element: (
        <MainLayout role="buyer">
          <SelectSellerPage />
        </MainLayout>
      ),
    },
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
    // {
    //   path: "/buyer/orders/:id",
    //   roles: ["buyer"],
    //   element: (
    //     <MainLayout role="buyer">
    //       <BuyerOrderDetailPage />
    //     </MainLayout>
    //   ),
    // },
    // {
    //   path: "/buyer/track/:id",
    //   roles: ["buyer"],
    //   element: (
    //     <MainLayout role="buyer">
    //       <TrackOrderPage />
    //     </MainLayout>
    //   ),
    // },
    // {
    //   path: "/buyer/profile",
    //   roles: ["buyer"],
    //   element: (
    //     <MainLayout role="buyer">
    //       <BuyerProfilePage />
    //     </MainLayout>
    //   ),
    // },
    // {
    //   path: "/buyer/rate/:id",
    //   roles: ["buyer"],
    //   element: (
    //     <MainLayout role="buyer">
    //       <RateOrderPage />
    //     </MainLayout>
    //   ),
    // },

    // Seller
    {
      path: "/seller",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          < DashboardPage/>
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
      //roles: ["seller"],
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
          <EditProductPage/>
        </MainLayout>
      ),
    },
    {
      path: "/seller/inventory",
      roles: ["seller"],
      element: (
        <MainLayout role="seller">
          <InventoryPage/>
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

  //   {
  //     path: "/seller/deliveries",
  //     roles: ["seller"],
  //     element: (
  //       <MainLayout role="seller">
  //         <DeliveryHistoryPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/seller/earnings",
  //     roles: ["seller"],
  //     element: (
  //       <MainLayout role="seller">
  //         <EarningsPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/seller/tracking",
  //     roles: ["seller"],
  //     element: (
  //       <MainLayout role="seller">
  //         <LiveTrackingPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/seller/reports",
  //     roles: ["seller"],
  //     element: (
  //       <MainLayout role="seller">
  //         <SellerReportsPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/seller/profile",
  //     roles: ["seller"],
  //     element: (
  //       <MainLayout role="seller">
  //         <SellerProfilePage />
  //       </MainLayout>
  //     ),
  //   },

  //   // Admin
  //   {
  //     path: "/admin",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <AdminDashboardPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/users",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <UserManagementPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/sellers",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <SellerManagementPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/buyers",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <BuyerManagementPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/drivers",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <DriverManagementPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/orders",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <OrderManagementPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/routes",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <RouteManagementPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/tracking",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <TrackingPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/analytics",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <AnalyticsPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/payments",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <PaymentsPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/transactions",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <TransactionHistoryPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/settings",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <SystemSettingsPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/reports",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <AdminReportsPage />
  //       </MainLayout>
  //     ),
  //   },
  //   {
  //     path: "/admin/trucks",
  //     roles: ["admin"],
  //     element: (
  //       <MainLayout role="admin">
  //         <TruckCapacityPage />
  //       </MainLayout>
  //     ),
  //   },
  // ],
  // fallback: <NotFoundPage />,
  // error: <ServerErrorPage />,
  // unauthorized: <UnauthorizedPage />,
  ],
  fallback: <NotFoundPage />,
  error: <ServerErrorPage />,
  unauthorized: <UnauthorizedPage />,
};