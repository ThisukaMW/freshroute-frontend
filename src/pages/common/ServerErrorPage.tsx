import React from "react";
import { Link } from "react-router-dom";

const ServerErrorPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-background text-slate-100">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-center text-sm text-slate-400">
        We hit an unexpected error while loading this section. This is usually temporary in the
        prototype – please try again in a moment.
      </p>
      <div className="mt-6 flex gap-3 text-sm">
        <Link
          to="/"
          className="rounded-xl bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
        >
          Back home
        </Link>
      </div>
    </div>
  );
};

export default ServerErrorPage;