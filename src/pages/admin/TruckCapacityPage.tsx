import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import TruckSideViewImage from "../../assets/images/Truck_SideView.png";
import TruckTopViewImage from "../../assets/images/Truck_TopView.png";

type Truck = {
  id: string;
  operator: string;
  departure: string;
  arrival: string;
  route: string;
  type: string;
  capacityLbs: number;
  loadedLbs: number;
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

type TruckMetrics = Truck & {
  freeSpacePercent: number;
  fillPercent: number;
};

const gridColors = [
  "bg-primary/80",
  "bg-supply-peach/70",
  "bg-supply-orange/70",
  "bg-supply-teal/70",
];
const PER_PALLET_WEIGHT = 1800;

// ---------------------------------------------------------------------------
// Helpers for localStorage
// ---------------------------------------------------------------------------
function readFleet(): Truck[] {
  try {
    const raw = localStorage.getItem("fleet");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFleet(fleet: Truck[]) {
  try {
    localStorage.setItem("fleet", JSON.stringify(fleet));
  } catch {
    // ignore storage errors
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const TruckCapacityPage = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"side" | "top">("side");

  // userFleet is the sole source-of-truth — no hardcoded data.
  const [userFleet, setUserFleet] = useState<Truck[]>([]);

  // -------------------------------------------------------------------------
  // Boot: load persisted fleet + selected id
  // -------------------------------------------------------------------------
  useEffect(() => {
    const stored = readFleet();
    setUserFleet(stored);

    try {
      const savedSelected = localStorage.getItem("fleet_selected");
      if (savedSelected && stored.some((t) => t.id === savedSelected)) {
        setSelectedId(savedSelected);
      } else if (stored[0]?.id) {
        setSelectedId(stored[0].id);
      }
    } catch {
      if (stored[0]?.id) setSelectedId(stored[0].id);
    }

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "fleet") {
        const updated = readFleet();
        setUserFleet(updated);
      }
    };

    const onFocus = () => {
      const updated = readFleet();
      setUserFleet(updated);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Persist selected id
  useEffect(() => {
    try {
      if (selectedId) localStorage.setItem("fleet_selected", selectedId);
    } catch {
      // ignore
    }
  }, [selectedId]);

  // -------------------------------------------------------------------------
  // Fleet with derived metrics
  // -------------------------------------------------------------------------
  const fleet: TruckMetrics[] = useMemo(() => {
    return userFleet.map((truck) => {
      const loadedLbs = Math.min(
        truck.capacityLbs,
        truck.palletsLoaded * PER_PALLET_WEIGHT
      );
      const fillPercent = truck.capacityLbs
        ? Math.round((loadedLbs / truck.capacityLbs) * 100)
        : 0;
      const freeSpacePercent = Math.max(0, 100 - fillPercent);
      return { ...truck, loadedLbs, freeSpacePercent, fillPercent };
    });
  }, [userFleet]);

  const selectedTruck: TruckMetrics | null =
    fleet.find((t) => t.id === selectedId) ?? fleet[0] ?? null;

  // -------------------------------------------------------------------------
  // Pallet adjustment — mutates palletsLoaded directly in localStorage
  // -------------------------------------------------------------------------
  const handleAdjustPallets = useCallback(
    (delta: number) => {
      if (!selectedTruck) return;
      setUserFleet((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== selectedTruck.id) return t;
          const nextPallets = Math.min(
            t.palletsCap,
            Math.max(0, t.palletsLoaded + delta)
          );
          return { ...t, palletsLoaded: nextPallets };
        });
        writeFleet(updated);
        return updated;
      });
    },
    [selectedTruck]
  );

  // -------------------------------------------------------------------------
  // Delete truck from manifest
  // -------------------------------------------------------------------------
  const handleDeleteTruck = useCallback(
    (id: string) => {
      if (!confirm("Delete this truck from the manifest? This cannot be undone."))
        return;
      setUserFleet((prev) => {
        const remaining = prev.filter((t) => t.id !== id);
        writeFleet(remaining);
        return remaining;
      });
      if (selectedId === id) {
        const fallback = userFleet.find((t) => t.id !== id);
        setSelectedId(fallback?.id ?? null);
      }
    },
    [selectedId, userFleet]
  );

  // -------------------------------------------------------------------------
  // Derived UI data
  // -------------------------------------------------------------------------
  const summary = useMemo(() => {
    if (!selectedTruck) return [];
    return [
      {
        label: "Total pallets loaded",
        value: `${selectedTruck.palletsLoaded}/${selectedTruck.palletsCap}`,
        helper: "Automate pallet limits",
      },
      {
        label: "Free space remaining",
        value: `${selectedTruck.freeSpacePercent}%`,
        helper: "Add more crates before departure",
      },
      {
        label: "Delivery efficiency",
        value: `${selectedTruck.efficiency}%`,
        helper: `Avg. delay ${selectedTruck.avgDelay}`,
      },
      {
        label: "Load balance",
        value: `${selectedTruck.loadBalance.left}% · ${selectedTruck.loadBalance.right}%`,
        helper: `Tilt risk ${selectedTruck.tiltRisk}`,
      },
    ];
  }, [selectedTruck]);

  const gridCells = useMemo(() => {
    if (!selectedTruck) return [];
    const totalCells = 30;
    const filled = Math.min(selectedTruck.palletsLoaded, totalCells);
    return Array.from({ length: totalCells }, (_, index) => ({
      id: `${selectedTruck.id}-${index}`,
      filled: index < filled,
      color: gridColors[index % gridColors.length],
    }));
  }, [selectedTruck]);

  // -------------------------------------------------------------------------
  // Empty state (no trucks added yet)
  // -------------------------------------------------------------------------
  if (fleet.length === 0) {
    return (
      <div className="space-y-8 text-slate-100">
        <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">
                Fleet control
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Truck capacity planner
              </h1>
              <p className="text-sm text-slate-400">
                Add trucks to start managing cargo loading, reefer status, and
                efficiency recommendations.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/trucks/add")}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark self-start lg:self-auto"
            >
              + Add truck
            </button>
          </div>
        </header>
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 px-6 py-16 text-center text-slate-400">
          <p className="mb-4 text-lg font-medium text-white">
            No trucks in manifest
          </p>
          <p className="mb-6 text-sm">
            Get started by adding your first truck to begin tracking capacity.
          </p>
          <button
            onClick={() => navigate("/admin/trucks/add")}
            className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            + Add truck
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-8 text-slate-100">
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">
              Fleet control
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Truck capacity planner
            </h1>
            <p className="text-sm text-slate-400">
              Switch across trucks to demonstrate live cargo loading, reefer
              status, and efficiency recommendations.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/trucks/add")}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark self-start lg:self-auto"
          >
            + Add truck
          </button>
        </div>
      </header>

      {selectedTruck && (
        <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          {/* -------------------------------------------------------------- */}
          {/* Left panel                                                       */}
          {/* -------------------------------------------------------------- */}
          <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Selected truck
                </p>
                <h2 className="text-xl font-semibold text-white">
                  {selectedTruck.operator}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedTruck.departure} departure · arrival{" "}
                  {selectedTruck.arrival} · {selectedTruck.type}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-slate-400">Weight</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedTruck.loadedLbs.toLocaleString()} /{" "}
                    {selectedTruck.capacityLbs.toLocaleString()} lbs
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-slate-400">Fuel needed</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedTruck.fuelNeeded}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-slate-400">Temperature</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedTruck.temperature}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2 text-xs">
                    {[
                      { id: "side", label: "Side view" },
                      { id: "top", label: "Top view" },
                    ].map((view) => (
                      <button
                        key={view.id}
                        onClick={() =>
                          setViewMode(view.id as "side" | "top")
                        }
                        className={`rounded-xl border px-3 py-1.5 font-medium ${
                          viewMode === view.id
                            ? "border-primary/50 bg-primary/10 text-white"
                            : "border-white/10 bg-white/5 text-slate-400 hover:border-white/30"
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative mx-auto h-60 w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-4">
                    <AnimatePresence mode="wait">
                      {viewMode === "side" && (
                        <motion.div
                          key="side-view"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.35 }}
                          className="flex h-full items-center gap-4"
                        >
                          <div className="flex h-32 w-40 items-center justify-center rounded-2xl bg-transparent">
                            <img
                              src={TruckSideViewImage}
                              alt="Truck side profile"
                              className="h-full w-full object-contain drop-shadow-[0_20px_45px_rgba(15,23,42,0.85)]"
                            />
                          </div>
                          <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/30 p-4">
                            <div className="grid grid-cols-6 gap-2">
                              {gridCells.map((cell) => (
                                <motion.div
                                  key={cell.id}
                                  layout
                                  animate={{
                                    opacity: cell.filled ? 1 : 0.25,
                                    scale: cell.filled ? 1 : 0.95,
                                  }}
                                  className={`h-6 rounded-sm border border-white/5 ${
                                    cell.filled ? cell.color : "bg-white/5"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="mt-3 text-[11px] text-slate-400">
                              Side profile highlights pallet height vs reefer
                              coils.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {viewMode === "top" && (
                        <motion.div
                          key="top-view"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.35 }}
                          className="flex h-full flex-col"
                        >
                          <div className="flex flex-1 gap-3">
                            <div className="flex w-1/3 items-center justify-center rounded-2xl border border-white/10 bg-transparent p-4">
                              <img
                                src={TruckTopViewImage}
                                alt="Truck top profile"
                                className="h-full w-full object-contain drop-shadow-[0_20px_45px_rgba(15,23,42,0.85)]"
                              />
                            </div>
                            <div className="w-2/3 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                              <div className="grid grid-cols-5 gap-1">
                                {gridCells.map((cell) => (
                                  <motion.div
                                    key={`${cell.id}-top`}
                                    layout
                                    animate={{
                                      opacity: cell.filled ? 1 : 0.2,
                                      scale: cell.filled ? 1 : 0.9,
                                    }}
                                    className={`h-5 rounded-sm border border-white/5 ${
                                      cell.filled ? cell.color : "bg-white/5"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="mt-3 text-[11px] text-slate-400">
                            Top view is perfect for explaining aisle planning
                            and unfilled slots.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="w-full space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-200 lg:w-64">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-slate-500">
                        Pallets
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {selectedTruck.palletsLoaded}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Cap {selectedTruck.palletsCap}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-slate-500">
                        Crates
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {selectedTruck.cratesLoaded}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Boxes {selectedTruck.boxesLoaded}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-500">
                      Reefer utilization
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{
                            width: `${100 - selectedTruck.freeSpacePercent}%`,
                          }}
                        />
                      </div>
                      <span>{selectedTruck.temperature}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                    <p className="text-[11px] uppercase tracking-widest text-slate-500">
                      Assistant
                    </p>
                    <p className="text-sm text-white">
                      Driver rest reduces risk and increases focus. Recommend
                      15h cumulative rest on this route.
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-500">
                      Weight utilization
                    </p>
                    <div className="mt-1 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-supply-peach to-supply-orange"
                        style={{ width: `${selectedTruck.fillPercent}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                      <span>{selectedTruck.fillPercent}% filled</span>
                      <span>
                        {selectedTruck.capacityLbs - selectedTruck.loadedLbs}{" "}
                        lbs free
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => handleAdjustPallets(1)}
                      className="rounded-full bg-primary px-4 py-1 font-semibold text-white hover:bg-primary-dark"
                    >
                      + Add pallet
                    </button>
                    <button
                      onClick={() => handleAdjustPallets(-1)}
                      className="rounded-full border border-white/30 px-4 py-1 font-semibold text-slate-200 hover:border-white/60"
                    >
                      Remove pallet
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summary.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500">{stat.helper}</p>
                </div>
              ))}
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Right panel — manifest & alerts                                  */}
          {/* -------------------------------------------------------------- */}
          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <h3 className="text-base font-semibold text-white">
              Manifest & alerts
            </h3>
            <div className="space-y-3 text-sm">
              {fleet.map((truck) => (
                <div
                  key={`manifest-${truck.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setSelectedId(truck.id);
                  }}
                  onClick={() => setSelectedId(truck.id)}
                  className={`cursor-pointer rounded-2xl border px-4 py-3 ${
                    truck.id === selectedTruck.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {truck.operator}
                      </p>
                      <p className="text-xs text-slate-400">{truck.route}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-slate-400">{truck.type}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTruck(truck.id);
                        }}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                        title="Delete truck"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{truck.palletsLoaded} pallets</span>
                    <span>{truck.freeSpacePercent}% free space</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-xs text-slate-300">
              <p className="text-[11px] uppercase tracking-widest text-slate-500">
                Loading guidance
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Keep heavy pallets near the center axle.</li>
                <li>
                  Use yellow crates for mid-cargo segments and blue for cold
                  chain.
                </li>
                <li>
                  Switch to top view to demonstrate how to manage unfilled
                  slots.
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TruckCapacityPage;
