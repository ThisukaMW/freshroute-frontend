import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminDateRangeBar, { defaultSinceDate, todayDateInput } from "../../components/admin/AdminDateRangeBar";
import {
  getRefundById,
  listRefunds,
  updateRefundStatus,
  type RefundListItem,
  type RefundStatus,
} from "../../api/endpoints/adminRefunds";
import { formatDisplayDate } from "../../utils/adminDateFilters";

const STRIPE_REFUNDS_URL = "https://dashboard.stripe.com/acct_1T6wuYLaLkoa6g6x/test/payments";

const STATUS_STYLE: Record<string, { text: string; bg: string }> = {
  PENDING: { text: "#78350f", bg: "#fef3c7" },
  PROCESSING: { text: "#1e3a5f", bg: "#dbeafe" },
  COMPLETED: { text: "#14532d", bg: "#dcfce7" },
  FAILED: { text: "#7f1d1d", bg: "#fee2e2" },
  REFUNDED: { text: "#312e81", bg: "#e0e7ff" },
};

const formatAmount = (amount: number) =>
  `Rs. ${new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" });

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = STATUS_STYLE[status] ?? { text: "#334155", bg: "#f1f5f9" };
  return (
    <span
      className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: colors.bg, color: colors.text }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

const RefundDetailModal: React.FC<{
  refund: RefundListItem;
  onClose: () => void;
  onUpdated: (refund: RefundListItem) => void;
}> = ({ refund, onClose, onUpdated }) => {
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<"PROCESSING" | "FAILED" | null>(null);

  const changeStatus = async (status: "PROCESSING" | "COMPLETED" | "FAILED") => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await updateRefundStatus(refund.id, status);
      onUpdated(updated);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to update refund";
      setActionError(message);
    } finally {
      setBusy(false);
    }
  };

  const refundReason =
    refund.reason?.trim() ||
    refund.refundItems
      .map((item) => item.inspection?.notes)
      .filter(Boolean)
      .join("; ") ||
    "Quality inspection rejection";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Refund review</p>
            <h2 className="text-lg font-semibold text-slate-100">
              Order #{refund.order.orderNumber}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDisplayDate(refund.createdAt)} · {formatTime(refund.createdAt)}
            </p>
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
          {actionError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {actionError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-1">Field admin</p>
              <p className="text-slate-200">{refund.fieldAdmin.user.name}</p>
              <p className="text-xs text-slate-500">{refund.fieldAdmin.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Buyer</p>
              <p className="text-slate-200">{refund.order.buyer?.user.name ?? "—"}</p>
              <p className="text-xs text-slate-500">{refund.order.buyer?.user.email ?? ""}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Refund amount</p>
              <p className="text-slate-100 font-semibold text-lg">{formatAmount(refund.amount)}</p>
              <StatusBadge status={refund.status} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Order total</p>
              <p className="text-slate-200">{formatAmount(refund.order.totalAmount)}</p>
              <p className="text-xs text-slate-500 mt-1">Order status: {refund.order.status}</p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-xs font-medium text-amber-300 uppercase tracking-wide mb-1">Why</p>
            <p className="text-sm text-amber-100">{refundReason}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-200 mb-2">Rejected items</p>
            <div className="rounded-xl border border-slate-700/50 overflow-hidden">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Rejected qty</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40 text-slate-300">
                  {refund.refundItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        {item.orderItem.product.name}
                        <span className="text-slate-500"> ({item.orderItem.product.unit})</span>
                      </td>
                      <td className="px-3 py-2">{item.rejectedQuantity}</td>
                      <td className="px-3 py-2">{formatAmount(item.lineAmount)}</td>
                      <td className="px-3 py-2">
                        {item.inspection?.result ?? "—"}
                        {item.inspection?.notes && (
                          <p className="text-slate-500 mt-0.5">{item.inspection.notes}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {refund.order.payment && (
            <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 px-4 py-3 text-sm">
              <p className="text-xs text-slate-500 mb-2">Original payment</p>
              <p className="text-slate-300">
                {formatAmount(refund.order.payment.amount)} · {refund.order.payment.status}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/40">
            <a
              href={STRIPE_REFUNDS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              Open Stripe payment portal
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            {refund.status === "PENDING" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmationStatus("PROCESSING")}
                className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 hover:bg-sky-500/20 disabled:opacity-50"
              >
                Mark processing
              </button>
            )}
            {refund.status === "PROCESSING" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => changeStatus("COMPLETED")}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                Mark refund completed
              </button>
            )}
            
            {(refund.status === "PENDING" || refund.status === "PROCESSING") && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmationStatus("FAILED")}
                className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
              >
                Mark failed
              </button>
            )}
          </div>

          {confirmationStatus && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/70"
                onClick={() => setConfirmationStatus(null)}
                aria-label="Cancel status confirmation"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="refund-status-confirmation-title"
                className="relative w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
              >
                <h3 id="refund-status-confirmation-title" className="text-base font-semibold text-slate-100">
                  Confirm refund status change
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Are you sure you want to mark order #{refund.order.orderNumber} as {confirmationStatus.toLowerCase()}?
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmationStatus(null)}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      const status = confirmationStatus;
                      setConfirmationStatus(null);
                      await changeStatus(status);
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                      confirmationStatus === "FAILED"
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-sky-600 hover:bg-sky-500"
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const RefundPage: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [since, setSince] = useState(defaultSinceDate);
  const [until, setUntil] = useState(todayDateInput);
  const [statusFilter, setStatusFilter] = useState<RefundStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<RefundListItem | null>(null);

  const loadRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listRefunds({ since, until });
      setRefunds(data);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message
        : "Failed to load refunds";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [since, until]);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return refunds
      .filter((r) => statusFilter === "ALL" || r.status === statusFilter)
      .filter((r) => {
        if (!q) return true;
        return (
          r.order.orderNumber.toLowerCase().includes(q) ||
          r.fieldAdmin.user.name.toLowerCase().includes(q) ||
          (r.reason ?? "").toLowerCase().includes(q) ||
          (r.order.buyer?.user.name ?? "").toLowerCase().includes(q)
        );
      });
  }, [refunds, search, statusFilter]);

  const openRefund = async (refund: RefundListItem) => {
    try {
      const detail = await getRefundById(refund.id);
      setSelected(detail);
    } catch {
      setSelected(refund);
    }
  };

  const handleUpdated = (updated: RefundListItem) => {
    setRefunds((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelected(updated);
  };

  const pendingCount = refunds.filter((r) => r.status === "PENDING").length;
  const totalAmount = refunds
    .filter((r) => r.status === "PENDING" || r.status === "PROCESSING")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Refunds</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review field-admin initiated refunds and process payouts via Stripe.
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Refunds in range", value: String(refunds.length) },
              { label: "Pending review", value: String(pendingCount) },
              { label: "Total refund value", value: formatAmount(totalAmount) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3">
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className="text-lg font-semibold text-slate-100">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search order number, field admin, buyer, reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED"] as const).map((s) => {
              const count = s === "ALL" ? refunds.length : refunds.filter((r) => r.status === s).length;
              if (s !== "ALL" && count === 0 && statusFilter !== s) return null;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-slate-200 text-slate-900"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {s === "ALL" ? `All (${count})` : `${s} (${count})`}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-slate-700/50 bg-slate-800/20">
              <p className="text-slate-300 font-medium">No refunds in this date range</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/30">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-700/50 text-[11px] uppercase tracking-wide text-slate-400 bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Field admin</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {filtered.map((refund) => (
                    <tr key={refund.id} className="hover:bg-slate-700/10 text-slate-300">
                      <td className="px-4 py-3 text-xs">
                        <p>{formatDisplayDate(refund.createdAt)}</p>
                        <p className="text-slate-500">{formatTime(refund.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">
                        #{refund.order.orderNumber}
                        {refund.order.buyer?.user.name && (
                          <p className="text-xs text-slate-500 font-normal">
                            {refund.order.buyer.user.name}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">{refund.fieldAdmin.user.name}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-xs">
                        {refund.reason ?? refund.refundItems[0]?.inspection?.notes ?? "Inspection rejection"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-100">
                        {formatAmount(refund.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={refund.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openRefund(refund)}
                          className="rounded-lg bg-indigo-600/80 hover:bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white"
                        >
                          Refund
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selected && (
        <RefundDetailModal
          refund={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

export default RefundPage;
