/**
 * AuthLayout.tsx
 * Visual wrapper for auth pages — adds background, header, and a centered card.
 * No logic here, just the visual shell for login/register pages.
 */

import React from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/* accepts only children — the login or register form goes here */
interface AuthLayoutProps {
  children: ReactNode;
}

/* main layout wrapper for all auth pages */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    /* full screen dark gradient background */
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-supply-teal/60 to-supply-teal/30">

      {/* decorative glowing blobs in background — no interaction */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        {/* top-left glow */}
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),_transparent_60%)] blur-3xl" />
        {/* bottom-right glow */}
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.4),_transparent_60%)] blur-3xl" />
      </div>

      {/* top header — logo on left, back to home on right */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        {/* logo — goes to home page */}
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-50">
          <span className="h-8 w-8 rounded-lg bg-primary/20" />
          FreshRoute
        </Link>
        {/* back to home link */}
        <Link to="/" className="text-xs font-medium text-slate-200 underline-offset-4 hover:underline">
          Back to home
        </Link>
      </header>

      {/* centers the card on the page */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        {/* frosted glass card — holds the form content */}
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:p-10">
          {children}
        </div>
      </main>

    </div>
  );
};