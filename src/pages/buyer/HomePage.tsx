import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/client";
import { getBuyerAddresses } from "../../api/endpoints/orders";
import { useAuth } from "../../hooks/useAuth";

interface QuickStat {
  label: string;
  value: string;
  helper: string;
}

type DashboardSummary = {
  userName: string;
  activeOrders: { value: number; helper: string };
  lastOrder: { value: string; helper: string };
  favouriteVendors: { value: number; helper: string };
  cart: { itemCount: number; subtotal: string; total: string };
  featuredProducts: Array<{ id: string; name: string; vendor: string; price: string; imageUrl?: string | null }>;
  recentOrders: Array<{ id: string; vendor: string; total: string; statusLabel: string; status?: string; createdAt: string }>;
  favouriteVendorList: Array<{ vendor: string; count: number }>;
};

type DeliveryAddress = {
  address: string;
  latitude?: number;
  longitude?: number;
};

const getProgress = (status?: string) => {
  switch (status) {
    case "DELIVERED":
      return 100;
    case "IN_TRANSIT":
      return 80;
    case "ASSIGNED":
      return 60;
    case "BATCHED":
      return 45;
    case "PAID":
      return 30;
    case "PAYMENT_PENDING":
      return 20;
    default:
      return 12;
  }
};

const HomePage = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const summaryResponse = await apiClient.get("/dashboard/customer/summary")
        setSummary(summaryResponse.data)

        try {
          const addressResponse = await getBuyerAddresses()
          setDeliveryAddress(addressResponse?.primary ?? addressResponse?.addresses?.[0] ?? null)
        } catch {
          setDeliveryAddress(null)
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  const buyerName = useMemo(() => summary?.userName || user?.name || "Guest", [summary?.userName, user?.name])

  const quickStats: QuickStat[] = [
    {
      label: "Open orders",
      value: String(summary?.activeOrders.value ?? 0),
      helper: summary?.activeOrders.helper ?? "Nothing active right now",
    },
    {
      label: "Last order",
      value: summary?.lastOrder.value ?? "Rs. 0",
      helper: summary?.lastOrder.helper ?? "No orders yet",
    },
    {
      label: "Favorite vendors",
      value: String(summary?.favouriteVendors.value ?? 0),
      helper: summary?.favouriteVendors.helper ?? "Tap vendors to build favorites",
    },
    {
      label: "Cart subtotal",
      value: summary?.cart.subtotal ?? "Rs. 0",
      helper: summary ? `${summary.cart.itemCount} items in cart` : "Open your cart to continue checkout",
    },
  ]

  const liveOrders = (summary?.recentOrders ?? []).slice(0, 2).map((order) => ({
    id: order.id,
    vendor: order.vendor,
    stage: getProgress(order.status),
    status: order.statusLabel,
    checkpoint: order.total,
    eta: new Date(order.createdAt).toLocaleDateString(),
  }))

  const recentProducts = summary?.featuredProducts ?? []
  const planner = (summary?.recentOrders ?? []).slice(0, 2).map((order) => ({
    slot: new Date(order.createdAt).toLocaleString(),
    detail: order.total,
    vendor: order.vendor,
  }))

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6 text-slate-100 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-light">Buyer workspace</p>
          <h1 className="mt-2 text-2xl font-semibold">Morning, {buyerName}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track your active orders, review fresh arrivals and jump back into recent carts.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <p className="text-slate-300">Cart summary</p>
          <p className="text-lg font-semibold text-white">{summary?.cart.total ?? "Rs. 0"}</p>
          <p className="text-xs text-slate-400">{summary ? `${summary.cart.itemCount} items ready for checkout` : "Open your cart to continue"}</p>
        </div>
      </header>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 backdrop-blur">
          Loading buyer home…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur">
          {error}
        </div>
      )}

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
              <h2 className="text-base font-semibold text-white">Recent orders</h2>
              <p className="text-xs text-slate-400">Status across your latest purchases</p>
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
                  <p>Placed {order.eta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Order timeline</h2>
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
              <h2 className="text-base font-semibold text-white">Featured products</h2>
              <p className="text-xs text-slate-400">Fresh arrivals from trusted vendors</p>
            </div>
            <Link to="/buyer/products" className="text-xs font-medium text-primary hover:text-primary-light">
              Browse catalog
            </Link>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            {recentProducts.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{item.price}</p>
                  <p className="text-xs text-emerald-300">Available now</p>
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
                <p className="text-xs text-slate-400">{summary ? `${summary.cart.itemCount} items ready to checkout` : "3 items ready to checkout"}</p>
              </div>
              <span className="text-primary">→</span>
            </Link>
            
            <Link
              to="/profile?tab=address"
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 hover:border-primary/40"
            >
              <div>
                <p className="font-semibold text-white">Delivery address</p>
                <p className="text-xs text-slate-400">
                  {deliveryAddress?.address ?? "Set your delivery address from profile"}
                </p>
              </div>
              <span className="text-primary">→</span>
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-slate-400">
            {deliveryAddress
              ? `Primary address ${deliveryAddress.latitude?.toFixed(4) ?? ""}, ${deliveryAddress.longitude?.toFixed(4) ?? ""}`
              : "Open profile to update your saved delivery address."}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;