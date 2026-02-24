import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { JSX } from 'react';

type NavbarProps = {
  variant?: "public" | "customer" | "vendor" | "admin";
};

const Navbar = ({ variant = "public" }: NavbarProps): JSX.Element => {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`${
        scrolled
          ? 'sticky top-0 z-50 bg-brand-background/40 shadow-sm shadow-black/40 backdrop-blur-xl transition-all duration-300 p-2'
          : ' bg-gradient-to-r from-brand-background/90 via-brand-muted to-supply-teal/60  backdrop-blur-xl transition-all duration-300' 
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-4 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark text-white font-semibold ring-2 ring-emerald-400/60">
            FR
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-50">
            Fresh<span className="text-emerald-400">Route</span>
          </span>
        </Link>

        {variant === "public" && (
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/#how-it-works" className="text-slate-200 hover:text-white">
              How it works
            </Link>
            <Link to="/signup/customer" className="text-slate-200 hover:text-white">
              For customers
            </Link>
            <a href="#for-vendors" className="text-slate-200 hover:text-white">
              For vendors
            </a>
          </nav>
        )}

        <div className="flex items-center gap-3 text-sm">
          {variant === "public" && (
            <>
              <Link to="/signin" className="hidden text-slate-200 hover:text-white md:inline-block">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-primary px-4 py-1.5 text-white hover:bg-primary-dark"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;



