import React from "react";

interface OrderItem {
  name: string;
  qty: string;
}

interface Rider {
  name: string;
  phone: string | null;
  plate: string | null;
}

interface PickupOrder {
  id: string;
  buyer: string;
  window: string;
  route: string;
  weight: string;
  stage: number;
  timeline: string[];
  items: OrderItem[];
  rider: Rider;
}

interface StatCard {
  label: string;
  value: string | number;
  helper: string;
}

const pickupQueue: PickupOrder[] = [
  {
    id: "#FR-2042",
    buyer: "Isuru Perera",
    window: "Pickup in 10 min",
    route: "Colombo 05",
    weight: "6.4 kg",
    stage: 3,
    timeline: ["Confirmed", "Prepping", "Ready for pickup", "On the way", "Delivered"],
    items: [
      { name: "Heirloom tomato crate", qty: "2 kg" },
      { name: "Organic spinach", qty: "3 bunches" },
    ],
    rider: { name: "Tharindu", phone: "+94 77 123 4567", plate: "WP BHI-2045" },
  },
  {
    id: "#FR-2038",
    buyer: "Colombo Tech Hub",
    window: "Pickup in 22 min",
    route: "Union Place",
    weight: "12.1 kg",
    stage: 2,
    timeline: ["Confirmed", "Prepping", "Ready for pickup", "On the way", "Delivered"],
    items: [
      { name: "Baby carrots", qty: "3 kg" },
      { name: "Kale bundles", qty: "8 pcs" },
    ],
    rider: { name: "Assigning", phone: null, plate: null },
  },
];

const mapPreview =
  "https://cdn.prod.website-files.com/5c29380b1110ec92a203aa84/66e5ce469b48938aa34d8684_Google%20Maps%20-%20Compressed.jpg";

const statCards: StatCard[] = [
  { label: "Awaiting pickup", value: pickupQueue.length, helper: "Syncs with rider app" },
  { label: "Average prep time", value: "14 min", helper: "Rolling 10 orders" },
  { label: "Cold-chain integrity", value: "98%", helper: "Past 24 hours" },
];

const OrdersPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 text-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Vendor fulfillment</p>
        <h1 className="mt-2 text-2xl font-semibold">Orders & rider tracking</h1>
        <p className="mt-1 text-sm text-slate-300">
          Showcase how Green Market hands off every crate with live GPS, pickup readiness, and rider assignments.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {statCards.map((data) => (
          <div key={data.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-400">{data.label}</p>
            <p className="mt-2 text-2xl font-semibold text-supply-paper">{data.value}</p>
            <p className="text-xs text-slate-500">{data.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Queue for pickup</h2>
              <p className="text-xs text-slate-400">Walk through how vendors prep, seal, and release inventory</p>
            </div>
          </div>
          <div className="space-y-4">
            {pickupQueue.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm text-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{order.window}</p>
                    <p className="text-lg font-semibold text-white">
                      {order.id} · {order.buyer}
                    </p>
                    <p className="text-xs text-slate-400">{order.route} · {order.weight}</p>
                  </div>
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-300">
                    Stage {order.stage + 1} / {order.timeline.length}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  {order.items.map((item) => (
                    <span
                      key={`${order.id}-${item.name}`}
                      className="rounded-full border border-white/10 px-2 py-0.5 text-slate-300"
                    >
                      {item.name} · {item.qty}
                    </span>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Tracking timeline</p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {order.timeline.map((step, index) => (
                      <span
                        key={step}
                        className={[
                          "rounded-full px-3 py-1",
                          index <= order.stage ? "bg-primary/20 text-primary-light" : "border border-white/10 text-slate-400",
                        ].join(" ")}
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-300 md:grid-cols-2">
                  <div>
                    <p className="font-semibold text-slate-100">Rider</p>
                    <p>{order.rider.name}</p>
                    <p>{order.rider.plate ?? "Plate to be assigned"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">Contact</p>
                    <p>{order.rider.phone ?? "Automatic when assigned"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Live rider map</h2>
          <p className="text-xs text-slate-400">Describe how you mirror Uber-style tracking for dispatch supervisors.</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <img src={mapPreview} alt="Vendor live map" className="h-72 w-full object-cover" />
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <p>Each pickup shows temperature, weight, and ETA. Tie this into analytics or IoT dashboards later.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Product readiness</h2>
            <p className="text-xs text-slate-400">Give buyers and admins confidence in how you prep every SKU.</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto text-sm text-slate-100">
          <table className="min-w-full divide-y divide-white/5 text-left">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Quantity</th>
                <th className="px-3 py-2 font-medium">Stage</th>
                <th className="px-3 py-2 font-medium">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {pickupQueue.flatMap((order) =>
                order.items.map((item) => (
                  <tr key={`${order.id}-${item.name}`}>
                    <td className="px-3 py-2 text-white">{order.id}</td>
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2">{item.qty}</td>
                    <td className="px-3 py-2">Stage {order.stage + 1} / {order.timeline.length}</td>
                    <td className="px-3 py-2">
                      {order.stage >= 2 ? "Seal crate & handoff" : "Finish prep"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default OrdersPage;