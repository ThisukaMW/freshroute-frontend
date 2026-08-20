import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Truck = {
  id: string;
  operator: string;
  type: string;
  capacityLbs: number;
  loadedLbs: number;
  palletsLoaded: number;
  palletsCap: number;
  cratesLoaded: number;
  boxesLoaded: number;
  temperature: string;
  loadBalance: { left: number; right: number };
  tiltRisk: string;
};

type FormErrors = Partial<Record<string, string>>;

const TRUCK_TYPES = ["Refrigerated van", "Dry cargo", "Reefer"];
const TEMPERATURE_OPTIONS = ["Ambient", "2°C", "4°C", "6°C", "-10°C", "-18°C"];

const PER_PALLET_WEIGHT = 1800;

// ── Validation helpers ────────────────────────────────────────────────────────

/** Auto-formats a raw string into "AA0000" truck-ID format.
 *  - First 2 chars: letters only, auto-uppercased
 *  - Next 4 chars:  digits only
 *  - Hard cap of 6 characters total
 */
const formatTruckId = (raw: string): string => {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
  const letters = cleaned.slice(0, 2).replace(/[^a-zA-Z]/g, "").toUpperCase();
  const remainingLetterSlots = Math.max(0, 2 - letters.length);
  const digits = cleaned
    .slice(letters.length + remainingLetterSlots)
    .replace(/[^0-9]/g, "")
    .slice(0, 4);
  return letters + digits;
};

const isTruckIdValid = (id: string): boolean => /^[A-Z]{2}\d{4}$/.test(id);

// ─────────────────────────────────────────────────────────────────────────────

const inputBase = (hasError: boolean) =>
  `w-full rounded-xl border ${
    hasError ? "border-red-500/60 bg-red-500/5" : "border-white/10 bg-white/5"
  } px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-all duration-200 focus:ring-2 ${
    hasError ? "focus:ring-red-500/20" : "focus:ring-primary/20"
  } hover:border-white/20`;

const selectBase = (hasError: boolean) =>
  `w-full rounded-xl border ${
    hasError
      ? "border-red-500/60 bg-red-900/20"
      : "border-white/10 bg-slate-900"
  } px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 hover:border-white/20 cursor-pointer`;

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

const SectionHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="mb-5 border-l-2 border-primary/50 pl-3">
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="text-xs text-slate-500">{subtitle}</p>
  </div>
);

const AddTruckPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<Truck>({
    id: "",
    operator: "",
    type: TRUCK_TYPES[0],
    capacityLbs: 0,
    loadedLbs: 0,
    palletsLoaded: 0,
    palletsCap: 0,
    cratesLoaded: 0,
    boxesLoaded: 0,
    temperature: TEMPERATURE_OPTIONS[0],
    loadBalance: { left: 50, right: 50 },
    tiltRisk: "Low",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => {
      let next = { ...prev };

      // ── Truck ID ──────────────────────────────────────────────────────────
      if (name === "id") {
        next.id = formatTruckId(value);
        return next;
      }

      // ── Capacity (lbs) ────────────────────────────────────────────────────
      if (name === "capacityLbs") {
        const digitsOnly = value.replace(/[^0-9]/g, "");
        const cap = Math.min(49999, digitsOnly === "" ? 0 : parseInt(digitsOnly, 10));
        const maxPallets = cap > 0 ? Math.floor(cap / PER_PALLET_WEIGHT) : 0;
        next.capacityLbs = cap;
        next.palletsCap = maxPallets;
        next.palletsLoaded = Math.min(prev.palletsLoaded, maxPallets);
        next.loadedLbs = Math.min(prev.loadedLbs, cap);
        return next;
      }

      // ── Pallets Loaded ────────────────────────────────────────────────────
      if (name === "palletsLoaded") {
        const loaded = Math.min(Number(value), next.palletsCap);
        next.palletsLoaded = loaded;
        next.loadedLbs = Math.min(next.capacityLbs, loaded * PER_PALLET_WEIGHT);
        return next;
      }

      // ── Everything else ───────────────────────────────────────────────────
      const numericValue = type === "number" ? Number(value) : value;
      next = { ...next, [name]: numericValue };
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      setShowErrorBanner(false);
    }
    setApiError(null);
  };

  const maxPallets = form.capacityLbs > 0
    ? Math.floor(form.capacityLbs / PER_PALLET_WEIGHT)
    : 0;

  const validate = (): FormErrors => {
    const e: FormErrors = {};

    if (!form.id.trim()) {
      e.id = "Truck ID is required";
    } else if (!isTruckIdValid(form.id)) {
      e.id = "Truck ID must be 2 letters followed by 4 digits (e.g. AB1234)";
    }

    if (!form.operator.trim())  e.operator  = "Operator name is required";

    if (!form.capacityLbs || form.capacityLbs <= 0) {
      e.capacityLbs = "Capacity must be greater than 0";
    } else if (form.capacityLbs >= 50000) {
      e.capacityLbs = "Capacity must be less than 50,000 lbs";
    }

    if (form.loadedLbs < 0)
      e.loadedLbs = "Loaded weight cannot be negative";
    if (form.loadedLbs > form.capacityLbs && form.capacityLbs > 0)
      e.loadedLbs = "Loaded weight exceeds capacity";
    if (form.palletsLoaded > form.palletsCap && form.palletsCap > 0)
      e.palletsLoaded = "Pallets loaded exceeds pallet capacity";

    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowErrorBanner(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setApiError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/trucks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      navigate("/admin/trucks", { replace: true });
    } catch (err: any) {
      setApiError(err.message ?? "Failed to save truck. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const errorCount = Object.keys(errors).filter((k) => errors[k]).length;

  const truckIdLetters = form.id.replace(/[^A-Z]/g, "").length;
  const truckIdDigits  = form.id.replace(/[^0-9]/g, "").length;
  const truckIdComplete = isTruckIdValid(form.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-supply-peach/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl space-y-6 p-6 lg:p-10">

        {/* API error banner */}
        {apiError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            <span className="mt-0.5 shrink-0 text-base">✕</span>
            <div>
              <p className="font-semibold text-red-200">Could not save truck</p>
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

        {/* Validation error banner */}
        {showErrorBanner && errorCount > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            <span className="mt-0.5 shrink-0 text-base">⚠</span>
            <div>
              <p className="font-semibold text-red-200">
                {errorCount} field{errorCount > 1 ? "s" : ""} need
                {errorCount === 1 ? "s" : ""} to be filled in
              </p>
              <p className="mt-0.5 text-xs text-red-400">
                Please complete all required fields before saving.
              </p>
            </div>
            <button
              onClick={() => setShowErrorBanner(false)}
              className="ml-auto shrink-0 text-red-400 hover:text-red-200"
            >
              ✕
            </button>
          </div>
        )}

        <header className="rounded-3xl border border-white/10 bg-slate-950/60 px-6 py-5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-white/30 hover:text-white"
            >
              ←
            </button>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-supply-peach">
                Fleet control
              </p>
              <h1 className="mt-0.5 text-xl font-semibold text-white">
                Register new truck
              </h1>
            </div>
            <div className="hidden text-xs text-slate-500 sm:block">
              All fields are required
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* ── Left column: form ── */}
          <div className="space-y-5">

            {/* Identity & Classification */}
            <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm">
              <SectionHeading
                title="Identity & classification"
                subtitle="Operator and vehicle type"
              />
              <div className="grid gap-4 sm:grid-cols-2">

                {/* Truck ID */}
                <Field label="Number Plate" error={errors.id}>
                  <input
                    name="id"
                    placeholder="e.g. AB1234"
                    value={form.id}
                    onChange={handleChange}
                    maxLength={6}
                    className={inputBase(!!errors.id)}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    {[0, 1].map((i) => (
                      <div
                        key={`l${i}`}
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold transition-all ${
                          i < truckIdLetters
                            ? "bg-primary/20 text-primary border border-primary/40"
                            : "bg-white/5 text-slate-600 border border-white/10"
                        }`}
                      >
                        {form.id[i] ?? "A"}
                      </div>
                    ))}
                    <span className="text-[10px] text-slate-600">—</span>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={`d${i}`}
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold transition-all ${
                          i < truckIdDigits
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-white/5 text-slate-600 border border-white/10"
                        }`}
                      >
                        {form.id[2 + i] ?? "0"}
                      </div>
                    ))}
                    {truckIdComplete && (
                      <span className="ml-1 text-[11px] text-emerald-400">✓</span>
                    )}
                  </div>
                </Field>

                <Field label="Operator / Company" error={errors.operator}>
                  <input
                    name="operator"
                    placeholder="e.g. Greenleaf Logistics"
                    value={form.operator}
                    onChange={handleChange}
                    className={inputBase(!!errors.operator)}
                  />
                </Field>
                <Field label="Truck type" error={errors.type}>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={selectBase(!!errors.type)}
                  >
                    {TRUCK_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Temperature setting" error={errors.temperature}>
                  <select
                    name="temperature"
                    value={form.temperature}
                    onChange={handleChange}
                    className={selectBase(!!errors.temperature)}
                  >
                    {TEMPERATURE_OPTIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            {/* Cargo & Loading */}
            <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm">
              <SectionHeading title="Cargo & loading" subtitle="Weight capacity, loaded weight, and pallet count" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Capacity (lbs)" error={errors.capacityLbs}>
                  <input
                    name="capacityLbs"
                    inputMode="numeric"
                    placeholder="e.g. 40000"
                    value={form.capacityLbs || ""}
                    onChange={handleChange}
                    className={inputBase(!!errors.capacityLbs)}
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Max 49,999 lbs
                  </p>
                </Field>
                <Field label="Loaded weight (lbs)" error={errors.loadedLbs}>
                  <input
                    name="loadedLbs"
                    type="number"
                    min={0}
                    placeholder="e.g. 18000"
                    value={form.loadedLbs || ""}
                    onChange={handleChange}
                    className={inputBase(!!errors.loadedLbs)}
                  />
                </Field>
                <div>
                  <Label>Max pallets (auto)</Label>
                  <div className="relative">
                    <input
                      readOnly
                      value={
                        maxPallets > 0
                          ? `${maxPallets} pallets`
                          : "Enter capacity first"
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400 outline-none cursor-not-allowed"
                    />
                    {maxPallets > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
                        {form.capacityLbs.toLocaleString()} lbs ÷ {PER_PALLET_WEIGHT} lbs
                      </span>
                    )}
                  </div>
                </div>
                <Field label="Pallets loaded" error={errors.palletsLoaded}>
                  <input
                    name="palletsLoaded"
                    type="number"
                    min={0}
                    max={maxPallets}
                    placeholder={maxPallets > 0 ? `0 – ${maxPallets}` : "Enter capacity first"}
                    value={form.palletsLoaded || ""}
                    onChange={handleChange}
                    disabled={maxPallets === 0}
                    className={`${inputBase(!!errors.palletsLoaded)} ${maxPallets === 0 ? "cursor-not-allowed opacity-40" : ""}`}
                  />
                  {maxPallets > 0 && (
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Max {maxPallets} pallets · each ~{PER_PALLET_WEIGHT.toLocaleString()} lbs
                    </p>
                  )}
                </Field>
              </div>
            </section>

          </div>

          {/* ── Right column: summary + actions ── */}
          <div className="space-y-5">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Live summary
                </p>
                <div className="space-y-3 text-xs">
                  {[
                    ["Number Plate",       form.id || "—"],
                    ["Operator",       form.operator || "—"],
                    ["Type",           form.type],
                    ["Temperature",    form.temperature],
                    ["Capacity",       form.capacityLbs ? `${form.capacityLbs.toLocaleString()} lbs` : "—"],
                    ["Loaded weight",  form.loadedLbs   ? `${form.loadedLbs.toLocaleString()} lbs`   : "—"],
                    ["Max pallets",    maxPallets > 0   ? `${maxPallets} pallets`                    : "—"],
                    ["Pallets loaded", form.palletsLoaded ? `${form.palletsLoaded}`                   : "—"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 px-3 py-2"
                    >
                      <span className="text-slate-500">{label}</span>
                      <span
                        className={`font-semibold ${value === "—" ? "text-slate-600" : "text-white"}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {form.capacityLbs > 0 && form.loadedLbs > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[11px] text-slate-500 mb-1.5">Weight utilization</p>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-supply-peach to-supply-orange transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round((form.loadedLbs / form.capacityLbs) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {Math.min(100, Math.round((form.loadedLbs / form.capacityLbs) * 100))}% of weight capacity
                    </p>
                  </div>
                )}

                {form.palletsCap > 0 && form.palletsLoaded > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-500 mb-1.5">Pallet utilization</p>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round((form.palletsLoaded / form.palletsCap) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {Math.min(100, Math.round((form.palletsLoaded / form.palletsCap) * 100))}% of pallet slots occupied
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save truck"}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  disabled={saving}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white active:scale-[0.98] disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTruckPage;