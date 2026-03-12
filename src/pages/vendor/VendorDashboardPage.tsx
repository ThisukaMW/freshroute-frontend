import { Link } from 'react-router-dom'

const orderTelemetry = [
  {
    id: '#FR-1042',
    customer: 'Isuru Perera',
    route: 'Colombo 05',
    status: 'On the way',
    stage: 68,
    temperature: '4°C',
  },
  {
    id: '#FR-1038',
    customer: 'Aruni Jayasena',
    route: 'Rajagiriya',
    status: 'Packing',
    stage: 35,
    temperature: 'Chiller · 2°C',
  },
  {
    id: '#FR-1035',
    customer: 'Demo Cafe',
    route: 'Colombo 02',
    status: 'Delivered',
    stage: 100,
    temperature: 'Handed over',
  },
]

const recentProducts = [
  { name: 'Heirloom Tomato Crate', price: 'Rs. 450 / kg', stock: '18 kg', status: 'Low stock' },
  { name: 'Kale Bunch', price: 'Rs. 320 / bunch', stock: '42 bunches', status: 'Healthy' },
  { name: 'Organic Bananas', price: 'Rs. 280 / kg', stock: '30 kg', status: 'New arrival' },
]

const VendorDashboardPage = () => {
  return (
    <div className="space-y-8 text-slate-100">
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">Vendor dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Green Market</h1>
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Orders today', value: '18', helper: '+4 vs yesterday' },
          { label: 'Revenue today', value: 'Rs. 32,500', helper: 'Payout next week' },
          { label: 'Active products', value: '42', helper: '4 low in stock' },
          { label: 'Fulfillment SLA', value: '94%', helper: 'Last 24 hours' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs text-slate-300">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-supply-paper">{metric.value}</p>
            <p className="text-xs text-slate-400">{metric.helper}</p>
          </div>
        ))}
      </section>

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
          <div className="mt-5 space-y-4 text-sm">
            {orderTelemetry.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{order.id}</p>
                    <p className="text-xs text-slate-400">{order.customer} · {order.route}</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-xs text-emerald-300">
                    {order.status}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                    style={{ width: `${order.stage}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <p>Cold chain: {order.temperature}</p>
                  <p>{order.stage === 100 ? 'Delivered' : `Progress ${order.stage}%`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Low stock alerts</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-300">
            {[
              { item: 'Tomato', detail: 'Only 6 kg left', priority: 'Urgent' },
              { item: 'Red Apple', detail: 'Only 4 kg left', priority: 'Urgent' },
              { item: 'Spinach', detail: '18 bunches available', priority: 'Plan restock' },
            ].map((alert) => (
              <li
                key={alert.item}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{alert.item}</p>
                  <p className="text-xs text-slate-400">{alert.detail}</p>
                </div>
                <span className="text-xs text-amber-300">{alert.priority}</span>
              </li>
            ))}
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
              <p className="text-xs text-slate-400">Highlight fresh SKUs during demos</p>
            </div>
            <Link to="/seller/products" className="text-xs font-medium text-primary hover:text-primary-light">
              View catalog
            </Link>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {recentProducts.map((product) => (
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
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h2 className="text-base font-semibold text-white">Operational notes</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Team briefing</p>
              <p className="font-semibold text-white">Push leafy greens by noon to hit freshness SLA.</p>
            </div>
            {/* <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Demo tip</p>
              <p className="font-semibold text-white">
                Use this card to explain how vendors monitor profitability & live inventory without a backend.
              </p>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  )
}

export default VendorDashboardPage