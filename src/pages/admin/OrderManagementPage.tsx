import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/index";

type OrderStatus = "Preparing" | "On the way" | "Delivered";

interface OrderItem {
  name: string;
}

interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

const dummyOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Kamal Perera",
    items: [{ name: "Basmati Rice 5kg" }, { name: "Coconut Oil 1L" }],
    total: 3450,
    status: "Preparing",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "ORD-002",
    customerName: "Nimali Silva",
    items: [{ name: "Dhal 1kg" }, { name: "Canned Tuna 400g" }, { name: "Sugar 1kg" }],
    total: 1875,
    status: "On the way",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
];

const statusStyles: Record<OrderStatus, string> = {
  Preparing: "border-amber-500/40 bg-amber-500/20 text-amber-300",
  "On the way": "border-sky-500/40 bg-sky-500/20 text-sky-300",
  Delivered: "border-emerald-500/40 bg-emerald-500/20 text-emerald-300",
};

const OrderManagementPage: React.FC = () => {
  const reduxOrders = useSelector((state: RootState) => state.orders.orders);
  const orders: Order[] = (reduxOrders.length > 0 ? reduxOrders : dummyOrders) as Order[];

  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">

      {/* HEADER ROW */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-50">Order management</h1>

        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by order ID or customer…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/25 w-64"
          />
        </div>
      </div>

      <p className="text-sm text-slate-300">
        Monitor all orders created from the buyer checkout flow. Update status to simulate
        tracking and SLA handling.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-100 backdrop-blur-xl">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-slate-500 py-6">No orders found.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Order ID</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Items</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/5">
                  <td className="px-3 py-2">{o.id}</td>
                  <td className="px-3 py-2">{o.customerName}</td>
                  <td className="px-3 py-2">
                    {o.items.map((i) => i.name).join(", ")}
                  </td>
                  <td className="px-3 py-2">
                    Rs. {o.total.toLocaleString("en-LK")}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyles[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {new Date(o.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>
    </div>
  );
};

export default OrderManagementPage;