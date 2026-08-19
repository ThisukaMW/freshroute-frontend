import React, { useEffect, useState } from "react";
import {
  getSellerInventory,
  getInventoryStats,
  getLowStockProducts,
  getOutOfStockProducts,
  getRestockSuggestions,
  type ProductInventory,
} from "../../api/endpoints/inventory";
import { useAuth } from "../../hooks/useAuth";

interface RestockEntry {
  id: string;
  productId: string;
  product: string;
  currentStock: number;
  recommendedQuantity: number;
  priority: "critical" | "high" | "medium";
}

const InventoryPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [stats, setStats] = useState({
    totalSkus: 0,
    totalUnits: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<ProductInventory[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<ProductInventory[]>([]);
  const [restockSuggestions, setRestockSuggestions] = useState<RestockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError("You must be logged in as a seller to view inventory");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadInventoryData = async () => {
      try {
        setLoading(true);
        const [productsData, statsData, lowStockData, outOfStockData, suggestionsData] =
          await Promise.all([
            getSellerInventory(),
            getInventoryStats(),
            getLowStockProducts(),
            getOutOfStockProducts(),   // ✅ new
            getRestockSuggestions(),
          ]);

        setProducts(productsData);
        setStats(statsData);
        setLowStockItems(lowStockData);
        setOutOfStockItems(outOfStockData);  // ✅ new
        setRestockSuggestions(
          suggestionsData.map((s: any) => ({
            id: s.productId,
            productId: s.productId,
            product: s.productName,
            currentStock: s.currentSellerStock,
            recommendedQuantity: s.recommendedQuantity,
            priority: s.priority,
          }))
        );
      } catch (err: any) {
        console.error("❌ Error loading inventory:", err);
        setError(err.message || "Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    };

    loadInventoryData();
  }, [isAuthenticated, authLoading]);

  if (loading) {
    return (
      <div className="space-y-8 text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 animate-pulse">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-supply-peach">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-100">

      {/* Header */}
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-supply-peach">Vendor Ops</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50">Inventory health</h1>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Products" value={stats.totalSkus} sub="Published in marketplace" />
        <StatCard label="Units on hand" value={stats.totalUnits} sub="kg / units total" />
        <StatCard
          label="Low stock alerts"
          value={lowStockItems.length}
          sub="Running low, not empty"
          highlight={lowStockItems.length > 0 ? "amber" : undefined}
        />
        <StatCard
          label="Out of stock"
          value={outOfStockItems.length}
          sub="Need immediate action"
          highlight={outOfStockItems.length > 0 ? "red" : undefined}
        />
      </section>

      {/* Ledger + Alerts side by side */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">

        {/* Inventory ledger */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Inventory ledger</h2>
            <span className="text-xs text-slate-500">Updated {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-100">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Image</th>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Seller Stock</th>
                  <th className="px-3 py-2 font-medium">Total Stock</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-[10px] text-slate-500">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-xs font-semibold text-white">{item.name}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-1 rounded-full bg-white/10">
                            <div
                              className={`h-1 rounded-full ${
                                item.sellerStock === 0
                                  ? "bg-red-500"
                                  : item.sellerStock <= item.lowStockThreshold
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              }`}
                              style={{ width: `${Math.min(100, (item.sellerStock / 40) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span>{item.sellerStock} in stock</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-100">{item.aggregateStock}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column — low stock + out of stock */}
        <div className="space-y-4">

          {/* Low stock alerts — stock > 0 but <= threshold */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-base font-semibold text-white mb-3">
              Low-stock alerts
              {lowStockItems.length > 0 && (
                <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                  {lowStockItems.length}
                </span>
              )}
            </h2>
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400">Everything is healthy right now.</p>
            ) : (
              <div className="space-y-3 text-sm text-slate-200">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">Threshold: {item.lowStockThreshold}</p>
                      </div>
                      <span className="text-xs text-amber-300">{item.sellerStock} left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Out of stock — stock === 0 */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <h2 className="text-base font-semibold text-white mb-3">
              Out of stock
              {outOfStockItems.length > 0 && (
                <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                  {outOfStockItems.length}
                </span>
              )}
            </h2>
            {outOfStockItems.length === 0 ? (
              <p className="text-xs text-slate-400">No products are out of stock.</p>
            ) : (
              <div className="space-y-3 text-sm text-slate-200">
                {outOfStockItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">Threshold: {item.lowStockThreshold}</p>
                      </div>
                      <span className="text-xs text-red-400">Out of stock</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Restock plan */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
        <h2 className="text-base font-semibold text-white mb-4">Restock plan</h2>
        {restockSuggestions.length === 0 ? (
          <p className="text-xs text-slate-400">No restock suggestions right now.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {restockSuggestions.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-2xl border px-4 py-3 text-sm text-slate-200 ${
                  entry.priority === "critical"
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-amber-500/20 bg-amber-500/5"
                }`}
              >
                <p className={`text-xs uppercase tracking-wide ${
                  entry.priority === "critical" ? "text-red-400" : "text-amber-400"
                }`}>
                  {entry.priority} priority
                </p>
                <p className="mt-1 font-semibold text-white">{entry.product}</p>
                <p className="text-xs text-slate-400">
                  Current: {entry.currentStock} · Recommended: +{entry.recommendedQuantity}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

/* ---------- SMALL HELPERS ---------- */

const StatCard: React.FC<{
  label: string;
  value: number;
  sub: string;
  highlight?: "amber" | "red";
}> = ({ label, value, sub, highlight }) => (
  <div className={`rounded-2xl border p-4 backdrop-blur ${
    highlight === "red"
      ? "border-red-500/20 bg-red-500/5"
      : highlight === "amber"
      ? "border-amber-500/20 bg-amber-500/5"
      : "border-white/10 bg-white/5"
  }`}>
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${
      highlight === "red" ? "text-red-300" : highlight === "amber" ? "text-amber-300" : "text-white"
    }`}>{value}</p>
    <p className="text-xs text-slate-500">{sub}</p>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status?.toLowerCase();
  const cls =
    s === "approved" || s === "active"
      ? "bg-emerald-500/15 text-emerald-300"
      : s === "pending"
      ? "bg-amber-500/15 text-amber-300"
      : s === "out_of_stock"
      ? "bg-red-500/15 text-red-300"
      : "bg-white/10 text-slate-300";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${cls}`}>
      {status}
    </span>
  );
};

export default InventoryPage;