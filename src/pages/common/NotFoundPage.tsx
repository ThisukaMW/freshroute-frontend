import React, { type JSX } from "react";
import { Link } from "react-router-dom";

const NotFoundPage = (): JSX.Element => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] text-slate-100">
      <p className="text-sm font-semibold text-primary-light">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-center text-sm text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Use the links below to get
        back on track.
      </p>
      <div className="mt-6 flex gap-3 text-sm">
        <Link
          to="/"
          className="rounded-xl bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
        >
          Go to landing
        </Link>
        <Link
          to="/buyer"
          className="rounded-xl border border-slate-600 px-4 py-2 font-medium text-slate-200 hover:bg-slate-900"
        >
          Buyer dashboard (demo)
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;