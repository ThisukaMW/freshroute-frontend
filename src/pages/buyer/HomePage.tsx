import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface QuickStat {
  label: string;
  value: string;
  helper: string;
}

interface LiveOrder {
  id: string;
  vendor: string;
  stage: number;
  eta: string;
  status: string;
  checkpoint: string;
}

interface RecentProduct {
  name: string;
  vendor: string;
  price: string;
  freshness: string;
}

interface PlannerSlot {
  slot: string;
  detail: string;
  vendor: string;
}

const quickStats: QuickStat[] = [
  { label: "Open orders", value: "2", helper: "1 awaiting rider" },
  { label: "Completed (7d)", value: "8", helper: "+3 vs last week" },
  { label: "Favorite vendors", value: "5", helper: "New: Green Harvest" },
  { label: "Spend (30d)", value: "Rs. 42,300", helper: "Avg. Rs. 1,410 / order" },
];

const liveOrders: LiveOrder[] = [
  {
    id: "#FR-1042",
    vendor: "Green Market",
    stage: 72,
    eta: "12 min",
    status: "On the way",
    checkpoint: "Rider left Kirulapone hub",
  },
  {
    id: "#FR-1038",
    vendor: "Colombo Greens",
    stage: 38,
    eta: "28 min",
    status: "Packing",
    checkpoint: "Quality check in progress",
  },
];

const recentProducts: RecentProduct[] = [
  {
    name: "Heirloom Tomatoes",
    vendor: "Colombo Greens",
    price: "Rs. 480 / kg",
    freshness: "Arrived 45 mins ago",
  },
  {
    name: "Organic Spinach",
    vendor: "Urban Farms",
    price: "Rs. 320 / bunch",
    freshness: "Harvested today",
  },
  {
    name: "Thambili (King Coconut)",
    vendor: "Island Harvest",
    price: "Rs. 180 / pc",
    freshness: "Limited · 20 left",
  },
];

const planner: PlannerSlot[] = [
  { slot: "Tomorrow · 8.30 AM", detail: "Weekly fruit box", vendor: "Fresh Basket" },
  { slot: "Thu · 5.00 PM", detail: "Office pantry restock", vendor: "Urban Farms" },
];

const HomePage: React.FC = () => {
  const { user } = useAuth()
  const buyerName = user?.name || "Guest"

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6 text-slate-100 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-light">Buyer workspace</p>
          <h1 className="mt-2 text-2xl font-semibold">Morning, {buyerName}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track live deliveries, review the freshest arrivals and jump back into recent carts.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <p className="text-slate-300">Next delivery window</p>
          <p className="text-lg font-semibold text-white">Today · 02:30 PM – 03:00 PM</p>
          <p className="text-xs text-slate-400">Order #FR-1042 · Rider Tharindu</p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-slate-100 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-slate-400">{stat.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-supply-teal/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Live order tracking</h2>
              <p className="text-xs text-slate-400">Status across every active delivery</p>
            </div>
            <Link to="/buyer/orders" className="text-xs font-medium text-primary hover:text-primary-light">
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {liveOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-white">
                    {order.id} · {order.vendor}
                  </p>
                  <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-xs text-emerald-300">
                    {order.status}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                    style={{ width: `${order.stage}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-400">
                  <p>{order.checkpoint}</p>
                  <p>ETA {order.eta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Delivery planner</h2>
          <div className="space-y-3 text-sm text-slate-200">
            {planner.map((slot) => (
              <div key={slot.slot} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">{slot.slot}</p>
                <p className="font-semibold text-white">{slot.detail}</p>
                <p className="text-xs text-slate-400">Vendor · {slot.vendor}</p>
              </div>
            ))}
          </div>
          {/* <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-slate-400">
            Need adjustments? Pause a slot or change delivery locations from buyer settings.
          </div> */}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Recent products</h2>
              <p className="text-xs text-slate-400">Fresh arrivals from trusted vendors</p>
            </div>
            <Link to="/buyer/products" className="text-xs font-medium text-primary hover:text-primary-light">
              Browse catalog
            </Link>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            {recentProducts.map((item) => (
              <div
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{item.price}</p>
                  <p className="text-xs text-emerald-300">{item.freshness}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-200">
          <h2 className="text-base font-semibold text-white">Shortcuts</h2>
          <div className="space-y-3">
            <Link
              to="/buyer/cart"
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 hover:border-primary/40"
            >
              <div>
                <p className="font-semibold text-white">Open saved cart</p>
                <p className="text-xs text-slate-400">3 items ready to checkout</p>
              </div>
              <span className="text-primary">→</span>
            </Link>
            <Link
              to="/buyer/profile"
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 hover:border-primary/40"
            >
              <div>
                <p className="font-semibold text-white">Delivery addresses</p>
                <p className="text-xs text-slate-400">Home, HQ pantry, Demo lab</p>
              </div>
              <span className="text-primary">→</span>
            </Link>
          </div>
          {/* <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-slate-400">
            Use this panel during demos to explain personalization flows for buyers.
          </div> */}
        </div>
      </section>
    </div>
  );
};

export default HomePage;