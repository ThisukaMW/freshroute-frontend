/**
 * Navbar.tsx
 * Top navigation bar — transparent at page top, dark frosted glass when scrolled.
 * Shows different links based on who is using the app (public, customer, vendor, admin).
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { JSX } from "react";

/* Controls which links show in the navbar based on user type */
type NavbarProps = {
  variant?: "public" | "customer" | "vendor" | "admin";
};

/* Main navbar — style changes when user scrolls past 20px */
const Navbar = ({ variant = "public" }: NavbarProps): JSX.Element => {

  /* true when user has scrolled down, false when at top */
  const [scrolled, setScrolled] = useState<boolean>(false);

  /* Watches scroll position and updates `scrolled` state — cleans up when navbar is removed */
  useEffect(() => {
    const onScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    /* Switches between transparent gradient and frosted glass depending on scroll */
    <header
      className="transition-all duration-300"
      style={scrolled ? {
        background: "#020617 20%",
        backdropFilter: "blur(16px)",
        boxShadow: "0 1px 8px rgba(0,0,0,0.4)",
        padding: "4px 0",
      } : {
        background: "linear-gradient(to bottom, #020617 0%, #020617 60%, transparent 100%)",
      }}
    >
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-4 ${scrolled ? "py-2" : "py-3"}`}>

        {/* Logo — clicking takes user to home page */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark text-white font-semibold ring-2 ring-emerald-400/60">
            FR
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-50">
            Fresh<span className="text-emerald-400">Route</span>
          </span>
        </Link>

        {/* Middle nav links — only for public users, hidden on mobile */}
        {variant === "public" && (
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/#how-it-works" className="text-slate-200 hover:text-white">How it works</Link>
            <Link to="/signup/customer" className="text-slate-200 hover:text-white">For customers</Link>
            <Link to="/signup/vendor" className="text-slate-200 hover:text-white">For vendors</Link>
          </nav>
        )}

        {/* Sign In / Sign Up buttons — only shown for public users */}
        <div className="flex items-center gap-3 text-sm">
          {variant === "public" && (
            <>
              {/* Sign In hidden on mobile, visible on larger screens */}
              <Link to="/signin" className="hidden text-slate-200 hover:text-white md:inline-block">Sign In</Link>
              {/* Sign Up goes to role select page first */}
              <Link to="/signup" className="rounded-full bg-primary px-4 py-1.5 text-white hover:bg-primary-dark">Sign Up</Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;