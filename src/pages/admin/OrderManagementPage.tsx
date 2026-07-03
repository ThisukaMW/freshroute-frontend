import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  listBatches,
  getBatchById,
  listFleetOptions,
  assignRouteFleet,
  getBatchRoutingHandoff,
  type BatchDetail,
  type BatchListItem,
  type BatchOrder,
  type BatchStatus,
  type FleetOptions,
} from "../../api/endpoints/adminBatches";
import AdminDateRangeBar, { defaultSinceDate, todayDateInput } from "../../components/admin/AdminDateRangeBar";
import { formatDisplayDate } from "../../utils/adminDateFilters";

const BATCH_STATUS: Record<
  BatchStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  OPEN: { label: "Open", dot: "#60a5fa", text: "#1e3a5f", bg: "#dbeafe" },
  CLOSED: { label: "Closed", dot: "#94a3b8", text: "#334155", bg: "#f1f5f9" },
  ROUTED: { label: "Routed", dot: "#818cf8", text: "#312e81", bg: "#e0e7ff" },
  IN_PROGRESS: { label: "In Progress", dot: "#f97316", text: "#7c2d12", bg: "#ffedd5" },
  COMPLETED: { label: "Completed", dot: "#22c55e", text: "#14532d", bg: "#dcfce7" },
  CANCELLED: { label: "Cancelled", dot: "#6b7280", text: "#1f2937", bg: "#f3f4f6" },
};

const ORDER_STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  BATCHED: { text: "#1e3a5f", bg: "#dbeafe" },
  ASSIGNED: { text: "#312e81", bg: "#e0e7ff" },
  IN_TRANSIT: { text: "#7c2d12", bg: "#ffedd5" },
  DELIVERED: { text: "#14532d", bg: "#dcfce7" },
  PAID: { text: "#065f46", bg: "#d1fae5" },
  CANCELLED: { text: "#1f2937", bg: "#f3f4f6" },
};

