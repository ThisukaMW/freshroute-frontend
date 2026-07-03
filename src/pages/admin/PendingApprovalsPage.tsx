import { useEffect, useState } from "react";
import { usePendingApprovalsContext } from "../../context/PendingApprovalsContext";
import { LocalStorageService } from "../../services/storage/LocalStorageService";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole   = "SELLER" | "DRIVER";
type RoleFilter = "ALL" | UserRole;
type PageTab    = "accounts" | "products";

// FIX: this was previously shaped like a product (category/price/stock)
// instead of a user. That's what caused the "role/email/city does not
// exist on type 'PendingUser'" errors.
interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string | null;
  createdAt: string;
  sellerProfile?: {
    id: string;
    businessName: string;
    businessAddress: string;
    isApproved: boolean;
  } | null;
}

interface PendingProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
  seller: {
    user: { name: string; email: string };
    businessName?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const roleConfig: Record<UserRole, { emoji: string; label: string; color: string; bg: string }> = {
  SELLER: { emoji: "🏪", label: "Seller", color: "text-sky-400",    bg: "bg-sky-500/15 border-sky-500/20"       },
  DRIVER: { emoji: "🚚", label: "Driver", color: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/20" },
};

const REJECT_REASONS = [
  "Incomplete or suspicious registration details",
  "Business address could not be verified",
  "Duplicate account detected",
  "Does not meet platform requirements",
  "Invalid or unrecognized business",
  "Other (specify below)",
];

const PRODUCT_REJECT_REASONS = [
  "Images are missing or low quality",
  "Incorrect or misleading product description",
  "Price appears incorrect",
  "Product does not meet platform guidelines",
  "Duplicate product already exists",
  "Other (specify below)",
];

// ─── Reject Modal (shared for both users and products) ────────────────────────

const RejectModal = ({
  title, subtitle, reasons, onConfirm, onCancel, isSubmitting,
}: {
  title: string;
  subtitle: string;
  reasons: string[];
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason]     = useState("");
  const isOther   = selectedReason === "Other (specify below)";
  const finalReason = isOther ? customReason.trim() : selectedReason;
  const canSubmit = selectedReason && (!isOther || customReason.trim().length > 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-950 p-6 space-y-5 shadow-2xl">
        <div>
          <h2 className="text-base font-semibold text-slate-50">{title}</h2>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className="space-y-2">
          {reasons.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm transition-all ${
                selectedReason === reason
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : "border-white/10 bg-white/3 text-slate-300 hover:bg-white/5"
              }`}
            >
              {reason}
            </button>
          ))}
        </div>
        {isOther && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Describe the reason..."
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-red-500/40 resize-none"
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onConfirm(finalReason)}
            disabled={!canSubmit || isSubmitting}
            className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Confirm Approve Modal (shared for both users and products) ───────────────

const ConfirmApproveModal = ({
  title, subtitle, onConfirm, onCancel, isSubmitting,
}: {
  title: string;
  subtitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-950 p-6 space-y-5 shadow-2xl">
        <div>
          <h2 className="text-base font-semibold text-slate-50">{title}</h2>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-teal-500/20 border border-teal-500/30 px-4 py-2.5 text-sm font-medium text-teal-400 hover:bg-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Approving..." : "Confirm Approve"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Accounts Section (pending seller/driver registrations) ───────────────────

const AccountsSection = ({ token, onCountChange }: { token: string | null; onCountChange: (n: number) => void }) => {
  const [users, setUsers]                 = useState<PendingUser[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [approvingId, setApprovingId]     = useState<string | null>(null);
  const [approvedIds, setApprovedIds]     = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds]     = useState<Set<string>>(new Set());
  const [rejectTarget, setRejectTarget]   = useState<PendingUser | null>(null);
  const [approveTarget, setApproveTarget] = useState<PendingUser | null>(null);
  const [isRejecting, setIsRejecting]     = useState(false);
  const [roleFilter, setRoleFilter]       = useState<RoleFilter>("ALL");
  const { refreshPendingCount }           = usePendingApprovalsContext();

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      // NOTE: verify this matches your actual backend route for pending
      // seller/driver registrations — adjust if it differs.
      const res = await fetch("/api/v1/admin/users/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pending accounts");
      const data = await res.json();
      const list: PendingUser[] = data.data ?? data ?? [];
      setUsers(list);
      onCountChange(list.length);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to approve user");
      setApprovedIds((prev) => new Set(prev).add(userId));
      refreshPendingCount();
      setTimeout(() => {
        setUsers((prev) => {
          const next = prev.filter((u) => u.id !== userId);
          onCountChange(next.length);
          return next;
        });
        setApprovedIds((prev) => { const n = new Set(prev); n.delete(userId); return n; });
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveConfirm = () => {
    if (!approveTarget) return;
    const target = approveTarget;
    setApproveTarget(null);
    handleApprove(target.id);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${rejectTarget.id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject user");
      const rejectedId = rejectTarget.id;
      setRejectedIds((prev) => new Set(prev).add(rejectedId));
      refreshPendingCount();
      setTimeout(() => {
        setUsers((prev) => {
          const next = prev.filter((u) => u.id !== rejectedId);
          onCountChange(next.length);
          return next;
        });
        setRejectedIds((prev) => { const n = new Set(prev); n.delete(rejectedId); return n; });
      }, 1500);
      setRejectTarget(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRejecting(false);
    }
  };

  const filtered = roleFilter === "ALL" ? users : users.filter((u) => u.role === roleFilter);
  const countByRole = (role: UserRole) => users.filter((u) => u.role === role).length;
  const filterTabs: { key: RoleFilter; label: string }[] = [
    { key: "ALL",    label: `All (${users.length})` },
    { key: "SELLER", label: `Sellers (${countByRole("SELLER")})` },
    { key: "DRIVER", label: `Drivers (${countByRole("DRIVER")})` },
  ];

  return (
    <>
      {rejectTarget && (
        <RejectModal
          title="Reject Registration"
          subtitle={`You are rejecting ${rejectTarget.name} (${rejectTarget.email}). Please select a reason.`}
          reasons={REJECT_REASONS}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          isSubmitting={isRejecting}
        />
      )}

      {approveTarget && (
        <ConfirmApproveModal
          title="Approve Registration"
          subtitle={`Are you sure you want to approve ${approveTarget.name} (${approveTarget.email})? This will grant them account access.`}
          onConfirm={handleApproveConfirm}
          onCancel={() => setApproveTarget(null)}
          isSubmitting={approvingId === approveTarget.id}
        />
      )}

      <div className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Role filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all border ${
                roleFilter === tab.key
                  ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/3 py-20 gap-4">
            <span className="text-5xl opacity-40">✅</span>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">No pending account approvals</p>
              <p className="text-xs text-slate-500 mt-1">All registrations have been reviewed.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((user) => {
              const config      = roleConfig[user.role];
              const isApproved  = approvedIds.has(user.id);
              const isRejected  = rejectedIds.has(user.id);
              const isApproving = approvingId === user.id;
              return (
                <div
                  key={user.id}
                  className={`rounded-2xl border px-5 py-4 transition-all ${
                    isApproved ? "border-emerald-500/40 bg-emerald-500/10"
                    : isRejected ? "border-red-500/40 bg-red-500/10"
                    : "border-white/10 bg-white/3 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/30 to-sky-500/20 text-sm font-bold text-teal-300">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                          <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.color}`}>
                            {config.emoji} {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                        {user.sellerProfile && (
                          <p className="text-xs text-slate-500 mt-1">
                            🏪 {user.sellerProfile.businessName} · {user.sellerProfile.businessAddress}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          {user.city && <span>🌆 {user.city}</span>}
                          <span>🕐 Registered {relativeTime(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {isApproved ? (
                        <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          Approved!
                        </span>
                      ) : isRejected ? (
                        <span className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          Rejected
                        </span>
                      ) : (
                        <>
                          <button onClick={() => setRejectTarget(user)} disabled={isApproving} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50">
                            Reject
                          </button>
                          <button onClick={() => setApproveTarget(user)} disabled={isApproving} className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-400 transition-all hover:bg-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50">
                            {isApproving ? "Approving..." : "Approve"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {filtered.length > 0 && (
          <p className="text-center text-[11px] text-slate-600">
            Showing {filtered.length} of {users.length} pending account{users.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </>
  );
};

// ─── Products Section (pending product listings) ──────────────────────────────

const ProductsSection = ({ token }: { token: string | null }) => {
  const [products, setProducts]       = useState<PendingProduct[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/products/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pending products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const updateStatus = async (productId: string, status: "APPROVED" | "REJECTED") => {
    setProcessingId(productId);
    try {
      const res = await fetch(`/api/v1/products/${productId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Failed to ${status === "APPROVED" ? "approve" : "reject"} product`);

      if (status === "APPROVED") {
        setApprovedIds((prev) => new Set(prev).add(productId));
      } else {
        setRejectedIds((prev) => new Set(prev).add(productId));
      }

      setTimeout(() => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setApprovedIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
        setRejectedIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Product Approvals</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {loading
              ? "Loading..."
              : products.length === 0
              ? "No products awaiting approval"
              : `${products.length} product${products.length !== 1 ? "s" : ""} awaiting approval`}
          </p>
        </div>
        {products.length > 0 && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
            {products.length} pending
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/3 py-20 gap-4">
          <span className="text-5xl opacity-40">✅</span>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-400">No pending product approvals</p>
            <p className="text-xs text-slate-500 mt-1">All submitted products have been reviewed.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const isApproved   = approvedIds.has(product.id);
            const isRejected   = rejectedIds.has(product.id);
            const isProcessing = processingId === product.id;

            return (
              <div
                key={product.id}
                className={`rounded-2xl border px-5 py-4 transition-all ${
                  isApproved
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : isRejected
                    ? "border-red-500/40 bg-red-500/10"
                    : "border-white/10 bg-white/3 hover:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-14 w-14 flex-shrink-0 rounded-xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/30 to-sky-500/20 text-lg font-bold text-teal-300">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-100">{product.name}</p>
                        <span className="rounded-full border border-sky-500/20 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        🏪 {product.seller.user.name} · {product.seller.user.email}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>Rs. {product.price.toFixed(2)} / {product.unit}</span>
                        <span>📦 {product.stock} in stock</span>
                        <span>🕐 Submitted {relativeTime(product.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    {isApproved ? (
                      <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Approved!
                      </span>
                    ) : isRejected ? (
                      <span className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rejected
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => updateStatus(product.id, "REJECTED")}
                          disabled={isProcessing}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => updateStatus(product.id, "APPROVED")}
                          disabled={isProcessing}
                          className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-400 transition-all hover:bg-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? "Working..." : "Approve"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Top-level page (tab switcher) ─────────────────────────────────────────────

const PendingApprovalsPage = () => {
  const [activeTab, setActiveTab] = useState<PageTab>("accounts");
  const [accountsCount, setAccountsCount] = useState(0);
  const token = LocalStorageService.get("fr_token");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/3 p-1 w-fit">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
            activeTab === "accounts"
              ? "bg-teal-500/20 text-teal-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Accounts{accountsCount > 0 ? ` (${accountsCount})` : ""}
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
            activeTab === "products"
              ? "bg-teal-500/20 text-teal-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Products
        </button>
      </div>

      {activeTab === "accounts" ? (
        <AccountsSection token={token} onCountChange={setAccountsCount} />
      ) : (
        <ProductsSection token={token} />
      )}
    </div>
  );
};

export default PendingApprovalsPage;
