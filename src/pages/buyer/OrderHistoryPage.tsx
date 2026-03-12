import React from "react";

interface OrderItem {
  name: string;
  qty: number;
  unit: string;
}

interface Rider {
  name: string;
  vehicle: string;
  phone: string | null;
}

interface ActiveOrder {
  id: string;
  vendor: string;
  placedAt: string;
  status: string;
  eta: string;
  rider: Rider;
  stage: number;
  timeline: string[];
  items: OrderItem[];
}

interface HighlightedItem extends OrderItem {
  orderId: string;
  vendor: string;
}

interface StatCard {
  label: string;
  value: string | number;
  helper: string;
}

const activeOrders: ActiveOrder[] = [
  {
    id: "#FR-1042",
    vendor: "Green Market",
    placedAt: "Today · 1:10 PM",
    status: "On the way",
    eta: "12 min",
    rider: { name: "Tharindu", vehicle: "Scooter · WP BHI-2045", phone: "+94 77 123 4567" },
    stage: 3,
    timeline: ["Order placed", "Packed", "Picked up", "On the way", "Delivered"],
    items: [
      { name: "Heirloom tomatoes", qty: 2, unit: "kg" },
      { name: "Organic spinach", qty: 3, unit: "bunches" },
      { name: "Thambili", qty: 4, unit: "pcs" },
    ],
  },
  {
    id: "#FR-1038",
    vendor: "Colombo Greens",
    placedAt: "Today · 12:05 PM",
    status: "Packing",
    eta: "28 min",
    rider: { name: "Pending", vehicle: "—", phone: null },
    stage: 2,
    timeline: ["Order placed", "Packed", "Picked up", "On the way", "Delivered"],
    items: [
      { name: "Baby carrots", qty: 1, unit: "kg" },
      { name: "Purple cabbage", qty: 2, unit: "pcs" },
    ],
  },
];

const statCards: StatCard[] = [
  { label: "Live deliveries", value: activeOrders.length, helper: "Updated in real time" },
  { label: "Delivered (7d)", value: "14", helper: "+4 vs previous" },
  { label: "Average ETA", value: "21 min", helper: "Across Colombo routes" },
];

const mapPreview =
  "https://cdn.prod.website-files.com/5c29380b1110ec92a203aa84/66e5ce469b48938aa34d8684_Google%20Maps%20-%20Compressed.jpg";

const OrderHistoryPage: React.FC = () => {
  const highlightedItems: HighlightedItem[] = activeOrders.flatMap((order) =>
    order.items.map((item) => ({ ...item, orderId: order.id, vendor: order.vendor }))
  );

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 text-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-light">Buyer orders</p>
        <h1 className="mt-2 text-2xl font-semibold">Tracking & history</h1>
        <p className="mt-1 text-sm text-slate-400">
          Stay on top of every delivery with live telemetry, product details, and rider contact info.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-slate-500">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-supply-teal/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Live tracking details</h2>
              {/* <p className="text-xs text-slate-400">Map rider progress just like Uber Eats or PickMe Food</p> */}
            </div>
          </div>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm text-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{order.placedAt}</p>
                    <p className="text-lg font-semibold text-white">
                      {order.id} · {order.vendor}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      {order.status}
                    </span>
                    <p className="text-xs text-slate-400">ETA {order.eta}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  {order.items.map((item) => (
                    <span
                      key={`${order.id}-${item.name}`}
                      className="rounded-full border border-white/10 px-2 py-0.5 text-slate-300"
                    >
                      {item.name} · {item.qty} {item.unit}
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
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-300">
                  <p className="font-semibold text-slate-100">Rider contact</p>
                  <p>{order.rider.name} · {order.rider.vehicle}</p>
                  {order.rider.phone ? <p>{order.rider.phone}</p> : <p>Assignment pending</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Live map preview</h2>
          {/* <p className="text-xs text-slate-400">Use this visual to explain how the mobile app mirrors Uber-style tracking.</p> */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <img src={mapPreview} alt="Map preview" className="h-72 w-full object-cover" />
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <p>Each rider emits GPS + temperature data every 10 seconds. Overlay those pings on any map provider.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Order line items</h2>
            {/* <p className="text-xs text-slate-400">Great for demos when explaining substitutions, pricing, or refunds.</p> */}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto text-sm text-slate-100">
          <table className="min-w-full divide-y divide-white/5 text-left">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Quantity</th>
                <th className="px-3 py-2 font-medium">Vendor</th>
                <th className="px-3 py-2 font-medium">Tracking status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {highlightedItems.map((item) => (
                <tr key={`${item.orderId}-${item.name}`}>
                  <td className="px-3 py-2 text-white">{item.orderId}</td>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.qty} {item.unit}</td>
                  <td className="px-3 py-2">{item.vendor}</td>
                  <td className="px-3 py-2">
                    {activeOrders.find((order) => order.id === item.orderId)?.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default OrderHistoryPage;