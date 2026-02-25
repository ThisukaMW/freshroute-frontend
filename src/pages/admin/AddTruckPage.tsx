import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Truck = {
  id: string;
  operator: string;
  departure: string;
  arrival: string;
  route: string;
  type: string;
  capacityLbs: number;
  palletsLoaded: number;
  palletsCap: number;
  cratesLoaded: number;
  boxesLoaded: number;
  temperature: string;
  fuelNeeded: string;
  efficiency: number;
  avgDelay: string;
  loadBalance: { left: number; right: number };
  tiltRisk: string;
};

type FormErrors = Partial<Record<string, string>>;

const TRUCK_TYPES = ["Refrigerated van", "Dry cargo", "Reefer"];
const TEMPERATURE_OPTIONS = ["Ambient", "2°C", "4°C", "6°C", "-10°C", "-18°C"];

const inputBase = (hasError: boolean) =>
  `w-full rounded-xl border ${
    hasError ? "border-red-500/60 bg-red-500/5" : "border-white/10 bg-white/5"
  } px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-all duration-200 focus:ring-2 ${
    hasError ? "focus:ring-red-500/20" : "focus:ring-primary/20"
  } hover:border-white/20`;

const selectBase = (hasError: boolean) =>
  `w-full rounded-xl border ${
    hasError ? "border-red-500/60 bg-red-900/20" : "border-white/10 bg-slate-900"
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

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
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
    departure: "",
    arrival: "",
    route: "",
    type: TRUCK_TYPES[0],
    capacityLbs: 0,
    palletsLoaded: 0,
    palletsCap: 0,
    cratesLoaded: 0,
    boxesLoaded: 0,
    temperature: TEMPERATURE_OPTIONS[0],
    fuelNeeded: "",
    efficiency: 0,
    avgDelay: "",
    loadBalance: { left: 50, right: 50 },
    tiltRisk: "Low",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      setShowErrorBanner(false);
    }
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.id.trim())              e.id          = "Truck ID is required";
    if (!form.id.trim())              e.id          = "Truck ID is required";
    if (!form.operator.trim())        e.operator    = "Operator name is required";
    if (!form.route.trim())           e.route       = "Route is required";
    if (!form.fuelNeeded.trim())      e.fuelNeeded  = "Fuel needed is required";
    if (!form.capacityLbs || form.capacityLbs <= 0)
                                      e.capacityLbs = "Capacity must be greater than 0";
    if (!form.palletsCap || form.palletsCap <= 0)
                                      e.palletsCap  = "Pallet capacity must be greater than 0";
    if (!form.efficiency || form.efficiency <= 0)
                                      e.efficiency  = "Efficiency is required";
    if (!form.avgDelay.trim())        e.avgDelay    = "Avg. delay is required";
    return e;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowErrorBanner(true);
      // Scroll to top to show banner
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const existing = JSON.parse(localStorage.getItem("fleet") || "[]");
    localStorage.setItem("fleet", JSON.stringify([...existing, form]));
    navigate("/admin/trucks", { replace: true });
  };

  const errorCount = Object.keys(errors).filter((k) => errors[k]).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-supply-peach/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl space-y-6 p-6 lg:p-10">

        {/* Error banner */}
        {showErrorBanner && errorCount > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            <span className="mt-0.5 shrink-0 text-base">⚠</span>
            <div>
              <p className="font-semibold text-red-200">
                {errorCount} field{errorCount > 1 ? "s" : ""} need{errorCount === 1 ? "s" : ""} to be filled in
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

        {/* Header */}
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
              <h1 className="mt-0.5 text-xl font-semibold text-white">Register new truck</h1>
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
              <SectionHeading title="Identity & classification" subtitle="Operator and vehicle type" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Truck ID" error={errors.id}>
                  <input
                    name="id"
                    placeholder="e.g. NP1234567"
                    value={form.id}
                    onChange={handleChange}
                    className={inputBase(!!errors.id)}
                  />
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
                  <select name="type" value={form.type} onChange={handleChange} className={selectBase(!!errors.type)}>
                    {TRUCK_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Temperature setting" error={errors.temperature}>
                  <select name="temperature" value={form.temperature} onChange={handleChange} className={selectBase(!!errors.temperature)}>
                    {TEMPERATURE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
            </section>

            {/* Schedule & Route */}
            <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm">
              <SectionHeading title="Schedule & route" subtitle="Origin–destination and fuel" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Route" error={errors.route}>
                  <input
                    name="route"
                    placeholder="e.g. Colombo ➝ Kandy"
                    value={form.route}
                    onChange={handleChange}
                    className={inputBase(!!errors.route)}
                  />
                </Field>
                <Field label="Fuel needed" error={errors.fuelNeeded}>
                  <input
                    name="fuelNeeded"
                    placeholder="e.g. 43.3 gal"
                    value={form.fuelNeeded}
                    onChange={handleChange}
                    className={inputBase(!!errors.fuelNeeded)}
                  />
                </Field>
              </div>
            </section>

            {/* Cargo */}
            <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm">
              <SectionHeading title="Cargo & loading" subtitle="Weight capacity and pallet count" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Capacity (lbs)" error={errors.capacityLbs}>
                  <input
                    name="capacityLbs"
                    type="number"
                    min={0}
                    placeholder="50000"
                    value={form.capacityLbs || ""}
                    onChange={handleChange}
                    className={inputBase(!!errors.capacityLbs)}
                  />
                </Field>
                <Field label="Pallet capacity" error={errors.palletsCap}>
                  <input
                    name="palletsCap"
                    type="number"
                    min={1}
                    placeholder="30"
                    value={form.palletsCap || ""}
                    onChange={handleChange}
                    className={inputBase(!!errors.palletsCap)}
                  />
                </Field>
              </div>
            </section>

            {/* Performance */}
            <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 backdrop-blur-sm">
              <SectionHeading title="Performance metrics" subtitle="Efficiency targets and delay estimates" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Delivery efficiency %" error={errors.efficiency}>
                  <input
                    name="efficiency"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="90"
                    value={form.efficiency || ""}
                    onChange={handleChange}
                    className={inputBase(!!errors.efficiency)}
                  />
                </Field>
                <Field label="Avg. delay" error={errors.avgDelay}>
                  <input
                    name="avgDelay"
                    placeholder="+0.0h"
                    value={form.avgDelay}
                    onChange={handleChange}
                    className={inputBase(!!errors.avgDelay)}
                  />
                </Field>
              </div>
            </section>
          </div>

          {/* ── Right column: summary + actions ── */}
          <div className="space-y-5">
            <div className="sticky top-6 space-y-4">

              {/* Live summary */}
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Live summary
                </p>
                <div className="space-y-3 text-xs">
                  {[
                    ["Truck ID", form.id || "—"],
                    ["Operator", form.operator || "—"],
                    ["Type", form.type],
                    ["Route", form.route || "—"],
                    ["Temperature", form.temperature],
                    ["Capacity", form.capacityLbs ? `${form.capacityLbs.toLocaleString()} lbs` : "—"],
                    ["Pallets cap.", form.palletsCap ? `${form.palletsCap}` : "—"],
                    ["Efficiency", form.efficiency ? `${form.efficiency}%` : "—"],
                    ["Avg. delay", form.avgDelay || "—"],
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

                {/* Completion indicator */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  {(() => {
                    const total = 8;
                    const filled = [
                      form.id,
                      form.operator,
                      form.route,
                      form.fuelNeeded,
                      form.capacityLbs > 0,
                      form.palletsCap > 0,
                      form.efficiency > 0,
                      form.avgDelay,
                    ].filter(Boolean).length;
                    const pct = Math.round((filled / total) * 100);
                    return (
                      <>
                        {/* <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                          <span>Form completion</span>
                          <span className={pct === 100 ? "text-emerald-400" : "text-slate-400"}>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct === 100
                                ? "bg-emerald-400"
                                : "bg-gradient-to-r from-primary via-supply-peach to-supply-orange"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div> */}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleSubmit}
                  className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-[0.98]"
                >
                  Save truck
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-600">
                Data saved to local fleet manifest
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTruckPage;
