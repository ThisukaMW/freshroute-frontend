import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'

const CustomerDashboardPage = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background via-brand-surface to-brand-card">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.3),_transparent_55%)] blur-3xl" />
      </div>
      <Navbar />
      <main className="relative flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300">Customer dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-50">Hi, John</h1>
              <p className="mt-1 text-sm text-slate-300">
                Continue your shopping or track your recent orders from local vendors.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/customer/browse"
                className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-white hover:bg-primary-dark"
              >
                Start Shopping
              </Link>
              <Link
                to="/customer/cart"
                className="rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-slate-100 hover:border-emerald-400"
              >
                View Cart
              </Link>
            </div>
          </header>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <p className="text-xs text-slate-300">Active orders</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">2</p>
              <p className="mt-1 text-xs text-emerald-300">1 arriving today</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <p className="text-xs text-slate-300">Last order total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">Rs. 3,250</p>
              <p className="mt-1 text-xs text-slate-400">Ordered from Green Market</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <p className="text-xs text-slate-300">Favourite vendors</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">4</p>
              <p className="mt-1 text-xs text-slate-400">Tap any vendor to reorder quickly.</p>
            </div>
          </section>

          <section className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-50">Popular near you</h2>
                <Link to="/customer/browse" className="text-xs font-medium text-emerald-300 hover:text-emerald-200">
                  See all
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {['Carrot', 'Tomato', 'Mango', 'Milk', 'Spinach', 'Apple'].map((name) => (
                  <div
                    key={name}
                    className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                  >
                    <div className="mb-2 h-24 rounded-xl bg-gradient-to-br from-emerald-400/70 via-emerald-500/60 to-accent-blue/60" />
                    <p className="text-sm font-medium text-slate-50">{name}</p>
                    <p className="text-xs text-slate-300">Green Market · Rs. 180 / kg</p>
                    <button className="mt-2 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark">
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-slate-50">Recent orders</h2>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center justify-between">
                    <span>Order #1023</span>
                    <span className="text-emerald-300">Delivered</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Order #1024</span>
                    <span className="text-amber-400">On the way</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Order #1025</span>
                    <span className="text-slate-400">Preparing</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-slate-50 shadow-[0_25px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Demo tip</p>
                <p className="mt-2 text-sm text-slate-100">
                  From here, navigate to the browse and cart pages to show the full customer ordering journey.
                </p>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  )
}

export default CustomerDashboardPage



