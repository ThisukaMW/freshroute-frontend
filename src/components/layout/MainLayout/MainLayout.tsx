import React from "react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../common/Button/Button"

/* ---------- TYPES ---------- */

// allowed roles
type Role = "buyer" | "seller" | "admin";

// props for layout
interface MainLayoutProps {
  role: Role;
  children: ReactNode;
}

// navigation item type
interface NavItem {
  to: string;
  label: string;
}

/* ---------- NAVIGATION ---------- */

const navByRole: Record<Role, NavItem[]> = {
  buyer: [
    { to: "/buyer", label: "Dashboard" },
    { to: "/buyer/products", label: "Browse" },
    { to: "/buyer/cart", label: "Cart" },
    { to: "/buyer/orders", label: "Orders" },
  ],
  seller: [
    { to: "/seller", label: "Dashboard" },
    { to: "/seller/products", label: "Products" },
    { to: "/seller/orders", label: "Orders" },
    { to: "/seller/inventory", label: "Inventory" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/trucks", label: "Trucks" },
    { to: "/admin/analytics", label: "Analytics" },
  ],
};

/* ---------- COMPONENT ---------- */

export const MainLayout: React.FC<MainLayoutProps> = ({
  role,
  children,
}) => {
  const { user, logout } = useAuth();
  const navItems = navByRole[role] ?? [];

  return (
    <div className="flex min-h-screen bg-brand-background text-slate-50">
      {/* SIDEBAR */}
      <aside className="hidden w-64 flex-col border-r border-brand-muted/60 bg-gradient-to-bl from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4 py-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary/20" />
          <div>
            <p className="text-sm font-semibold">FreshRoute</p>
            <p className="text-xs text-slate-400 capitalize">
              {role} workspace
            </p>
          </div>
        </Link>

        <nav className="space-y-1 text-sm">
          {navItems.map((item) => (
            // <NavLink
            //   key={item.to}
            //   to={item.to}
            //   className={({ isActive }) =>
            //     [
            //       "flex items-center justify-between rounded-xl px-3 py-2 transition",
            //       isActive
            //         ? "bg-primary/15 text-primary-light"
            //         : "text-slate-300 hover:bg-slate-900/60",
            //     ].join(" ")
            //   }
            // >
            //   <span>{item.label}</span>
            // </NavLink>
            <NavLink
  key={item.to}
  to={item.to}
  end={item.to === `/${role}`}   // ✅ IMPORTANT
  className={({ isActive }) =>
    [
      "flex items-center justify-between rounded-xl px-3 py-2 transition",
      isActive
        ? "bg-primary/15 text-primary-light"
        : "text-slate-300 hover:bg-slate-900/60",
    ].join(" ")
  }
>
  <span>{item.label}</span>
</NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user?.name ?? "User"}</p>
              <p className="capitalize">{user?.role ?? role}</p>
            </div>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-tr from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2 md:hidden">
            <span className="h-8 w-8 rounded-lg bg-primary/20" />
            <span className="text-sm font-semibold">FreshRoute</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <span className="hidden text-xs text-slate-400 md:inline">
              {new Date().toLocaleDateString()} · Prototype UI
            </span>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-3 py-4 md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
};