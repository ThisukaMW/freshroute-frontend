import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { updateProduct } from '../../store/slices/sellerProductsSlice'
import { updateOrderStatus } from '../../store/slices/ordersSlice'

type Truck = {
  id: string
  operator: string
  departure: string
  arrival: string
  route: string
  type: string
  capacityLbs: number
  loadedLbs: number
  palletsLoaded: number
  palletsCap: number
  cratesLoaded: number
  boxesLoaded: number
  temperature: string
  fuelNeeded: string
  efficiency: number
  avgDelay: string
  loadBalance: { left: number; right: number }
  tiltRisk: string
}

const PER_PALLET_WEIGHT = 1800

function readFleet(): Truck[] {
  try {
    const raw = localStorage.getItem('fleet')
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const statusStyles: Record<string, string> = {
  Preparing: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
  'On the way': 'border-sky-500/40 bg-sky-500/20 text-sky-300',
  Delivered: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300',
}

const AdminDashboardPage = () => {
  const orders = useSelector((state: any) => state.orders.orders)
  const pendingProducts = useSelector((state: any) =>
    state.sellerProducts.products.filter((p: any) => p.status === 'pending')
  )
  const dispatch = useDispatch()

  const todaysOrders = orders.length
  const delivered = orders.filter((o: any) => o.status === 'Delivered').length

  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const [fleet, setFleet] = useState<Truck[]>([])

  useEffect(() => {
    setFleet(readFleet())
    const onStorage = (ev: StorageEvent) => { if (ev.key === 'fleet') setFleet(readFleet()) }
    const onFocus = () => setFleet(readFleet())
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const fleetWithMetrics = fleet.map((truck) => {
    const loadedLbs = Math.min(truck.capacityLbs, truck.palletsLoaded * PER_PALLET_WEIGHT)
    const fillPercent = truck.capacityLbs ? Math.round((loadedLbs / truck.capacityLbs) * 100) : 0
    const freeSpacePercent = Math.max(0, 100 - fillPercent)
    return { ...truck, loadedLbs, fillPercent, freeSpacePercent }
  })

  return (
    <div className="space-y-8 text-slate-100">
      <header className="rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Platform overview</h1>
        <p className="mt-1 text-sm text-slate-300">Monitor users, fulfillment and approvals across FreshRoute.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total users', value: '1,250', helper: 'Customers + vendors' },
          { label: 'Vendors live', value: '45', helper: '5 pending approval' },
          { label: 'Orders today', value: todaysOrders, helper: `${delivered} delivered` },
          { label: 'Revenue today', value: 'Rs. 540,000', helper: 'Platform gross' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs text-slate-300">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-supply-paper">{metric.value}</p>
            <p className="text-xs text-slate-400">{metric.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Pending product approvals</h2>
          <p className="text-xs text-slate-400">Approve or reject seller submissions before they reach buyers.</p>
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
                    {p.category} · Rs. {p.pricePerUnit} / {p.unit}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded-full bg-emerald-500/15 px-3 py-1 font-medium text-emerald-300 hover:bg-emerald-500/25"
                    onClick={() => dispatch(updateProduct({ id: p.id, changes: { status: 'active' } }))}
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-full bg-red-500/10 px-3 py-1 font-medium text-red-300 hover:bg-red-500/20"
                    onClick={() => dispatch(updateProduct({ id: p.id, changes: { status: 'rejected' } }))}
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
              <p className="text-xs text-slate-400">5 most recent · Update fulfillment states directly from HQ</p>
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
                      <td className="px-3 py-2">Rs. {o.total.toLocaleString('en-LK')}</td>
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
            <p className="text-xs text-slate-400">
              Live data from the truck capacity planner. Add or adjust trucks there to see updates here.
            </p>
          </div>
        </div>

        {fleetWithMetrics.length === 0 ? (
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
                    <p className="text-xs text-slate-400">
                      {truck.departure} · Arrival {truck.arrival} · {truck.type}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="rounded-xl border border-white/10 px-3 py-1 text-center">
                      <p className="text-slate-400">Capacity</p>
                      <p className="text-base font-semibold text-white">
                        {truck.loadedLbs.toLocaleString()} / {truck.capacityLbs.toLocaleString()} lbs
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 px-3 py-1 text-center">
                      <p className="text-slate-400">Free space</p>
                      <p className="text-base font-semibold text-white">{truck.freeSpacePercent}%</p>
                    </div>
                    <div className="rounded-xl border border-white/10 px-3 py-1 text-center">
                      <p className="text-slate-400">Temperature</p>
                      <p className="text-base font-semibold text-white">{truck.temperature}</p>
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
                    <span>{truck.capacityLbs - truck.loadedLbs} lbs available</span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { label: 'Pallets', value: `${truck.palletsLoaded}/${truck.palletsCap}` },
                    { label: 'Crates', value: truck.cratesLoaded },
                    { label: 'Boxes', value: truck.boxesLoaded },
                    {
                      label: 'Reefer',
                      value:
                        truck.type.toLowerCase().includes('refrigerat') || truck.type.toLowerCase().includes('reefer')
                          ? truck.temperature
                          : '—',
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-center">
                      <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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