const formatAmount = (amount: number) =>
  `Rs. ${new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" });

const StatusBadge: React.FC<{
  label: string;
  colors: { text: string; bg: string };
}> = ({ label, colors }) => (
  <span
    className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full"
    style={{ background: colors.bg, color: colors.text }}
  >
    {label}
  </span>
);

const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const OrderDetailModal: React.FC<{
  order: BatchOrder;
  batch: BatchDetail;
  onClose: () => void;
}> = ({ order, batch, onClose }) => {
  const route = batch.routes[0];
  const orderStops =
    route?.stops.filter(
      (stop) => stop.order?.id === order.id || stop.type === "PICKUP"
    ) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Order detail</p>
            <h2 className="text-lg font-semibold text-slate-100">#{order.orderNumber}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-1">Buyer</p>
              <p className="text-slate-200">{order.buyer.user.name}</p>
              <p className="text-xs text-slate-500">{order.buyer.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Total</p>
              <p className="text-slate-200 font-semibold">{formatAmount(order.totalAmount)}</p>
              <StatusBadge
                label={order.status.replace(/_/g, " ")}
                colors={ORDER_STATUS_COLORS[order.status] ?? { text: "#334155", bg: "#f1f5f9" }}
              />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500 mb-1">Delivery address</p>
              <p className="text-slate-300">{order.deliveryAddress}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-200 mb-2">Products</p>
            <div className="rounded-xl border border-slate-700/50 overflow-hidden">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Seller</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {order.items.map((item) => (
                    <tr key={item.id} className="text-slate-300">
                      <td className="px-3 py-2">
                        {item.product.name}
                        <span className="text-slate-500"> / {item.product.unit}</span>
                      </td>
                      <td className="px-3 py-2">{item.seller.user.name}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2">
                        {item.inspections[0]?.result ?? "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {order.refunds.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-200 mb-2">Refunds</p>
              <div className="space-y-2">
                {order.refunds.map((refund) => (
                  <div
                    key={refund.id}
                    className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs"
                  >
                    <span className="text-amber-200">{refund.status}</span>
                    <span className="text-amber-100 font-medium">{formatAmount(refund.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {route && (
            <div>
              <p className="text-sm font-medium text-slate-200 mb-2">Route stops</p>
              <div className="space-y-2">
                {orderStops.map((stop) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-xs"
                  >
                    <span className="text-slate-500 w-6">#{stop.sequenceOrder}</span>
                    <span className="text-slate-400 w-20">{stop.type}</span>
                    <span className="text-slate-300 flex-1 truncate">{stop.address}</span>
                    <StatusBadge
                      label={stop.status}
                      colors={
                        stop.status === "COMPLETED"
                          ? { text: "#14532d", bg: "#dcfce7" }
                          : { text: "#78350f", bg: "#fef3c7" }
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderManagementPage: React.FC = () => {
  const [batches, setBatches] = useState<BatchListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BatchStatus | "ALL">("ALL");
  const [since, setSince] = useState(defaultSinceDate);
  const [until, setUntil] = useState(todayDateInput);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, BatchDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [modalOrder, setModalOrder] = useState<{ order: BatchOrder; batch: BatchDetail } | null>(null);
  const [fleetOptions, setFleetOptions] = useState<FleetOptions | null>(null);
  const [fleetAssign, setFleetAssign] = useState<Record<string, { truckId: string; fieldAdminId: string }>>({});
  const [fleetSaving, setFleetSaving] = useState<string | null>(null);
  const [routingHandoff, setRoutingHandoff] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    listFleetOptions()
      .then(setFleetOptions)
      .catch(() => setFleetOptions(null));
  }, []);

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listBatches({
        limit: 50,
        since,
        until,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setBatches(response.batches);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load batches");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, since, until]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const loadBatchDetail = async (batchId: string) => {
    if (detailCache[batchId]) return detailCache[batchId];
    setDetailLoading(batchId);
    try {
      const detail = await getBatchById(batchId);
      setDetailCache((prev) => ({ ...prev, [batchId]: detail }));
      return detail;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ??
          err.message
        : err instanceof Error
          ? err.message
          : "Failed to load batch detail";
      setError(message);
      return null;
    } finally {
      setDetailLoading(null);
    }
  };

  const toggleBatch = async (batchId: string) => {
    if (expandedBatchId === batchId) {
      setExpandedBatchId(null);
      setExpandedOrderId(null);
      return;
    }
    setExpandedBatchId(batchId);
    setExpandedOrderId(null);
    await loadBatchDetail(batchId);
  };

  const saveFleetAssignment = async (batchId: string, routeId: string) => {
    const selection = fleetAssign[batchId];
    if (!selection?.truckId || !selection?.fieldAdminId) {
      setError("Select both a truck and a field admin");
      return;
    }
    setFleetSaving(batchId);
    setError(null);
    try {
      await assignRouteFleet(routeId, selection);
      setDetailCache((prev) => {
        const next = { ...prev };
        delete next[batchId];
        return next;
      });
      await loadBatchDetail(batchId);
      await loadBatches();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to assign fleet";
      setError(message);
    } finally {
      setFleetSaving(null);
    }
  };

  const openRoutingHandoff = async (batchId: string) => {
    try {
      const data = await getBatchRoutingHandoff(batchId);
      setRoutingHandoff(data);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to load routing handoff";
      setError(message);
    }
  };

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter(
      (batch) =>
        batch.batchNumber.toLowerCase().includes(q) ||
        batch.pickupHub?.name.toLowerCase().includes(q) ||
        batch.routes.some((r) => r.routeNumber.toLowerCase().includes(q))
    );
  }, [batches, search]);

  const stats = useMemo(() => {
    const orderCount = batches.reduce((sum, b) => sum + (b._count?.orders ?? 0), 0);
    const inProgress = batches.filter((b) => b.status === "IN_PROGRESS").length;
    const completed = batches.filter((b) => b.status === "COMPLETED").length;
    return { batchCount: batches.length, orderCount, inProgress, completed };
  }, [batches]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Batches &amp; orders</h1>
        <p className="text-sm text-slate-400 mt-1">
          Fulfillment batches from the last 7 days — expand to see orders and products.
        </p>
      </div>

      <AdminDateRangeBar
        since={since}
        until={until}
        onSinceChange={setSince}
        onUntilChange={setUntil}
        onResetLast7Days={() => {
          setSince(defaultSinceDate());
          setUntil(todayDateInput());
        }}
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Batches", value: String(stats.batchCount) },
              { label: "Orders in view", value: String(stats.orderCount) },
              { label: "In progress", value: String(stats.inProgress) },
              { label: "Completed", value: String(stats.completed) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3">
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className="text-lg font-semibold text-slate-100">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <input
              type="text"
              placeholder="Search batch number, hub, or route…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-slate-200 text-slate-900"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              All ({total})
            </button>
            {(Object.keys(BATCH_STATUS) as BatchStatus[]).map((status) => {
              const count = batches.filter((b) => b.status === status).length;
              if (count === 0 && statusFilter !== status) return null;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-slate-200 text-slate-900"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {BATCH_STATUS[status].label}
                  {count > 0 ? ` (${count})` : ""}
                </button>
              );
            })}
          </div>

          {filteredBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-slate-700/50 bg-slate-800/20">
              <p className="text-slate-300 font-medium">No batches found</p>
              <p className="text-slate-500 text-sm mt-1">Run the aggregator or adjust filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBatches.map((batch) => {
                const cfg = BATCH_STATUS[batch.status] ?? BATCH_STATUS.OPEN;
                const isOpen = expandedBatchId === batch.id;
                const detail = detailCache[batch.id];
                const listRoute = batch.routes[0];
                const detailRoute = detail?.routes[0];

                return (
                  <div
                    key={batch.id}
                    className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleBatch(batch.id)}
                      className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-700/20 transition-colors"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: cfg.dot }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-100">{batch.batchNumber}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {formatDisplayDate(batch.scheduledDate)} · {batch.pickupHub?.name ?? "No hub"} ·{" "}
                          {batch._count.orders} orders
                          {listRoute ? ` · ${listRoute.routeNumber}` : ""}
                        </p>
                      </div>
                      <div className="hidden md:block text-right text-xs text-slate-400 flex-shrink-0">
                        <p>{formatDate(batch.scheduledDate)}</p>
                        <p>
                          {formatTime(batch.timeWindowStart)} – {formatTime(batch.timeWindowEnd)}
                        </p>
                      </div>
                      <StatusBadge label={cfg.label} colors={{ text: cfg.text, bg: cfg.bg }} />
                      <Chevron open={isOpen} />
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-700/40 px-5 py-4 space-y-4 bg-slate-900/20">
                        {detailLoading === batch.id && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
                            Loading orders and products…
                          </div>
                        )}

                        {detail && (
                          <>
                            <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-4 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-medium text-slate-200">Fleet assignment</p>
                                <button
                                  type="button"
                                  onClick={() => openRoutingHandoff(batch.id)}
                                  className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200 hover:bg-indigo-500/20"
                                >
                                  Routing handoff
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <label className="text-slate-500">
                                  Field admin
                                  <select
                                    value={
                                      fleetAssign[batch.id]?.fieldAdminId ??
                                      detailRoute?.fieldAdmin?.id ??
                                      listRoute?.fieldAdmin?.id ??
                                      ""
                                    }
                                    onChange={(e) =>
                                      setFleetAssign((prev) => ({
                                        ...prev,
                                        [batch.id]: {
                                          truckId:
                                            prev[batch.id]?.truckId ??
                                            detailRoute?.truck?.id ??
                                            listRoute?.truck?.id ??
                                            "",
                                          fieldAdminId: e.target.value,
                                        },
                                      }))
                                    }
                                    className="mt-1 w-full rounded-lg bg-slate-900/60 border border-slate-600 px-2 py-1.5 text-slate-200"
                                  >
                                    <option value="">Select field admin…</option>
                                    {fleetOptions?.fieldAdmins.map((fa) => (
                                      <option key={fa.id} value={fa.id}>
                                        {fa.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label className="text-slate-500">
                                  Truck
                                  <select
                                    value={
                                      fleetAssign[batch.id]?.truckId ??
                                      detailRoute?.truck?.id ??
                                      listRoute?.truck?.id ??
                                      ""
                                    }
                                    onChange={(e) =>
                                      setFleetAssign((prev) => ({
                                        ...prev,
                                        [batch.id]: {
                                          fieldAdminId:
                                            prev[batch.id]?.fieldAdminId ??
                                            detailRoute?.fieldAdmin?.id ??
                                            listRoute?.fieldAdmin?.id ??
                                            "",
                                          truckId: e.target.value,
                                        },
                                      }))
                                    }
                                    className="mt-1 w-full rounded-lg bg-slate-900/60 border border-slate-600 px-2 py-1.5 text-slate-200"
                                  >
                                    <option value="">Select truck…</option>
                                    {fleetOptions?.trucks.map((truck) => (
                                      <option key={truck.id} value={truck.id} disabled={!truck.isAvailable}>
                                        {truck.vehicleNumber ?? truck.operator}
                                        {!truck.isAvailable ? " (unavailable)" : ""}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                <span>
                                  Driver:{" "}
                                  <span className="text-amber-300">
                                    {detailRoute?.driver?.user.name ?? listRoute?.driver?.user.name ?? "Pending dispatch"}
                                  </span>
                                </span>
                                {(detailRoute?.fieldAdmin || listRoute?.fieldAdmin) &&
                                  (detailRoute?.truck || listRoute?.truck) && (
                                    <span className="text-emerald-400">Fleet assigned</span>
                                  )}
                              </div>
                              {(detailRoute?.id ?? listRoute?.id) && (
                                <button
                                  type="button"
                                  disabled={fleetSaving === batch.id}
                                  onClick={() =>
                                    saveFleetAssignment(
                                      batch.id,
                                      detailRoute?.id ?? listRoute!.id,
                                    )
                                  }
                                  className="rounded-lg bg-emerald-600/80 hover:bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                                >
                                  {fleetSaving === batch.id ? "Saving…" : "Save fleet assignment"}
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="rounded-lg border border-slate-700/40 bg-slate-800/40 p-3">
                                <p className="text-slate-500 mb-1">Scheduled</p>
                                <p className="text-slate-300">{formatDisplayDate(detail.scheduledDate)}</p>
                                <p className="text-slate-500 mt-0.5">
                                  {formatTime(detail.timeWindowStart)} – {formatTime(detail.timeWindowEnd)}
                                </p>
                              </div>
                              <div className="rounded-lg border border-slate-700/40 bg-slate-800/40 p-3">
                                <p className="text-slate-500 mb-1">Route</p>
                                <p className="text-slate-300">
                                  {detailRoute?.routeNumber ?? listRoute?.routeNumber ?? "—"}
                                </p>
                                <p className="text-slate-500 mt-0.5">
                                  Status: {detailRoute?.status ?? listRoute?.status ?? "PLANNED"}
                                </p>
                              </div>
                            </div>

                            {/* Route planning — placeholder for routing team; fills when they wire optimization APIs */}
                            <div className="rounded-lg border border-dashed border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-slate-200">
                                  Route planning
                                  <span className="ml-2 text-xs font-normal text-slate-500">(routing team)</span>
                                </p>
                                <button
                                  type="button"
                                  onClick={() => openRoutingHandoff(batch.id)}
                                  className="rounded-lg border border-indigo-500/40 px-2.5 py-1 text-[11px] text-indigo-200 hover:bg-indigo-500/10"
                                >
                                  View handoff data
                                </button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                {[
                                  { label: "Optimized waypoints", value: "—" },
                                  { label: "Total distance", value: "—" },
                                  { label: "Est. duration", value: "—" },
                                  { label: "Map route", value: "Not planned yet" },
                                ].map((item) => (
                                  <div
                                    key={item.label}
                                    className="rounded-md border border-slate-700/40 bg-slate-900/40 px-2.5 py-2"
                                  >
                                    <p className="text-slate-500">{item.label}</p>
                                    <p className="text-slate-400 mt-0.5">{item.value}</p>
                                  </div>
                                ))}
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Waypoints and optimized sequence will appear here once the routing developer
                                connects their planning flow. Use &quot;Routing handoff&quot; above to pass pickup/dropoff data.
                              </p>
                            </div>

                            {/* Driver dispatch — placeholder for dispatch team; read-only for now */}
                            <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                              <p className="text-sm font-medium text-slate-200">
                                Driver dispatch
                                <span className="ml-2 text-xs font-normal text-slate-500">(dispatch team)</span>
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                <span className="text-slate-400">Assigned driver:</span>
                                <span className="text-amber-300 font-medium">
                                  {detailRoute?.driver?.user.name ??
                                    listRoute?.driver?.user.name ??
                                    "Pending dispatch"}
                                </span>
                              </div>
                              <label className="block text-xs text-slate-500">
                                Driver (read-only until dispatch team enables)
                                <select
                                  disabled
                                  className="mt-1 w-full rounded-lg bg-slate-900/40 border border-slate-700/50 px-2 py-1.5 text-slate-500 cursor-not-allowed"
                                >
                                  <option>Pending dispatch — assigned by routing/dispatch team</option>
                                </select>
                              </label>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-200 mb-2">
                                Orders ({detail.orders.length})
                              </p>
                              <div className="space-y-2">
                                {detail.orders.map((order) => {
                                  const orderOpen = expandedOrderId === order.id;
                                  const orderCfg =
                                    ORDER_STATUS_COLORS[order.status] ?? {
                                      text: "#334155",
                                      bg: "#f1f5f9",
                                    };

                                  return (
                                    <div
                                      key={order.id}
                                      className="rounded-lg border border-slate-700/40 bg-slate-800/25 overflow-hidden"
                                    >
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setExpandedOrderId(orderOpen ? null : order.id)
                                          }
                                          className="flex-1 text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-700/15 transition-colors"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200">
                                              #{order.orderNumber}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                              {order.buyer.user.name} · {order.items.length} products
                                            </p>
                                          </div>
                                          <p className="text-sm font-semibold text-slate-100 hidden sm:block">
                                            {formatAmount(order.totalAmount)}
                                          </p>
                                          <StatusBadge
                                            label={order.status.replace(/_/g, " ")}
                                            colors={orderCfg}
                                          />
                                          <Chevron open={orderOpen} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setModalOrder({ order, batch: detail })}
                                          className="mr-3 rounded-lg border border-slate-600 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700/40"
                                        >
                                          Details
                                        </button>
                                      </div>

                                      {orderOpen && (
                                        <div className="px-4 pb-4 border-t border-slate-700/30">
                                          <table className="min-w-full text-left text-xs mt-3">
                                            <thead className="text-slate-500 uppercase tracking-wide">
                                              <tr>
                                                <th className="py-2 pr-3 font-medium">Product</th>
                                                <th className="py-2 pr-3 font-medium">Seller</th>
                                                <th className="py-2 pr-3 font-medium">Qty</th>
                                                <th className="py-2 pr-3 font-medium">Unit price</th>
                                                <th className="py-2 font-medium">Inspection</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/30 text-slate-300">
                                              {order.items.map((item) => (
                                                <tr key={item.id}>
                                                  <td className="py-2 pr-3">
                                                    {item.product.name}
                                                    <span className="text-slate-500">
                                                      {" "}
                                                      ({item.product.unit})
                                                    </span>
                                                  </td>
                                                  <td className="py-2 pr-3">
                                                    {item.seller.user.name}
                                                  </td>
                                                  <td className="py-2 pr-3">{item.quantity}</td>
                                                  <td className="py-2 pr-3">
                                                    {formatAmount(item.unitPrice)}
                                                  </td>
                                                  <td className="py-2">
                                                    {item.inspections[0]?.result ?? (
                                                      <span className="text-amber-400">Pending</span>
                                                    )}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {detailRoute && detailRoute.stops.length > 0 && (
                              <details className="rounded-lg border border-slate-700/40 bg-slate-800/20">
                                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/10">
                                  Route stops ({detailRoute.stops.length}) — pickup → hub → delivery
                                </summary>
                                <div className="px-4 pb-4 space-y-2">
                                  {detailRoute.stops.map((stop) => (
                                    <div
                                      key={stop.id}
                                      className="flex flex-wrap items-center gap-2 rounded-md border border-slate-700/30 bg-slate-900/30 px-3 py-2 text-xs text-slate-300"
                                    >
                                      <span className="text-slate-500">#{stop.sequenceOrder}</span>
                                      <span className="font-medium text-slate-400">{stop.type}</span>
                                      <span className="flex-1 min-w-[120px] truncate">{stop.address}</span>
                                      {stop.seller?.user.name && (
                                        <span className="text-slate-500">
                                          Seller: {stop.seller.user.name}
                                        </span>
                                      )}
                                      {stop.buyer?.user.name && (
                                        <span className="text-slate-500">
                                          Buyer: {stop.buyer.user.name}
                                        </span>
                                      )}
                                      <StatusBadge
                                        label={stop.status}
                                        colors={
                                          stop.status === "COMPLETED"
                                            ? { text: "#14532d", bg: "#dcfce7" }
                                            : { text: "#78350f", bg: "#fef3c7" }
                                        }
                                      />
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-slate-500">
            Showing {filteredBatches.length} of {total} batches
          </p>
        </>
      )}

      {modalOrder && (
        <OrderDetailModal
          order={modalOrder.order}
          batch={modalOrder.batch}
          onClose={() => setModalOrder(null)}
        />
      )}

      {routingHandoff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setRoutingHandoff(null)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/95 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Routing planner handoff</p>
                <h2 className="text-lg font-semibold text-slate-100">
                  {(routingHandoff.batch as { batchNumber?: string })?.batchNumber ?? "Batch"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setRoutingHandoff(null)}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300"
              >
                Close
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <p className="text-slate-400">
                Real pickup/dropoff locations for the route planning team. Driver assignment is pending dispatch.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-slate-950/80 border border-slate-700/50 p-4 text-xs text-slate-300">
                {JSON.stringify(routingHandoff, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
