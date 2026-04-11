import Navbar from '../../components/Navbar'

const CartCheckoutPage = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-supply-deep via-supply-teal/60 to-supply-teal/30">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.3),_transparent_55%)] blur-3xl" />
      </div>
      <Navbar />
      <main className="relative flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-semibold text-slate-50">Your cart</h1>
          <p className="mt-1 text-sm text-slate-300">
            Review your items, choose delivery details and confirm your order. This is all frontend-only.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)]">
            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              {[1, 2].map((id) => (
                <div key={id} className="flex gap-3 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-400/70 via-emerald-500/60 to-accent-blue/60" />
                  <div className="flex flex-1 flex-col justify-between text-sm">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-slate-50">{id === 1 ? 'Tomato' : 'Fresh Milk'}</p>
                        <p className="text-xs text-slate-300">Green Market</p>
                      </div>
                      <p className="font-semibold text-slate-50">{id === 1 ? 'Rs. 180 / kg' : 'Rs. 150 / L'}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                        <button className="h-5 w-5 rounded-full bg-white/10 text-center text-xs text-slate-100">-</button>
                        <span className="text-slate-100">1</span>
                        <button className="h-5 w-5 rounded-full bg-slate-900 text-center text-xs text-white">+</button>
                      </div>
                      <button className="text-slate-400 hover:text-red-400">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </section>

          <section className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-slate-50">Order summary</h2>
                <dl className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>Rs. 510</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Delivery fee</dt>
                    <dd>Rs. 100</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Platform fee</dt>
                    <dd>Rs. 40</dd>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm font-semibold text-slate-50">
                    <dt>Total</dt>
                    <dd>Rs. 650</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-slate-50">Delivery details</h2>
                <div className="mt-2 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-200">Delivery address</label>
                    <select className="mt-1 w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-1.5 text-xs text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2">
                      <option>Home - No. 12, Flower Road, Colombo</option>
                      <option>Office - Rajagiriya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-200">Delivery slot</label>
                    <select className="mt-1 w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-1.5 text-xs text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2">
                      <option>Today, 3.00 pm - 5.00 pm</option>
                      <option>Today, 5.00 pm - 7.00 pm</option>
                      <option>Tomorrow morning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-200">Payment method</label>
                    <select className="mt-1 w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-1.5 text-xs text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2">
                      <option>Cash on Delivery</option>
                      <option>Card (demo only)</option>
                    </select>
                </div>
                </div>

                <button className="mt-4 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                  Place Order (demo)
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CartCheckoutPage



