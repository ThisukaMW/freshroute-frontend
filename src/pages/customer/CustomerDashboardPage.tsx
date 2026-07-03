import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import apiClient from '../../api/client'

type DashboardSummary = {
  userName: string
  activeOrders: { value: number; helper: string }
  lastOrder: { value: string; helper: string }
  favouriteVendors: { value: number; helper: string }
  cart: { itemCount: number; subtotal: string; total: string }
  featuredProducts: Array<{ id: string; name: string; vendor: string; price: string; imageUrl?: string | null }>
  recentOrders: Array<{ id: string; vendor: string; total: string; statusLabel: string; createdAt: string }>
  favouriteVendorList: Array<{ vendor: string; count: number }>
}

const CustomerDashboardPage = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get(`/dashboard/customer/summary`)
        setSummary(response.data)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  const buyerName = useMemo(() => summary?.userName || user?.name || 'Guest', [summary?.userName, user?.name])

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background via-brand-surface to-brand-card">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.3),_transparent_55%)] blur-3xl" />
      </div>
      <main className="relative flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300">Customer dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-50">Hi, {buyerName}</h1>
              <p className="mt-1 text-sm text-slate-300">
                Continue your shopping or track your recent orders from local vendors.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/buyer/products"
                className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-white hover:bg-primary-dark"
              >
                Start Shopping
              </Link>
              <Link
                to="/buyer/cart"
                className="rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-slate-100 hover:border-emerald-400"
              >
                View Cart
              </Link>
            </div>
          </header>

          {loading && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 backdrop-blur-xl">
              Loading dashboard…
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur-xl">
              {error}
            </div>
          )}

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <p className="text-xs text-slate-300">Active orders</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{summary?.activeOrders.value ?? 0}</p>
              <p className="mt-1 text-xs text-emerald-300">{summary?.activeOrders.helper ?? 'Nothing active right now'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <p className="text-xs text-slate-300">Last order total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{summary?.lastOrder.value ?? 'Rs. 0'}</p>
              <p className="mt-1 text-xs text-slate-400">{summary?.lastOrder.helper ?? 'No orders yet'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <p className="text-xs text-slate-300">Favourite vendors</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{summary?.favouriteVendors.value ?? 0}</p>
              <p className="mt-1 text-xs text-slate-400">{summary?.favouriteVendors.helper ?? 'Tap vendors to build favorites.'}</p>
            </div>
          </section>

          <section className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-50">Popular near you</h2>
                <Link to="/buyer/products" className="text-xs font-medium text-emerald-300 hover:text-emerald-200">
                  See all
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(summary?.featuredProducts ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                  >
                    <div className="mb-2 h-24 rounded-xl bg-gradient-to-br from-emerald-400/70 via-emerald-500/60 to-accent-blue/60" />
                    <p className="text-sm font-medium text-slate-50">{item.name}</p>
                    <p className="text-xs text-slate-300">{item.vendor} · {item.price}</p>
                    <Link
                      to="/buyer/products"
                      className="mt-2 rounded-xl bg-primary px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-primary-dark"
                    >
                      Add to Cart
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-slate-50">Recent orders</h2>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  {(summary?.recentOrders ?? []).slice(0, 3).map((order) => (
                    <li key={order.id} className="flex items-center justify-between gap-3">
                      <span className="truncate">{order.id} · {order.vendor}</span>
                      <span className="text-emerald-300">{order.statusLabel}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-slate-50 shadow-[0_25px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Cart summary</p>
                <p className="mt-2 text-sm text-slate-100">
                  {summary
                    ? `${summary.cart.itemCount} items · ${summary.cart.subtotal} subtotal`
                    : 'Open your cart to continue checkout.'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Top vendors</p>
                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  {(summary?.favouriteVendorList ?? []).map((vendor) => (
                    <div key={vendor.vendor} className="flex items-center justify-between gap-3">
                      <span className="truncate">{vendor.vendor}</span>
                      <span className="text-slate-400">{vendor.count} orders</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  )
}

export default CustomerDashboardPage



