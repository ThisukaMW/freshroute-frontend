import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-background text-slate-100">
      <h1 className="text-2xl font-semibold">You don&apos;t have access to this area</h1>
      <p className="mt-2 max-w-md text-center text-sm text-slate-400">
        This section is restricted based on role. Try switching to a different role or logging in
        with another account.
      </p>
      <div className="mt-6 flex gap-3 text-sm">
        <Link
          to="/"
          className="rounded-xl bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
        >
          Go to landing
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;