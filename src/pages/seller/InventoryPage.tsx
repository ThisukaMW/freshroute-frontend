import React, { useMemo } from "react";
import { useSelector } from "react-redux";

// Type definitions
interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: "active" | "pending" | "inactive" | "rejected";
}

interface RootState {
  sellerProducts: {
    products: Product[];
  };
}

interface Stat {
  label: string;
  value: string;
  helper: string;
}

interface RestockEntry {
  id: string;
  product: string;
  qty: number;
  eta: string;
  supplier: string;
}

const InventoryPage: React.FC = () => {
  const products = useSelector((state: RootState) => state.sellerProducts.products);

  const stats = useMemo<Stat[]>(() => {
    const totalSkus = products.length;
    const totalUnits = products.reduce((sum, item) => sum + (item.stock ?? 0), 0);
    const lowStock = products.filter((item) => item.stock <= 8);
    const inactive = products.filter((item) => item.status !== "active");

    return [
      { label: "Active SKUs", value: `${totalSkus}`, helper: "Published in marketplace" },
      { label: "Units on hand", value: `${totalUnits} kg / units`, helper: "Approximate" },
      { label: "Low stock alerts", value: `${lowStock.length}`, helper: "≤ 8 units remaining" },
      { label: "Paused items", value: `${inactive.length}`, helper: "Needs action" },
    ];
  }, [products]);

  const lowStockItems = useMemo<Product[]>(
    () => products.filter((item) => item.stock <= 8).sort((a, b) => a.stock - b.stock),
    [products]
  );

  const restockPlan = useMemo<RestockEntry[]>(() => {
    if (!products.length) return [];
    return products.slice(0, 4).map((item, idx) => ({
      id: item.id,
      product: item.name,
      qty: Math.max(10, 30 - item.stock) + idx * 2,
      eta: idx % 2 === 0 ? "Tomorrow 9:00 AM" : "Friday 2:00 PM",
      supplier: idx % 2 === 0 ? "FreshRoute central" : "Regional grower",
    }));
  }, [products]);

  return (
    <div className="space-y-8 text-slate-100">
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-supply-peach">Vendor Ops</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50">Inventory health</h1>
        <p className="mt-1 text-sm text-slate-400">
          Walk stakeholders through real-time stock, restock planning, and low-stock signals sourced
          directly from the demo product catalog.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Inventory ledger</h2>
              <p className="text-xs text-slate-400">Pulls directly from the seller product slice.</p>
            </div>
            <span className="text-xs text-slate-500">Updated {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-100">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Stock</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">
                      <p className="text-xs font-semibold text-white">{item.name}</p>
                      <p className="text-[11px] text-slate-500">SKU: {item.id}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-300">{item.category}</td>
                    <td className="px-3 py-2 text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-1 rounded-full bg-white/10">
                            <div
                              className={`h-1 rounded-full ${
                                item.stock <= 6 ? "bg-red-400" : "bg-emerald-400"
                              }`}
                              style={{ width: `${Math.min(100, (item.stock / 40) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span>{item.stock} in stock</span>
                      </div>
                    </td>
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
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                    <span className="text-xs text-amber-300">{item.stock} units left</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Tip: talk through how you would trigger supplier notifications once this hits 5 units.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Restock plan (demo)</h2>
            <p className="text-xs text-slate-400">Shows how you would brief ops on incoming loads.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {restockPlan.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-wide text-slate-400">{entry.eta}</p>
              <p className="mt-1 text-white">{entry.product}</p>
              <p className="text-xs text-slate-400">{entry.qty} units en route · {entry.supplier}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InventoryPage;