import { useSelector, useDispatch } from 'react-redux'
import { updateOrderStatus } from '../../store/slices/ordersSlice'
import { updateProduct } from '../../store/slices/sellerProductsSlice'

const liveFleet = [
  { route: 'Western Cluster · Route 05', eta: '12 min', status: 'On the way', orders: 8 },
  { route: 'North suburbs · Route 02', eta: '34 min', status: 'Delayed', orders: 5 },
  { route: 'City core · Route 07', eta: 'In hub', status: 'Loading', orders: 11 },
]

const truckCapacity = [
  {
    id: 'NP1234789',
    name: 'Greenleaf',
    route: 'Colombo ➝ Kandy',
    type: 'Refrigerated van',
    departure: 'Jun 12 · 09:30',
    arrival: 'Jun 12 · 14:30',
    capacityLbs: 55000,
    loadedLbs: 44220,
    palletsLoaded: 24,
    palletsCap: 30,
    cratesLoaded: 17,
    boxesLoaded: 8,
    reeferUnits: 1,
    temperature: '4°C',
    freeSpace: 24,
    efficiency: '94%',
    loadBalance: { left: 52, right: 48 },
    tiltRisk: 'Low',
  },
  {
    id: 'NP9088771',
    name: 'Summit Fresh',
    route: 'Kandy ➝ Galle',
    type: 'Dry cargo',
    departure: 'Jun 13 · 07:10',
    arrival: 'Jun 13 · 15:45',
    capacityLbs: 47000,
    loadedLbs: 31500,
    palletsLoaded: 18,
    palletsCap: 28,
    cratesLoaded: 12,
    boxesLoaded: 10,
    reeferUnits: 0,
    temperature: 'Ambient',
    freeSpace: 33,
    efficiency: '88%',
    loadBalance: { left: 47, right: 53 },
    tiltRisk: 'Medium',
  },
]

const AdminDashboardPage = () => {
  const orders = useSelector((state: any) => state.orders.orders)
  const pendingProducts = useSelector((state: any) =>
    state.sellerProducts.products.filter((p: any) => p.status === 'pending')
  )
  const dispatch = useDispatch()

  const todaysOrders = orders.length
  const delivered = orders.filter((o: any) => o.status === 'Delivered').length

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
                    onClick={() =>
                      dispatch(
                        updateProduct({
                          id: p.id,
                          changes: { status: 'active' },
                        })
                      )
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-full bg-red-500/10 px-3 py-1 font-medium text-red-300 hover:bg-red-500/20"
                    onClick={() =>
                      dispatch(
                        updateProduct({
                          id: p.id,
                          changes: { status: 'rejected' },
                        })
                      )
                    }
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
              <p className="text-xs text-slate-400">Update fulfillment states directly from HQ</p>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto text-xs">
            <table className="min-w-full text-left text-slate-100">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Order</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Vendor</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-[11px] text-slate-400">
                      No orders yet. Complete a buyer checkout to see live orders here.
                    </td>
                  </tr>
                )}
                {orders.slice(0, 5).map((o: any) => (
                  <tr key={o.id}>
                    <td className="px-3 py-2">{o.id}</td>
                    <td className="px-3 py-2">{o.customerName}</td>
                    <td className="px-3 py-2">Demo vendor</td>
                    <td className="px-3 py-2">Rs. {o.total.toLocaleString('en-LK')}</td>
                    <td className="px-3 py-2">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          dispatch(
                            updateOrderStatus({
                              id: o.id,
                              status: e.target.value,
                            })
                          )
                        }
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-100 outline-none"
                      >
                        <option>Preparing</option>
                        <option>On the way</option>
                        <option>Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-supply-teal/30 p-5">
          <h2 className="text-base font-semibold text-white">Live route insights</h2>
          <p className="text-xs text-slate-400">Pair this with the map during your walkthrough</p>
          <div className="mt-4 space-y-3 text-sm">
            {liveFleet.map((fleet) => (
              <div
                key={fleet.route}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{fleet.route}</p>
                  <p className="text-xs text-slate-400">{fleet.orders} orders · ETA {fleet.eta}</p>
                </div>
                <span
                  className={`text-xs ${
                    fleet.status === 'Delayed' ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  {fleet.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-300">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-peach">narration</p>
          <p className="mt-2 text-slate-100">
            Use these widgets to describe how admins balance marketplace liquidity, audit product quality and unlock
            payouts without a backend.
          </p>
          <div className="mt-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Next actions</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Approve 3 seller products before nightly sync.</li>
              <li>Escalate Route 02 delay to operations.</li>
              <li>Export weekly payout report.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/70 via-supply-teal/10 to-slate-950/60 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Fleet capacity</p>
            <h2 className="text-xl font-semibold text-white">Truck load planner</h2>
            <p className="text-xs text-slate-400">
              Show how admins audit filled vs free space, add consignments, and plan rest stops for every truck.
            </p>
          </div>
          {/* <div className="flex gap-2 text-xs">
            <button className="rounded-xl border border-white/20 px-4 py-2 text-slate-100 hover:border-emerald-400">
              Export manifest
            </button>
            <button className="rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark">
              + Add truck
            </button>
          </div> */}
        </div>

        <div className="grid gap-4">
          {truckCapacity.map((truck) => {
            const fillPercent = Math.round((truck.loadedLbs / truck.capacityLbs) * 100)
            return (
              <div
                key={truck.id}
                className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 backdrop-blur"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{truck.name}</p>
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
                      <p className="text-base font-semibold text-white">{truck.freeSpace}%</p>
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
                      className="h-2 rounded-full bg-gradient-to-r from-primary via-supply-peach to-supply-orange"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{fillPercent}% filled</span>
                    <span>{truck.capacityLbs - truck.loadedLbs} lbs available</span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { label: 'Pallets', value: `${truck.palletsLoaded}/${truck.palletsCap}` },
                    { label: 'Crates', value: truck.cratesLoaded },
                    { label: 'Boxes', value: truck.boxesLoaded },
                    { label: 'Reefer', value: truck.reeferUnits || '—' },
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
                    <p className="text-2xl font-semibold text-white">{truck.efficiency}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: truck.efficiency }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">On-time probability restates the hero shot.</p>
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

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                    <p className="text-slate-400">Add or remove pallets to immediately see free space.</p>
                  </div>
                  {/* <button className="rounded-full border border-white/20 px-4 py-1 font-semibold text-white hover:border-primary/60">
                    Manage cargo
                  </button> */}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage



