import { useSelector, useDispatch } from 'react-redux'
import { createSelector } from '@reduxjs/toolkit'
import { useEffect, useState } from 'react'
import type { RootState } from '../../store'
import { setProductStatus } from '../../store/slices/sellerProductsSlice'
import { updateOrderStatus } from '../../store/slices/ordersSlice'

const selectOrders = (state: RootState) => state.orders?.orders ?? []

const selectPendingProducts = createSelector(
  [(state: RootState) => state.sellerProducts?.products ?? []],
  (products) => products.filter((p) => p.status === 'pending'),
)

const formatLbs = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString()

const truckTypeLabel = (type: string | null | undefined) => type ?? '—'

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

const statusStyles: Record<string, string> = {
  Preparing: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
  'On the way': 'border-sky-500/40 bg-sky-500/20 text-sky-300',
  Delivered: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300',
}

const AdminDashboardPage = () => {
  const orders = useSelector(selectOrders)
  const pendingProducts = useSelector(selectPendingProducts)
  const dispatch = useDispatch()

  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [activeVendors, setActiveVendors] = useState<number>(0)

  useEffect(() => {
    fetch('/api/v1/users')
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

  const todaysOrders = orders.length
  const delivered = orders.filter((o: any) => o.status === 'Delivered').length

  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // ── Fleet: fetched from the API ────────────────────────────────────────────
  const [fleet, setFleet] = useState<Truck[]>([])
  const [fleetLoading, setFleetLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/trucks')
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total users', value: totalUsers, helper: 'Buyers + sellers + drivers + field admins' },
          { label: 'Active vendors', value: activeVendors, helper: 'Active seller accounts only' },
          { label: 'Today orders', value: todaysOrders, helper: `${delivered} delivered` },
          { label: 'Revenue today', value: 'Rs. 540,000', helper: 'Platform gross' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs text-slate-300">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-supply-paper">{metric.value}</p>
            <p className="text-xs text-slate-400">{metric.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
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
                  <p className="text-xs text-slate-400">Awaiting seller listing review</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded-full bg-emerald-500/15 px-3 py-1 font-medium text-emerald-300 hover:bg-emerald-500/25"
                    onClick={() => dispatch(setProductStatus({ id: p.id, status: 'active' }))}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-full bg-red-500/10 px-3 py-1 font-medium text-red-300 hover:bg-red-500/20"
                    onClick={() => dispatch(setProductStatus({ id: p.id, status: 'rejected' }))}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Recent orders</h2>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto text-xs">
            <table className="min-w-full text-left text-slate-100">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Order</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-[11px] text-slate-400">
                      No orders yet. Complete a buyer checkout to see live orders here.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-white/5 transition">
                      <td className="px-3 py-2 text-slate-300">{o.id}</td>
                      <td className="px-3 py-2 font-medium text-white">{o.customerName}</td>
                      <td className="px-3 py-2">Rs. {(o.total ?? 0).toLocaleString('en-LK')}</td>
                      <td className="px-3 py-2 text-slate-400">
                        {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={o.status}
                          onChange={(e) => dispatch(updateOrderStatus({ id: o.id, status: e.target.value }))}
                          className={`rounded-full border px-2 py-0.5 text-[11px] outline-none ${statusStyles[o.status] ?? 'border-white/10 bg-white/5 text-slate-100'}`}
                        >
                          <option>Preparing</option>
                          <option>On the way</option>
                          <option>Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

                {/* <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Delivery efficiency</p>
                    <p className="text-2xl font-semibold text-white">{truck.efficiency}%</p>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${truck.efficiency}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Load balance</p>
                    <div className="mt-2 flex items-center justify-between text-white">
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{truck.loadBalance.left}%</p>
                        <p className="text-[11px] text-slate-400">Left side</p>
                      </div>
                      <div className="h-12 w-px bg-white/10" />
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{truck.loadBalance.right}%</p>
                        <p className="text-[11px] text-slate-400">Right side</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">Tilt risk: {truck.tiltRisk}</p>
                  </div>
                </div> */}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminDashboardPage