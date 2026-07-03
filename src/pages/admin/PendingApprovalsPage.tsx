// Admin page where admins can approve or reject products submitted by sellers

import { useEffect, useState } from "react";
import { LocalStorageService } from "../../services/storage/LocalStorageService";

// Shape of a single pending product coming from the API (matches getPendingProducts in product.service.ts)
interface PendingProduct {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  unit: string;
  stock: number;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  seller: {
    user: {
      name: string;
      email: string;
    };
  };
}

// Converts an ISO date string into a human-friendly "3h ago" or "2d ago" style string
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ProductApprovalsPage = () => {
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tracks which product is currently being approved/rejected — disables its buttons
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Set of product IDs briefly shown as "Approved!" / "Rejected" before removal
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  const token = LocalStorageService.get("fr_token");

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/products/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pending products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

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

      // Remove from the list after a short delay so the badge is visible
      setTimeout(() => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setApprovedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        setRejectedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Error banner */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* List */}
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
            const isApproved = approvedIds.has(product.id);
            const isRejected = rejectedIds.has(product.id);
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
                  {/* Left side — image, name, category, seller, price/stock, time */}
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

                  {/* Right side — action buttons or status badge */}
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

export default ProductApprovalsPage;