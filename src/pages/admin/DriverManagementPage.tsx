import { useState } from "react";
import {
  createStaffAccount,
  type StaffRole,
} from "../../api/endpoints/adminStaff";

type FormErrors = Partial<Record<string, string>>;

const inputBase = (hasError: boolean) =>
  `w-full rounded-xl border ${
    hasError ? "border-red-500/60 bg-red-500/5" : "border-white/10 bg-white/5"
  } px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-all duration-200 focus:ring-2 ${
    hasError ? "focus:ring-red-500/20" : "focus:ring-primary/20"
  } hover:border-white/20`;

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
    {children}
  </label>
);

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <Label>{label}</Label>
    {children}
    {error && (
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-5 border-l-2 border-primary/50 pl-3">
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="text-xs text-slate-500">{subtitle}</p>
  </div>
);

const emptyForm = {
  role: "DRIVER" as StaffRole,
  name: "",
  email: "",
  phone: "",
  password: "",
  licenseNumber: "",
};

const DriverManagementPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDriver = form.role === "DRIVER";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
    setSuccessMessage(null);
  };

  const setRole = (role: StaffRole) => {
    setForm((prev) => ({ ...prev, role }));
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";

    if (isDriver && !form.licenseNumber.trim()) {
      e.licenseNumber = "License number is required";
    }

    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await createStaffAccount({
        role: form.role,
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        licenseNumber: isDriver ? form.licenseNumber.trim() : undefined,
      });

      setSuccessMessage(
        `${result.user.name} (${result.user.email}) was added as a ${
          isDriver ? "driver" : "field admin"
        }. Share their password with them directly. A vehicle will be assigned automatically when they're dispatched on a route.`
      );
      setForm({ ...emptyForm, role: form.role });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ?? err?.message ?? "Failed to create the account. Please try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-supply-peach">
          Staff onboarding
        </p>
        <h1 className="mt-0.5 text-xl font-semibold text-white">Driver &amp; field admin management</h1>
        <p className="mt-1 text-sm text-slate-400">
          Drivers and field admins don't self-register — create their account here and share
          the password with them directly. Vehicles are matched to batches separately via fleet
          assignment, not declared here.
        </p>
      </header>

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
          <span className="mt-0.5 shrink-0 text-base">✓</span>
          <p>{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto shrink-0 text-emerald-400 hover:text-emerald-200"
          >
            ✕
          </button>
        </div>
      )}

      {apiError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          <span className="mt-0.5 shrink-0 text-base">✕</span>
          <div>
            <p className="font-semibold text-red-200">Could not create account</p>
            <p className="mt-0.5 text-xs text-red-400">{apiError}</p>
          </div>
          <button
            onClick={() => setApiError(null)}
            className="ml-auto shrink-0 text-red-400 hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Role toggle */}
      <div className="flex gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-1.5 backdrop-blur-sm sm:w-fit">
        {(["DRIVER", "FIELD_ADMIN"] as StaffRole[]).map((role) => (
          <button
            key={role}
            onClick={() => setRole(role)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              form.role === role
                ? "bg-primary text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {role === "DRIVER" ? "Driver" : "Field Admin"}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          {/* Account details */}
          <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm">
            <SectionHeading title="Account details" subtitle="Login credentials for the new account" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <input
                  name="name"
                  placeholder="e.g. Nimal Perera"
                  value={form.name}
                  onChange={handleChange}
                  className={inputBase(!!errors.name)}
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  name="email"
                  type="email"
                  placeholder="e.g. nimal@freshroute.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputBase(!!errors.email)}
                />
              </Field>
              <Field label="Phone (optional)" error={errors.phone}>
                <input
                  name="phone"
                  placeholder="e.g. +94771234567"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputBase(!!errors.phone)}
                />
              </Field>
              <Field label="Temporary password" error={errors.password}>
                <input
                  name="password"
                  type="text"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  className={inputBase(!!errors.password)}
                />
              </Field>
            </div>
          </section>

          {isDriver && (
            <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm">
              <SectionHeading title="Driver credential" subtitle="Their personal driving license" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="License number" error={errors.licenseNumber}>
                  <input
                    name="licenseNumber"
                    placeholder="e.g. DL-2024-001"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    className={inputBase(!!errors.licenseNumber)}
                  />
                </Field>
              </div>
            </section>
          )}
        </div>

        {/* Right column: actions */}
        <div className="space-y-5">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-sm">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Summary
              </p>
              <div className="space-y-3 text-xs">
                {[
                  ["Role", isDriver ? "Driver" : "Field Admin"],
                  ["Name", form.name || "—"],
                  ["Email", form.email || "—"],
                  ...(isDriver ? [["License", form.licenseNumber || "—"]] : []),
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 px-3 py-2"
                  >
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-semibold ${value === "—" ? "text-slate-600" : "text-white"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating…" : `Create ${isDriver ? "driver" : "field admin"} account`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverManagementPage;
