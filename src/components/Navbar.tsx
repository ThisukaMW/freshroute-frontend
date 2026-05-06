import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { JSX } from 'react';

// Navbar variant controls which links/buttons are visible per user role
type NavbarProps = {
  variant?: "public" | "customer" | "vendor" | "admin";
};

// Fixed top navbar — switches from transparent gradient to frosted glass on scroll
const Navbar = ({ variant = "public" }: NavbarProps): JSX.Element => {

  const [scrolled, setScrolled] = useState<boolean>(false);

  // Listens for scroll past 20px then toggles the scrolled style
  useEffect(() => {
    const onScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Transparent gradient when at top, dark frosted glass when scrolled
    <header
      className="transition-all duration-300"
      style={scrolled ? {
        background: '#020617',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.4)',
        padding: '4px 0',
      } : {
        background: 'linear-gradient(to bottom, #020617 0%, #020617 60%, transparent 100%)',
      }}
    >
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-4 ${scrolled ? "py-2" : "py-3"}`}>

        {/* Logo — links to home */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark text-white font-semibold ring-2 ring-emerald-400/60">
            FR
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-50">
            Fresh<span className="text-emerald-400">Route</span>
          </span>
        </Link>

        {/* Public nav links — hidden on mobile */}
        {variant === "public" && (
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/#how-it-works" className="text-slate-200 hover:text-white">How it works</Link>
            {/* ✅ Links to /signup so user picks their role on RoleSelectPage first */}
            <Link to="/signup/customer" className="text-slate-200 hover:text-white">For customers</Link>
            <Link to="/signup/vendor" className="text-slate-200 hover:text-white">For vendors</Link>
          </nav>
        )}

        {/* Sign In / Sign Up — public variant only */}
        <div className="flex items-center gap-3 text-sm">
          {variant === "public" && (
            <>
              <Link to="/signin" className="hidden text-slate-200 hover:text-white md:inline-block">Sign In</Link>
              {/* ✅ Fixed: was /signup/customer — now routes to RoleSelectPage first */}
              <Link to="/signup" className="rounded-full bg-primary px-4 py-1.5 text-white hover:bg-primary-dark">Sign Up</Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;