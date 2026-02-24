import React from "react";
import { Link } from "react-router-dom";

const ForgotPasswordPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1.4fr,1fr]">
      <div>
        <h1 className="text-xl font-semibold text-slate-50 md:text-2xl">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          In this prototype, we don&apos;t actually send emails – but this screen lets you explain
          how a real reset flow would work.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-200">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Send reset link (demo)
          </button>
        </form>
      </div>
      <div className="hidden flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200 backdrop-blur-xl md:flex">
        <div>
          <p className="font-semibold text-slate-50">How to present this screen</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-300">
            <li>Explain email-based password reset with OTP or token.</li>
            <li>Mention rate limiting and security considerations briefly.</li>
            <li>Note that this prototype only shows the UI, not real email sending.</li>
          </ul>
        </div>
        <p className="mt-4 text-slate-400">
          You can also describe how different roles (buyer, seller, admin) would share the same
          account recovery flow.
        </p>
        <Link
          to="/"
          className="mt-3 text-xs font-medium text-emerald-300 underline underline-offset-4"
        >
          Back to landing
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;