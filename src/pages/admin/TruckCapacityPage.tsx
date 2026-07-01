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
};

type TruckMetrics = Truck & {
  freeSpacePercent: number;
  fillPercent: number;
  palletFillPercent: number;
};

const gridColors = [
  "bg-primary/80",
  "bg-supply-peach/70",
  "bg-supply-orange/70",
  "bg-supply-teal/70",
];

async function fetchFleet(): Promise<Truck[]> {
  const res = await fetch("/api/v1/trucks");
  if (!res.ok) throw new Error(`Failed to fetch fleet (${res.status})`);
  return res.json();
}

// ── Delete confirmation modal ───────────────────────────────────────────────
const DeleteTruckModal = ({
  truck,
  onConfirm,
  onCancel,
}: {
  truck: { id: string; operator: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <AnimatePresence>
    {truck && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-lg">
            ⚠
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">
            Remove truck from manifest?
          </h3>
          <p className="mt-1.5 text-sm text-slate-400">
            <span className="font-medium text-slate-200">{truck.operator}</span>{" "}
            ({truck.id}) will be permanently removed. This cannot be undone.
          </p>
          <div className="mt-6 flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Delete truck
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message }: { message: string | null }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-300 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
      >
        ✓ {message}
      </motion.div>
    )}
  </AnimatePresence>
);

const TruckCapacityPage = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"side" | "top">("side");
  const [userFleet, setUserFleet] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; operator: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // ── Load fleet from API ──────────────────────────────────────────────────────
  const loadFleet = useCallback(async () => {
    try {
      setFetchError(null);
      const trucks = await fetchFleet();
      setUserFleet(trucks);
      setSelectedId((prev) => {
        if (prev && trucks.some((t) => t.id === prev)) return prev;
        return trucks[0]?.id ?? null;
      });
    } catch (err: any) {
      setFetchError(err.message ?? "Could not load fleet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const fleet: TruckMetrics[] = useMemo(() => {
    return userFleet.map((truck) => {
      const loadedLbs = Math.min(truck.capacityLbs, truck.loadedLbs ?? 0);
      const fillPercent = truck.capacityLbs
        ? Math.round((loadedLbs / truck.capacityLbs) * 100)
        : 0;
      const palletFillPercent =
        truck.palletsCap > 0
          ? Math.round((truck.palletsLoaded / truck.palletsCap) * 100)
          : 0;
      const freeSpacePercent =
        truck.palletsCap > 0
          ? Math.max(
              0,
              Math.round(
                ((truck.palletsCap - truck.palletsLoaded) / truck.palletsCap) * 100
              )
            )
          : 0;
      return { ...truck, loadedLbs, freeSpacePercent, fillPercent, palletFillPercent };
    });
  }, [userFleet]);

  const selectedTruck: TruckMetrics | null =
    fleet.find((t) => t.id === selectedId) ?? fleet[0] ?? null;

  // ── Pallet adjustment — calls PATCH /api/v1/trucks/:id/pallets ──────────────
  const handleAdjustPallets = useCallback(
    async (delta: number) => {
      if (!selectedTruck) return;
      try {
        const res = await fetch(`/api/v1/trucks/${selectedTruck.id}/pallets`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delta }),
        });
        if (!res.ok) throw new Error(`Pallet update failed (${res.status})`);
        const updated: Truck = await res.json();
        setUserFleet((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } catch (err: any) {
        console.error(err.message);
      }
    },
    [selectedTruck]
  );

  // ── Delete truck — calls DELETE /api/v1/trucks/:id ──────────────────────────
  const requestDeleteTruck = useCallback((truck: { id: string; operator: string }) => {
    setPendingDelete(truck);
  }, []);

  const confirmDeleteTruck = useCallback(async () => {
    if (!pendingDelete) return;
    const { id, operator } = pendingDelete;
    setPendingDelete(null);
    try {
      const res = await fetch(`/api/v1/trucks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setUserFleet((prev) => {
        const remaining = prev.filter((t) => t.id !== id);
        if (selectedId === id) {
          setSelectedId(remaining[0]?.id ?? null);
        }
        return remaining;
      });
      setToast(`${operator} was removed from the manifest`);
    } catch (err: any) {
      console.error(err.message);
      setToast("Failed to delete truck. Please try again.");
    }
  }, [pendingDelete, selectedId]);

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
        helper: `${selectedTruck.palletsCap - selectedTruck.palletsLoaded} pallet slots open`,
      },
    ];
  }, [selectedTruck]);

  const gridCells = useMemo(() => {
    if (!selectedTruck) return [];
    const totalCells = selectedTruck.palletsCap;
    const filled = Math.min(selectedTruck.palletsLoaded, totalCells);
    return Array.from({ length: totalCells }, (_, index) => ({
      id: `${selectedTruck.id}-${index}`,
      filled: index < filled,
      color: gridColors[index % gridColors.length],
    }));
  }, [selectedTruck]);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400 text-sm">
        Loading fleet…
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-10 text-center text-red-300">
        <p className="text-sm font-medium text-red-200">Failed to load fleet</p>
        <p className="mt-1 text-xs">{fetchError}</p>
        <button
          onClick={loadFleet}
          className="mt-4 rounded-xl bg-red-500/20 px-4 py-2 text-xs font-semibold hover:bg-red-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
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
          <p className="mb-4 text-lg font-medium text-white">No trucks in manifest</p>
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

  return (
    <div className="space-y-8 text-slate-100">
      <DeleteTruckModal
        truck={pendingDelete}
        onConfirm={confirmDeleteTruck}
        onCancel={() => setPendingDelete(null)}
      />
      <Toast message={toast} />

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
                    {Number(selectedTruck.loadedLbs ?? 0).toLocaleString()} /{" "}
                    {Number(selectedTruck.capacityLbs ?? 0).toLocaleString()} lbs
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
                        onClick={() => setViewMode(view.id as "side" | "top")}
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

                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-500">
                      Reefer utilization
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{ width: `${selectedTruck.palletFillPercent}%` }}
                        />
                      </div>
                      <span>{selectedTruck.temperature}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {selectedTruck.palletFillPercent}% of pallet slots in use
                    </p>
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
                      <span>{selectedTruck ? `${selectedTruck.fillPercent}% of weight capacity` : "—"}</span>
                      <span>
                        {selectedTruck
                          ? `${Math.max(
                              0,
                              selectedTruck.capacityLbs - selectedTruck.loadedLbs
                            ).toLocaleString()} lbs free`
                          : "—"}
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

            <div className="grid gap-4 sm:grid-cols-2">
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
                          requestDeleteTruck({ id: truck.id, operator: truck.operator });
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
                    <span>{truck.freeSpacePercent}% slots free</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TruckCapacityPage;