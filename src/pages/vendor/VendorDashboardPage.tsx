import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSellerDashboardMetrics, getLowStockAlerts } from '../../api/endpoints/dashboard'
import type { SellerDashboardMetrics, LowStockAlertsData } from '../../api/endpoints/dashboard'
import { useAuth } from '../../hooks/useAuth'

const VendorDashboardPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [metrics, setMetrics] = useState<SellerDashboardMetrics | null>(null)
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ Check authentication before loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError("You must be logged in as a seller to view this dashboard")
    }
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    // Skip fetch if not authenticated or auth is still loading
    if (!isAuthenticated || authLoading) {
      return
    }

    const fetchDashboardMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        const [metricsData, alertsData] = await Promise.all([
          getSellerDashboardMetrics(),
          getLowStockAlerts(),
        ])
        setMetrics(metricsData)
        setLowStockAlerts(alertsData)
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err)
        setError('Failed to load dashboard metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardMetrics()
  }, [isAuthenticated, authLoading])

  if (authLoading || loading) {
    return <div className="text-center text-slate-300">Loading...</div>
  }

  if (!isAuthenticated) {
    return <div className="text-center text-red-300">Please login as a seller to view this page</div>
  }

  return (
    <div className="space-y-8 text-slate-100">
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">Vendor dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-supply-paper">
  {metrics?.sellerName ?? "Loading..."}
</h1>
          <p className="mt-1 text-sm text-slate-300">Monitor product health, live deliveries and margin in a single view.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/seller/products"
            className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-white hover:bg-primary-dark"
          >
            Manage Products
          </Link>
          <Link
            to="/seller/orders"
            className="rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-slate-100 hover:border-emerald-400"
          >
            Fulfillment Board
          </Link>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="h-4 w-20 animate-pulse rounded bg-white/20"></div>
              <div className="mt-2 h-8 w-32 animate-pulse rounded bg-white/20"></div>
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/20"></div>
            </div>
          ))}
        </div>
      ) : metrics ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            metrics.ordersToday,
            metrics.revenueToday,
            metrics.activeProducts,
            metrics.fulfillmentSLA,
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs text-slate-300">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-supply-paper">{metric.value}</p>
              <p className="text-xs text-slate-400">{metric.helper}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Live delivery telemetry</h2>
              <p className="text-xs text-slate-400">Track every rider and cold-chain checkpoint</p>
            </div>
            <Link to="/seller/tracking" className="text-xs font-medium text-primary hover:text-primary-light">
              Open map view
            </Link>
          </div>
          <div className="mt-5 rounded-2xl border border-white/5 bg-white/5 px-4 py-8">
            <p className="text-center text-sm text-slate-400">Live tracking data coming soon...</p>
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Low stock alerts</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-300">
            {loading ? (
              [1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/5"
                ></li>
              ))
            ) : lowStockAlerts && lowStockAlerts.alerts.length > 0 ? (
              lowStockAlerts.alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{alert.name}</p>
                    <p className="text-xs text-slate-400">
                      Only {alert.stock} {alert.unit} left (Reorder at {alert.lowStock})
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      alert.stock <= alert.lowStock / 2
                        ? 'text-red-300'
                        : 'text-amber-300'
                    }`}
                  >
                    {alert.stock <= alert.lowStock / 2 ? 'Urgent' : 'Plan restock'}
                  </span>
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-center">
                <p className="text-sm text-slate-400">No low stock alerts</p>
              </li>
            )}
          </ul>
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-slate-400">
            Sync these alerts with shelf labels or automated supplier reorders.
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Recent catalog updates</h2>
              
            </div>
            <Link to="/seller/products" className="text-xs font-medium text-primary hover:text-primary-light">
              View catalog
            </Link>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5"></div>
                ))}
              </div>
            ) : metrics?.recentProducts && metrics.recentProducts.length > 0 ? (
              metrics.recentProducts.map((product) => (
                <div
                  key={product.name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{product.stock}</p>
                    <p className="text-xs text-emerald-300">{product.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <p className="text-sm text-slate-400">No recent products</p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Operational notes</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Team briefing</p>
              <p className="font-semibold text-white">Push leafy greens by noon to hit freshness SLA.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default VendorDashboardPage