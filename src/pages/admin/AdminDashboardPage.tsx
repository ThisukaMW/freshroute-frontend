import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

const formatLbs = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString()

type PendingProduct = {
  id: string
  name: string
  category?: string | null
  price?: number | null
  unit?: string | null
  createdAt: string
  seller?: { user?: { name?: string | null } | null } | null
}

type Truck = {
  id: string
  operator?: string | null
  departure?: string | null
  arrival?: string | null
  route?: string | null
  vehicleNumber?: string | null
  vehicleType?: string | null
  type?: string | null
  capacityLbs?: number | null
  loadedLbs?: number | null
  palletsLoaded?: number | null
  palletsCap?: number | null
  cratesLoaded?: number | null
  boxesLoaded?: number | null
  temperature?: string | null
  maxWeight?: number | null
  maxVolume?: number | null
  maxStops?: number | null
  currentLoadWeight?: number | null
  currentLoadVolume?: number | null
  currentLoadStops?: number | null
  storageSupport?: string | null
  isActive?: boolean | null
  isAvailable?: boolean | null
  fuelNeeded?: string | null
  efficiency?: number | null
  avgDelay?: string | null
  loadBalance?: { left: number; right: number } | null
  tiltRisk?: string | null
}

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { token } = useAuthContext()

  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [activeVendors, setActiveVendors] = useState<number>(0)
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users')
        return res.json()
      })
      .then((users: Array<{ role: string; status: string }>) => {
        setTotalUsers(users.filter((user) => user.role !== 'ADMIN').length)
        setActiveVendors(
          users.filter((user) => user.role === 'SELLER' && user.status === 'ACTIVE').length
        )
      })
      .catch((error) => {
        console.error('Failed to load admin counts:', error)
      })
  }, [])

  useEffect(() => {
    if (!token) {
      setPendingProducts([])
      return
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/v1/products/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch pending products')
        return res.json()
      })
      .then((data: PendingProduct[] | { data?: PendingProduct[] }) => {
        const products = Array.isArray(data) ? data : data.data ?? []
        setPendingProducts(
          products
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6),
        )
      })
      .catch((error) => console.error('Failed to load pending products:', error))
  }, [token])

  // ── Fleet: fetched from the API ────────────────────────────────────────────
  const [fleet, setFleet] = useState<Truck[]>([])
  const [fleetLoading, setFleetLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/trucks`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch fleet')
        return res.json()
      })
      .then((trucks: Truck[]) => setFleet(trucks))
      .catch((err) => console.error('Fleet fetch error:', err))
      .finally(() => setFleetLoading(false))
  }, [])

  const fleetWithMetrics = fleet.map((truck) => {
    const capacityLbs = truck.capacityLbs ?? truck.maxWeight ?? 0
    const loadedLbs = Math.min(
      capacityLbs,
      truck.loadedLbs ?? truck.currentLoadWeight ?? 0
    )
    const fillPercent = capacityLbs ? Math.round((loadedLbs / capacityLbs) * 100) : 0
    const freeSpacePercent = Math.max(0, 100 - fillPercent)
    const temperature =
      truck.temperature ??
      (truck.storageSupport === "COLD" ? "2°C" : "Ambient")
    const route = truck.route ?? truck.vehicleNumber ?? truck.id
    const vehicleType = truck.vehicleType ?? truck.type
    return {
      ...truck,
      capacityLbs,
      loadedLbs,
      fillPercent,
      freeSpacePercent,
      temperature,
      route,
      vehicleType,
    }
  })

  return (
    <div className="space-y-8 text-slate-100">
      <header className="rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Platform overview</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { label: 'Total users', value: totalUsers, helper: 'Buyers + sellers + drivers + field admins' },
          { label: 'Active vendors', value: activeVendors, helper: 'Active seller accounts only' },
          { label: 'Revenue today', value: 'Rs. 540,000', helper: 'Platform gross' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs text-slate-300">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-supply-paper">{metric.value}</p>
            <p className="text-xs text-slate-400">{metric.helper}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="w-full rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Pending product approvals</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {pendingProducts.length === 0 && (
              <p className="text-xs text-slate-500">No pending products right now.</p>
            )}
            {pendingProducts.map((p: any) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-slate-400">
                    {p.seller?.user?.name ?? 'Seller'} · Awaiting review
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    className="rounded-full bg-violet-500/15 px-3 py-1 font-medium text-violet-300 hover:bg-violet-500/25"
                    onClick={() => navigate('/admin/approvals?tab=products')}
                  >
                    Review product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/70 via-supply-teal/10 to-slate-950/60 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Fleet capacity</p>
            <h2 className="text-xl font-semibold text-white">Truck load planner</h2>
          </div>
        </div>

        {fleetLoading ? (
          <div className="px-6 py-10 text-center text-xs text-slate-500">Loading fleet…</div>
        ) : fleetWithMetrics.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-slate-400">
            <p className="text-sm font-medium text-white">No trucks in manifest</p>
            <p className="mt-1 text-xs">Add trucks from the Truck capacity planner to see them here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {fleetWithMetrics.map((truck) => (
              <div
                key={truck.id}
                className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 backdrop-blur"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{truck.operator}</p>
                    <p className="text-lg font-semibold text-white">{truck.route}</p>
                    
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="rounded-xl border border-white/10 px-3 py-1 text-center">
                      <p className="text-slate-400">Capacity</p>
                      <p className="text-base font-semibold text-white">
                        {formatLbs(truck.loadedLbs)} / {formatLbs(truck.capacityLbs)} lbs
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 px-3 py-1 text-center">
                      <p className="text-slate-400">Free space</p>
                      <p className="text-base font-semibold text-white">{truck.freeSpacePercent}%</p>
                    </div>
                    <div className="rounded-xl border border-white/10 px-3 py-1 text-center">
                      <p className="text-slate-400">Temperature</p>
                      <p className="text-base font-semibold text-white">{truck.temperature ?? '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Weight utilization</p>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary via-supply-peach to-supply-orange transition-all duration-500"
                      style={{ width: `${truck.fillPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{truck.fillPercent}% filled</span>
                    <span>{Math.max(0, truck.capacityLbs - truck.loadedLbs)} lbs available</span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { label: 'Pallets', value: `${truck.palletsLoaded}/${truck.palletsCap}` },
                    // { label: 'Crates', value: truck.cratesLoaded },
                    // { label: 'Boxes', value: truck.boxesLoaded },
                    {
                      label: 'Reefer',
                      value: (() => {
                        const type = truck.type?.toLowerCase() ?? ''
                        return type.includes('refrigerat') || type.includes('reefer')
                          ? (truck.temperature ?? '—')
                          : '—'
                      })(),
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-center">
                      <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminDashboardPage