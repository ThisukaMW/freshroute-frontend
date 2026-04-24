import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../common/Button/Button";

type Role = "buyer" | "seller" | "admin";

interface MainLayoutProps {
  role: Role;
  children: ReactNode;
  hideSidebar?: boolean;
}

interface NavItem {
  to: string;
  label: string;
}

const navByRole: Record<Role, NavItem[]> = {
  buyer: [
    { to: "/buyer", label: "Dashboard" },
    { to: "/buyer/products", label: "Browse" },
    { to: "/buyer/cart", label: "Cart" },
    { to: "/buyer/orders", label: "Orders" },
    { to: "/buyer/ratings", label: "My Reviews" }
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

const profilePathByRole: Record<Role, string> = {
  buyer: "/profile",
  seller: "/seller/profile",
  admin: "/admin/profile",
};

const profileNavByRole: Record<Role, { to: string; label: string }[]> = {
  buyer: [
    { to: "/profile", label: "Personal Info" },
    { to: "/profile?tab=orders", label: "Orders" },
    { to: "/profile?tab=address", label: "Delivery Address" },
    { to: "/profile?tab=password", label: "Password" },
    { to: "/profile?tab=settings", label: "Settings" },
  ],
  seller: [
    { to: "/seller/profile", label: "Personal Info" },
    { to: "/seller/profile?tab=business", label: "Business Info" },
    { to: "/seller/profile?tab=password", label: "Password" },
    { to: "/seller/profile?tab=settings", label: "Settings" },
  ],
  admin: [
    { to: "/admin/profile", label: "Personal Info" },
    { to: "/admin/profile?tab=password", label: "Password" },
  ],
};

export const MainLayout: React.FC<MainLayoutProps> = ({ role, children, hideSidebar = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navByRole[role] ?? [];
  const profileNavItems = profileNavByRole[role] ?? [];

  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sidebarContent = (onNavigate?: () => void) => (
    <>
      <Link to="/" className="mb-8 flex items-center gap-2" onClick={onNavigate}>
        <span className="h-8 w-8 rounded-lg bg-primary/20" />
        <div>
          <p className="text-sm font-semibold">FreshRoute</p>
          <p className="text-xs text-slate-400 capitalize">{role} workspace</p>
        </div>
      </Link>

      <nav className="space-y-1 text-sm">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/${role}`}
            onClick={onNavigate}
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
    </>
  );

  return (
    // overflow-hidden here prevents the whole page from scrolling on re-render
    <div className={`flex h-screen overflow-hidden text-slate-50 ${hideSidebar ? 'bg-brand-background' : 'bg-brand-background'}`}>

      {/* NORMAL SIDEBAR */}
      {!hideSidebar && (
        <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-brand-muted/60 bg-gradient-to-bl from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4 py-6 md:flex">
          {sidebarContent()}

          <div className="mt-auto border-t border-slate-800 pt-4 text-xs text-slate-400" ref={dropdownRef}>
            {profileOpen && (
              <div className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-brand-background/95 shadow-xl backdrop-blur-xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="truncate text-xs font-semibold text-slate-50">{user?.name ?? 'User'}</p>
                  <p className="truncate text-[11px] text-slate-400">{user?.email ?? ''}</p>
                </div>
                {profileNavItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.to); setProfileOpen(false); }}
                    className="flex w-full items-center px-4 py-2.5 text-xs text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-white/10" />
                <button
                  onClick={() => { logout(); setProfileOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-white/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-white/5 transition-colors"
                title="My Profile"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/80 to-supply-teal/60 text-xs font-bold text-white ring-2 ring-white/20">
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-200">{user?.name ?? "User"}</p>
                  <p className="capitalize text-slate-400">{user?.role ?? role}</p>
                </div>
              </button>
              <Button variant="ghost" onClick={logout}>Logout</Button>
            </div>
          </div>
        </aside>
      )}

      {/* HAMBURGER DRAWER */}
      {hideSidebar && (
        <>
          {navDrawerOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={() => setNavDrawerOpen(false)}
            />
          )}
          <aside
            className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/10 bg-brand-background/95 px-4 py-6 transition-transform duration-300 ${
              navDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <button
              onClick={() => setNavDrawerOpen(false)}
              className="mb-6 self-end rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
              aria-label="Close navigation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {sidebarContent(() => setNavDrawerOpen(false))}

            <div className="mt-auto border-t border-white/10 pt-4">
              <button
                onClick={() => { logout(); setNavDrawerOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-red-400 hover:bg-white/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* CONTENT AREA */}
      {/* flex-col + h-full so header/footer are fixed and only main scrolls */}
      <div className="flex h-full flex-1 flex-col">
        <header className={`flex-shrink-0 flex items-center justify-between border-b px-4 py-3 backdrop-blur ${
          hideSidebar
            ? 'border-supply-teal/30 bg-gradient-to-tr from-brand-background/90 via-supply-teal/40 to-supply-teal/30'
            : 'border-slate-800/80 bg-gradient-to-tr from-brand-background/90 via-supply-teal/60 to-supply-teal/45'
        }`}>
          <div className="flex items-center gap-3">
            {hideSidebar && (
              <button
                onClick={() => setNavDrawerOpen(true)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
                aria-label="Open navigation menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2 md:hidden">
              <span className="h-8 w-8 rounded-lg bg-primary/20" />
              <span className="text-sm font-semibold">FreshRoute</span>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <span className="hidden text-xs text-slate-400 md:inline">
              {new Date().toLocaleDateString()} · Prototype UI
            </span>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </div>
        </header>

        {/* only this scrolls, not the whole page */}
        <main className={`flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 ${
          hideSidebar
            ? 'bg-gradient-to-br from-brand-background/95 via-supply-teal/40 to-supply-teal/30'
            : 'bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45'
        }`}>
          {children}
        </main>


      </div>
    </div>
  );
};