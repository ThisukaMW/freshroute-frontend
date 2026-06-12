// LandingPage.tsx
import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'

// ─── Utility hooks ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, trigger])
  return count
}

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, inView }
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView()
  const count = useCountUp(value, 2000, inView)
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 text-center">
      <p className="text-4xl font-bold text-slate-50 md:text-5xl">
        {count.toLocaleString()}<span className="text-supply-teal">{suffix}</span>
      </p>
      <p className="text-xs tracking-widest text-slate-300 uppercase">{label}</p>
    </div>
  )
}

// ─── Hero slideshow ───────────────────────────────────────────────────────────

const slides = [
  { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80', tag: 'Farm Fresh',    headline: 'Straight from the\nfields to your door',          sub: 'Upcountry vegetables handpicked each morning and delivered by noon.' },
  { url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80', tag: 'Local Vendors', headline: "Supporting Sri Lanka's\nfarming community",       sub: 'Over 30 verified local sellers — no middlemen, transparent pricing.' },
  { url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1600&q=80', tag: 'Fast Delivery', headline: '32-minute average\ndelivery city-wide',           sub: 'Real-time tracking from dispatch to doorstep, every single order.' },
  { url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1600&q=80', tag: 'Fresh Produce', headline: 'Vegetables, fruits,\nherbs — all in one place', sub: 'Browse, compare, order, and track — the whole supply chain, simplified.' },
]

const NAVBAR_HEIGHT = 64

function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  useEffect(() => {
    const id = setInterval(() => {
      setPrev(current)
      setCurrent(c => (c + 1) % slides.length)
      setTimeout(() => setPrev(null), 700)
    }, 2000)
    return () => clearInterval(id)
  }, [current])
  return (
    <div className="relative w-full overflow-hidden" style={{ height: `calc(100dvh - ${NAVBAR_HEIGHT}px)` }}>
      {slides.map((slide, i) => {
        const isCurrent = i === current, isPrev = i === prev
        if (!isCurrent && !isPrev) return null
        const style: React.CSSProperties = isCurrent
          ? { animation: 'slideInRight 0.7s cubic-bezier(0.22,1,0.36,1) forwards', zIndex: 2 }
          : { transform: 'translateX(0)', zIndex: 1 }
        return (
          <div key={i} className="absolute inset-0" style={style}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.url})` }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(4,18,26,.35) 0%,rgba(4,18,26,.15) 40%,rgba(4,18,26,.8) 100%)' }} />
            <div className="absolute inset-0 flex flex-col justify-end px-8 pb-16 md:px-20 md:pb-20">
              <span className="mb-3 inline-block w-fit rounded-full border border-supply-teal/60 bg-supply-teal/20 px-4 py-1 text-[11px] font-bold uppercase tracking-[.35em] text-supply-teal backdrop-blur-sm">{slide.tag}</span>
              <h1 className="whitespace-pre-line text-4xl font-black leading-tight text-white md:text-6xl lg:text-7xl" style={{ textShadow: '0 2px 20px rgba(0,0,0,.4)' }}>{slide.headline}</h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-200 md:text-base" style={{ textShadow: '0 1px 8px rgba(0,0,0,.5)' }}>{slide.sub}</p>
            </div>
          </div>
        )
      })}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <span key={i} className="block h-[3px] rounded-full transition-all duration-500"
            style={{ width: i === current ? 32 : 10, background: i === current ? '#fff' : 'rgba(255,255,255,.35)' }} />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 z-10 h-[3px] w-full bg-white/10">
        <div key={current} className="h-full bg-supply-teal" style={{ animation: 'progressBar 2s linear forwards' }} />
      </div>
      <style>{`
        @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes progressBar  { from{width:0%} to{width:100%} }
      `}</style>
    </div>
  )
}

// ─── Landing page ─────────────────────────────────────────────────────────────

const LandingPage = (): JSX.Element => {

  const services = [
    { title: 'Farm-Fresh Vegetables', desc: 'Direct from upcountry farms to your door. Handpicked each morning, delivered by noon.',       tag: 'Most ordered' },
    { title: 'Tropical Fruits',       desc: 'Seasonal mangoes, papayas, pineapples and more — sourced from certified local growers.',      tag: 'In season'    },
    { title: 'Herbs & Spices',        desc: 'Fresh curry leaves, lemongrass, pandan and a full spice range from hill-country suppliers.',  tag: 'New arrivals' },
    { title: 'Organic Range',         desc: 'Pesticide-free, verified organic produce from our certified vendor network.',                 tag: 'Certified'    },
    { title: 'Root Vegetables',       desc: 'Potatoes, carrots, beetroot, and more — bulk or per-unit pricing from multiple vendors.',     tag: 'Best value'   },
  ]

  const partners = ['Peiris Farm', 'Green Valley', 'Kandy Farms', 'Coastal Co-op', 'Uva Organics', 'Matale Growers', 'Ceylon Herbs', 'Lanka Fresh']

  const location = useLocation()
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }, [location])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-background via-supply-teal/60 to-brand-background text-supply-ash">

      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar variant="public" />
      </div>

      <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <main className="relative flex-1 overflow-hidden">

          {/* ══════════════════════════════════════════════════════════════════
              HERO — real truck photo baked into the section background
          ══════════════════════════════════════════════════════════════════ */}
          <section className="relative flex min-h-screen w-full justify-center overflow-hidden px-4 py-12 md:py-20">

            {/* 1 — base dark colour so slow networks don't flash white */}
            <div className="absolute inset-0 bg-[#04121a]" />

            {/* 2 — verified freight truck highway photo (two semi-trucks on highway, Unsplash free) */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1766785368863-f2188a8c8b32?w=1920&q=80)',
                backgroundPosition: 'center 60%',
              }}
            />

            {/* 3 — dark cinematic overlay: heavier on the left (text area), lighter on the right */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(4,18,26,0.97) 0%, rgba(4,18,26,0.92) 40%, rgba(4,18,26,0.78) 65%, rgba(4,18,26,0.60) 100%)',
              }}
            />

            {/* 4 — top and bottom vignette so it blends with the navbar and next section */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(4,18,26,0.65) 0%, transparent 18%, transparent 82%, rgba(4,18,26,0.80) 100%)',
              }}
            />

            {/* 5 — very subtle teal tint to pull the photo into brand colours */}
            <div className="absolute inset-0 bg-supply-teal/[0.04]" />

            {/* 6 — dot grid (kept light so the truck photo shows through) */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.10]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(45,212,191,0.55) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* 7 — left-side soft teal glow accent */}
            <div className="pointer-events-none absolute -left-40 top-20 h-[460px] w-[460px] rounded-full bg-supply-teal/10 blur-3xl" />

            {/* ── Content ── */}
            <div className="relative flex w-full max-w-6xl flex-col gap-10 md:flex-row md:items-center">

              {/* Left column — brand text */}
              <div
                className="flex-1 space-y-6"
                style={{ animation: 'frSlideIn 0.9s cubic-bezier(0.22,1,0.36,1) both' }}
              >
                {/* Live badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-supply-teal/25 bg-supply-teal/10 px-4 py-1.5 backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-supply-teal opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-supply-teal" />
                  </span>
                  <p className="text-xs font-medium uppercase tracking-[.25em] text-supply-teal">
                    Fresh from local markets
                  </p>
                </div>

                {/* Brand name */}
                <div>
                  <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-slate-50 md:text-7xl">
                    Fresh
                    <span
                      className="block text-supply-teal"
                      style={{ textShadow: '0 0 40px rgba(45,212,191,0.25)' }}
                    >
                      Route
                    </span>
                  </h1>
                  <p className="mt-3 text-lg font-light uppercase tracking-[.15em] text-slate-300 md:text-xl">
                    Transport &amp; Logistics Platform
                  </p>
                </div>

                {/* Tagline */}
                <p className="max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
                  Discover trusted local vendors, compare prices in real time, and get fresh fruits,
                  vegetables, and essentials delivered to your doorstep — no middlemen, transparent
                  pricing, powered by FreshRoute.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/signup/customer"
                    className="rounded-full bg-primary-dark px-6 py-2.5 text-sm font-semibold text-supply-paper shadow-lg shadow-supply-teal/10 transition-all hover:bg-primary-dark/80 hover:shadow-supply-teal/25"
                  >
                    Start Ordering
                  </Link>
                  <Link
                    to="/signup/vendor"
                    className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition hover:bg-white/10"
                  >
                    Become a Vendor
                  </Link>
                  <a
                    href="#how-it-works"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-200"
                  >
                    How it works <span className="text-supply-teal">↓</span>
                  </a>
                </div>

                {/* Quick-fact grid */}
                <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 backdrop-blur-sm sm:grid-cols-3">
                  {[
                    { h: '30+ local vendors', b: 'Compare prices across your city.'  },
                    { h: 'Same-day delivery', b: 'Order before 5 pm, get it today.' },
                    { h: 'Quality checked',   b: 'Vendors verified by FreshRoute.'  },
                  ].map((item, idx) => (
                    <div
                      key={item.h}
                      className={idx > 0 ? 'border-l border-supply-teal/20 pl-3' : ''}
                    >
                      <p className="text-xs font-semibold text-supply-paper">{item.h}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{item.b}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column — glass stat card */}
              <div
                className="flex-1"
                style={{ animation: 'frSlideIn 1.1s cubic-bezier(0.22,1,0.36,1) both' }}
              >
                <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-black/30 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl ring-1 ring-inset ring-white/5">

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Today's picks */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-supply-peach">
                        Today&apos;s picks
                      </p>
                      <p className="mt-1.5 text-lg font-semibold text-supply-paper">Fresh veggies</p>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                        Handpicked from local markets each morning.
                      </p>
                    </div>

                    {/* Metric column */}
                    <div className="flex flex-col gap-3">
                      <div className="rounded-2xl border border-supply-teal/30 bg-gradient-to-br from-supply-teal/25 to-supply-teal/8 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-supply-teal/80">
                          Avg. delivery
                        </p>
                        <p className="text-xl font-bold text-slate-50">
                          32 <span className="text-sm font-normal text-slate-300">min</span>
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-supply-peach/80">
                          On-time rate
                        </p>
                        <p className="text-xl font-bold text-supply-peach">
                          96<span className="text-sm font-normal">%</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['30+ verified vendors', '96% on-time delivery', '12,000+ customers', 'Same-day delivery'].map(t => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-300 backdrop-blur-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Logistics metrics row */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/8 pt-4">
                    {[
                      { v: '5',   u: 'cities',   l: 'Coverage'    },
                      { v: '24h', u: '',          l: 'Fleet active' },
                      { v: '99', u: '%',          l: 'Uptime'      },
                    ].map(m => (
                      <div key={m.l} className="text-center">
                        <p className="text-sm font-bold text-slate-50">
                          {m.v}<span className="text-[10px] font-normal text-slate-400">{m.u}</span>
                        </p>
                        <p className="text-[9px] uppercase tracking-[.15em] text-slate-500">{m.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ── CAROUSEL ── */}
          <section style={{ height: `calc(100dvh - ${NAVBAR_HEIGHT}px)` }}>
            <HeroSlideshow />
          </section>

          {/* ── STATS BAR ── */}
          <section className="relative w-full bg-gradient-to-br from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-16">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-24 bg-supply-teal/40" />
            <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 md:grid-cols-5">
              <StatCounter value={30}   suffix="+"       label="Local vendors"    />
              <StatCounter value={96}   suffix="%"       label="On-time delivery" />
              <StatCounter value={32}   suffix=" min"    label="Avg. delivery"    />
              <StatCounter value={1200} suffix="+"       label="Happy customers"  />
              <StatCounter value={5}    suffix=" cities" label="Across Sri Lanka" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-24 bg-supply-teal/40" />
          </section>

          {/* ── SERVICES ── */}
          <section className="relative w-full bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-16 md:py-20">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.35em] text-supply-peach">What we deliver</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">Our produce range</h2>
                </div>
                <Link to="/products" className="hidden text-xs font-semibold text-primary-light hover:text-supply-peach md:block">
                  Browse all →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {[
                  { ...services[0], img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80' },
                  { ...services[1], img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80' },
                  { ...services[2], img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80' },
                  { ...services[3], img: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&q=80' },
                  { ...services[4], img: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&q=80' },
                ].map(s => (
                  <div key={s.title} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-supply-teal/40 hover:shadow-lg hover:shadow-supply-teal/5">
                    <img src={s.img} alt={s.title} className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider
                        ${s.tag === 'Most ordered' ? 'border border-supply-teal/30  bg-supply-teal/20   text-supply-teal' : ''}
                        ${s.tag === 'In season'    ? 'border border-supply-peach/20 bg-supply-peach/10  text-supply-peach' : ''}
                        ${s.tag === 'New arrivals' ? 'border border-emerald-500/20  bg-emerald-500/10   text-emerald-400' : ''}
                        ${s.tag === 'Certified'    ? 'border border-emerald-500/20  bg-emerald-500/10   text-emerald-400' : ''}
                        ${s.tag === 'Best value'   ? 'border border-amber-500/20    bg-amber-500/10     text-amber-400'   : ''}
                      `}>{s.tag}</span>
                      <h3 className="text-sm font-bold text-slate-50">{s.title}</h3>
                      <p className="text-xs leading-relaxed text-slate-400">{s.desc}</p>
                      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
                        <Link to="/products" className="text-[11px] font-semibold text-supply-teal group-hover:underline">Browse →</Link>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
                          <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PARTNER STRIP ── */}
          <section className="w-full overflow-hidden border-y border-white/10 bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 py-6">
            <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[.4em] text-slate-400">
              Trusted vendor partners
            </p>
            <div className="flex gap-8 whitespace-nowrap px-8" style={{ animation: 'marquee 20s linear infinite' }}>
              {[...partners, ...partners].map((p, i) => (
                <span key={i} className="inline-block rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-slate-300">{p}</span>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how-it-works" className="relative w-full bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-12 md:py-16">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-12 text-center">
                <p className="text-xs font-semibold uppercase tracking-[.35em] text-supply-peach">Simple process</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-50 md:text-2xl">How FreshRoute works</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
                  From browse to doorstep in three easy steps — no phone calls, no haggling.
                </p>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {[
                  { n: '01', title: 'Browse nearby vendors', desc: 'Search by category or vendor and see live pricing from multiple markets side-by-side.', icon: '🔍' },
                  { n: '02', title: 'Place your order',      desc: 'Add items to cart, choose your address and delivery time slot. Pay online or cash on delivery.', icon: '🛒' },
                  { n: '03', title: 'Track your delivery',   desc: 'Follow your order status from confirmation to your doorstep. 32-minute average.', icon: '🚚' },
                ].map((step, i) => (
                  <div key={step.n} className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-supply-teal/20">
                    {i < 2 && (
                      <div className="absolute right-0 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-r from-white/15 to-transparent md:block" />
                    )}
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-2xl">{step.icon}</span>
                      <p className="text-4xl font-black leading-none text-white/10 md:text-5xl">{step.n}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-50">{step.title}</p>
                    <p className="mt-2 text-xs text-slate-300 md:text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FOR EVERY ROLE ── */}
          <section className="bg-gradient-to-br from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-12 text-slate-50">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row">
              <div className="flex-1 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[.25em] text-supply-peach">For every role</p>
                <h2 className="text-xl font-semibold md:text-2xl">Who is FreshRoute built for?</h2>
                <p className="text-sm text-slate-300">
                  A single platform for buyers, sellers, and admins — each with their own tailored experience.
                </p>
                <Link to="/products" className="inline-flex rounded-full border border-white/20 px-5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">
                  Explore platform →
                </Link>
              </div>
              <div className="grid flex-1 gap-4 md:grid-cols-3">
                {[
                  { label: 'BUYERS',  color: 'text-supply-teal',   title: 'Order fresh produce', body: 'Browse products, add to cart, and run through a demo checkout flow to explain the customer journey.', to: '/products',     cta: 'Open buyer demo →' },
                  { label: 'SELLERS', color: 'text-supply-peach',  title: 'Manage inventory',    body: 'Vendors can add products, update prices per kg, adjust stock, and toggle availability without a backend.', to: '/seller/login', cta: 'Open seller demo →' },
                  { label: 'ADMINS',  color: 'text-supply-orange', title: 'Oversee the network', body: 'Admin pages outline how you would manage users, routes, payments, and analytics in a real deployment.', to: '/admin/login',  cta: 'Admin login' },
                ].map(r => (
                  <div key={r.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl transition hover:border-supply-teal/20">
                    <p className={`text-[11px] font-semibold tracking-[.18em] ${r.color}`}>{r.label}</p>
                    <p className="mt-2 text-sm font-semibold text-supply-paper">{r.title}</p>
                    <p className="mt-2 text-slate-300">{r.body}</p>
                    <Link to={r.to} className="mt-3 inline-flex text-[11px] font-semibold text-primary-light hover:text-supply-peach">{r.cta}</Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ── */}
          <section className="w-full bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-16">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-10 text-center">
                <p className="text-xs font-semibold uppercase tracking-[.35em] text-supply-peach">Testimonials</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">Loved across Sri Lanka</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { name: 'Amali Perera',     role: 'Home cook, Colombo',      q: 'Prices are so much better than the supermarket. My vegetables arrive fresh every single morning.' },
                  { name: 'Ruchira Silva',    role: 'Restaurant owner, Kandy', q: 'I switched my entire supply chain to FreshRoute. The vendor comparison feature saves me hours every week.' },
                  { name: 'Nimasha Fernando', role: 'Caterer, Gampaha',        q: 'Reliable, fast, and the quality check system means I never get a bad batch. Highly recommend.' },
                ].map(t => (
                  <div key={t.name} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-supply-teal/15">
                    <div className="text-sm tracking-wider text-supply-teal">★★★★★</div>
                    <p className="text-xs leading-relaxed text-slate-300">&ldquo;{t.q}&rdquo;</p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-supply-teal/20 text-xs font-bold text-supply-teal ring-1 ring-supply-teal/30">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-50">{t.name}</p>
                        <p className="text-[10px] text-slate-400">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="w-full bg-brand-background px-4 pb-6 pt-14 text-xs text-slate-400">
            <div className="mx-auto w-full max-w-6xl">
              <div className="grid gap-10 md:grid-cols-12">
                <div className="space-y-4 md:col-span-4">
                  <p className="text-lg font-black uppercase tracking-widest text-slate-50">FreshRoute</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    A fresh produce marketplace connecting local vendors with buyers across Sri Lanka.
                    Farm-fresh quality, transparent pricing, delivered fast.
                  </p>
                  <div className="flex gap-5 pt-1">
                    {[
                      { name: 'Facebook',  svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M15 8h-2a1 1 0 0 0-1 1v3h3l-.5 3H12v7H9v-7H7v-3h2V9a4 4 0 0 1 4-4h3z"/></> },
                      { name: 'Instagram', svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></> },
                      { name: 'LinkedIn',  svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M8 11v8"/><path d="M8 8v.01" strokeWidth="3"/><path d="M12 19v-8"/><path d="M12 15a3 3 0 0 1 6 0v4"/></> },
                      { name: 'YouTube',   svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><polygon points="10 8 17 12 10 16 10 8" fill="currentColor" stroke="none"/></> },
                    ].map(s => (
                      <a key={s.name} href="#" aria-label={s.name} className="text-slate-400 transition hover:text-supply-teal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{s.svg}</svg>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[.3em] text-supply-peach">Shop</p>
                  <div className="flex flex-col gap-2">
                    {['Vegetables', 'Fruits', 'Herbs & Spices', 'Organic range', 'Root vegetables'].map(l => (
                      <Link key={l} to="/products" className="transition hover:text-supply-teal">{l}</Link>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[.3em] text-supply-peach">Platform</p>
                  <div className="flex flex-col gap-2">
                    <Link to="/products"      className="transition hover:text-supply-teal">Buyer experience</Link>
                    <Link to="/seller/login"  className="transition hover:text-supply-teal">Seller dashboard</Link>
                    <Link to="/admin/login"   className="transition hover:text-supply-teal">Admin console</Link>
                    <a    href="#how-it-works" className="transition hover:text-supply-teal">How it works</a>
                    <Link to="/signup/vendor" className="transition hover:text-supply-teal">Become a vendor</Link>
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[.3em] text-supply-peach">Company</p>
                  <div className="flex flex-col gap-2">
                    {['About us', 'News & updates', 'Awards', 'Careers'].map(l => (
                      <span key={l} className="cursor-pointer transition hover:text-supply-teal">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[.3em] text-supply-peach">Contact</p>
                  <div className="flex flex-col gap-2 text-[11px]">
                    <span>freshroute@gmail.com</span>
                    <span>+94 11 234 5678</span>
                    <span>+94 77 234 5678</span>
                    <span>Colombo, Sri Lanka</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 border-t border-slate-800/60 pt-5">
                <div className="flex flex-col items-center justify-between gap-3 text-[11px] text-slate-500 md:flex-row">
                  <p>FreshRoute · Frontend demo · Built for academic/project use</p>
                  <p className="text-[10px] text-slate-600">Stack: React · TypeScript · Vite · Tailwind CSS · Redux</p>
                  <p>© {new Date().getFullYear()} FreshRoute Team. All rights reserved.</p>
                </div>
              </div>
            </div>
          </footer>

        </main>
      </div>

      {/* Global CSS */}
      <style>{`
        @keyframes marquee  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes frSlideIn { from{transform:translateX(-60px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>
    </div>
  )
}

export default LandingPage
