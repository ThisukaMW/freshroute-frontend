import React, { useEffect, useState } from "react";
import { getSellerInventory, getInventoryStats, getLowStockProducts, getRestockSuggestions, type ProductInventory } from "../../api/endpoints/inventory";
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
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [stats, setStats] = useState({
    totalSkus: 0,
    totalUnits: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<ProductInventory[]>([]);
  const [restockSuggestions, setRestockSuggestions] = useState<RestockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Check authentication before loading inventory
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError("You must be logged in as a seller to view inventory")
    }
  }, [authLoading, isAuthenticated])

  // Load all inventory data
  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return
    }

    const loadInventoryData = async () => {
      try {
        setLoading(true);
        const [productsData, statsData, lowStockData, suggestionsData] = await Promise.all([
          getSellerInventory(),
          getInventoryStats(),
          getLowStockProducts(),
          getRestockSuggestions(),
        ]);

        console.log("✅ Inventory data loaded successfully");

        setProducts(productsData);
        setStats(statsData);
        setLowStockItems(lowStockData);

        // Format restock suggestions
        const formattedSuggestions = suggestionsData.map((s: any) => ({
          id: s.productId,
          productId: s.productId,
          product: s.productName,
          currentStock: s.currentSellerStock,
          recommendedQuantity: s.recommendedQuantity,
          priority: s.priority,
        }));
        setRestockSuggestions(formattedSuggestions);
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
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-supply-peach">Vendor Ops</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50">Inventory health</h1>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Stats Section */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-slate-400">Active SKUs</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.totalSkus}</p>
          <p className="text-xs text-slate-500">Published in marketplace</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-slate-400">Units on hand</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.totalUnits}</p>
          <p className="text-xs text-slate-500">kg / units total</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-slate-400">Low stock alerts</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.lowStockItems}</p>
          <p className="text-xs text-slate-500">Below threshold</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-wide text-slate-400">Out of stock</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.outOfStockItems}</p>
          <p className="text-xs text-slate-500">Need immediate action</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Inventory ledger</h2>
              
            </div>
            <span className="text-xs text-slate-500">Updated {new Date().toLocaleTimeString()}</span>
          </div>

          {/* Search Bar
          <div className="mt-4 mb-4">
            <input
              type="text"
              placeholder="Search by product name, category, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-supply-teal focus:ring-2 focus:ring-supply-teal/60"
            />
            {searchQuery && (
              <p className="mt-2 text-xs text-slate-400">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            )}
          </div> */}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-100">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
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
                      <p className="text-xs font-semibold text-white">{item.name}</p>
                      
                    </td>
                    <td className="px-3 py-2 text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-1 rounded-full bg-white/10">
                            <div
                              className={`h-1 rounded-full ${
                                item.sellerStock <= item.lowStockThreshold ? "bg-red-400" : "bg-emerald-400"
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
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                          item.status === "active"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : item.status === "pending"
                            ? "bg-amber-500/15 text-amber-300"
                            : item.status === "inactive"
                            ? "bg-white/10 text-slate-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Low-stock alerts</h2>
          {lowStockItems.length === 0 ? (
            <p className="text-xs text-slate-400">Everything is healthy right now.</p>
          ) : (
            <div className="space-y-3 text-sm text-slate-200">
              {lowStockItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-slate-400">Threshold: {item.lowStockThreshold}</p>
                    </div>
                    <span className="text-xs text-amber-300">{item.sellerStock} units left</span>
                  </div>
                 
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Restock plan</h2>
           
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {restockSuggestions.map((entry) => (
  <div
    key={entry.id}
    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
  >
    <p className="text-xs uppercase tracking-wide text-slate-400">
      {entry.priority} priority
    </p>
    <p className="mt-1 text-white">{entry.product}</p>
    <p className="text-xs text-slate-400">
      Current: {entry.currentStock} · Recommended: {entry.recommendedQuantity}
    </p>
  </div>
))}
        </div>
      </section>
    </div>
  );
};

export default InventoryPage;