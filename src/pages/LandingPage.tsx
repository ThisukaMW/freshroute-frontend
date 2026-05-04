import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'

// Counts from 0 to target over duration ms, starts only when trigger is true
function useCountUp(target: number, duration = 2000, trigger: boolean = false) {
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

// Returns a ref and inView flag — flips true once element enters the viewport
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

// Animated stat number that counts up when scrolled into view
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView()
  const count = useCountUp(value, 2000, inView)
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 text-center">
      <p className="text-4xl font-bold text-supply-teal md:text-5xl">
        {count.toLocaleString()}<span className="text-supply-peach">{suffix}</span>
      </p>
      <p className="text-xs tracking-widest text-slate-300 uppercase">{label}</p>
    </div>
  )
}

// Slideshow data — each slide has an image, tag badge, headline, and subtitle
const slides = [
  {
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
    tag: 'Farm Fresh',
    headline: 'Straight from the\nfields to your door',
    sub: 'Upcountry vegetables handpicked each morning and delivered by noon.',
  },
  {
    url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80',
    tag: 'Local Vendors',
    headline: 'Supporting Sri Lanka\'s\nfarming community',
    sub: 'Over 30 verified local sellers — no middlemen, transparent pricing.',
  },
  {
    url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=1600&q=80',
    tag: 'Fast Delivery',
    headline: '32-minute average\ndelivery city-wide',
    sub: 'Real-time tracking from dispatch to doorstep, every single order.',
  },
  {
    url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1600&q=80',
    tag: 'Fresh Produce',
    headline: 'Vegetables, fruits,\nherbs — all in one place',
    sub: 'Browse, compare, order, and track — the whole supply chain, simplified.',
  },
]

// Offset for the fixed navbar so content doesn't hide behind it
const HEADER_HEIGHT = 64

// Full-viewport image carousel — auto-advances every 2s, slides in from right
function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  // Auto-advance: moves to next slide every 2s, clears prev after animation
  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true)
      setPrev(current)
      setCurrent(c => (c + 1) % slides.length)
      setTimeout(() => { setAnimating(false); setPrev(null) }, 700)
    }, 2000)
    return () => clearInterval(id)
  }, [current])

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)`, minHeight: 480 }}>
      {slides.map((slide, i) => {
        const isCurrent = i === current
        const isPrev    = i === prev
        if (!isCurrent && !isPrev) return null

        // Current slide animates in from right, previous stays put beneath it
        let style: React.CSSProperties = {}
        if (isCurrent) {
          style = { animation: 'slideInRight 0.7s cubic-bezier(0.22,1,0.36,1) forwards', zIndex: 2 }
        } else if (isPrev) {
          style = { transform: 'translateX(0)', zIndex: 1 }
        }

        return (
          <div key={i} className="absolute inset-0" style={style}>
            {/* Background image */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.url})` }} />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(4,18,26,0.35) 0%, rgba(4,18,26,0.15) 40%, rgba(4,18,26,0.80) 100%)',
            }} />
            {/* Slide text — tag, headline, subtitle */}
            <div className="absolute inset-0 flex flex-col justify-end px-8 pb-16 md:px-20 md:pb-20">
              <span className="mb-3 inline-block w-fit rounded-full border border-supply-teal/60 bg-supply-teal/20 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.35em] text-supply-teal backdrop-blur-sm">
                {slide.tag}
              </span>
              <h1 className="whitespace-pre-line text-4xl font-black leading-tight text-white md:text-6xl lg:text-7xl" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
                {slide.headline}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-200 md:text-base" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
                {slide.sub}
              </p>
            </div>
          </div>
        )
      })}

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <span key={i} className="block h-[3px] rounded-full transition-all duration-500"
            style={{ width: i === current ? 32 : 10, background: i === current ? '#fff' : 'rgba(255,255,255,0.35)' }} />
        ))}
      </div>

      {/* Progress bar — resets and fills over 2s on each slide change */}
      <div className="absolute bottom-0 left-0 z-10 h-[3px] w-full bg-white/10">
        <div key={current} className="h-full bg-supply-teal" style={{ animation: 'progressBar 2s linear forwards' }} />
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes progressBar  { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  )
}

// ─── LandingPage ─────────────────────────────────────────────────────────────
const LandingPage = (): JSX.Element => {

  // Produce categories shown in the services grid
  const services = [
    { title: 'Farm-Fresh Vegetables', desc: 'Direct from upcountry farms to your door. Handpicked each morning, delivered by noon.',      tag: 'Most ordered', emoji: '🥦' },
    { title: 'Tropical Fruits',       desc: 'Seasonal mangoes, papayas, pineapples and more — sourced from certified local growers.',     tag: 'In season',    emoji: '🍍' },
    { title: 'Herbs & Spices',        desc: 'Fresh curry leaves, lemongrass, pandan and a full spice range from hill-country suppliers.', tag: 'New arrivals', emoji: '🌿' },
    { title: 'Organic Range',         desc: 'Pesticide-free, verified organic produce from our certified vendor network.',                tag: 'Certified',    emoji: '🌱' },
    { title: 'Root Vegetables',       desc: 'Potatoes, carrots, beetroot, and more — bulk or per-unit pricing from multiple vendors.',    tag: 'Best value',   emoji: '🥕' },
  ]

  const partners = ['Peiris Farm', 'Green Valley', 'Kandy Farms', 'Coastal Co-op', 'Uva Organics', 'Matale Growers', 'Ceylon Herbs', 'Lanka Fresh']

  // Smooth scroll to hash anchor on route change (e.g. /#how-it-works)
  const location = useLocation()
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 50)
  }, [location])

  return (
    <div
      className="flex min-h-screen flex-col text-supply-ash"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 15% 10%, rgba(17,80,92,0.7) 0%, transparent 55%),
          radial-gradient(ellipse 60% 55% at 85% 80%, rgba(35,101,113,0.5) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 50% 45%, rgba(22,90,105,0.3) 0%, transparent 60%),
          linear-gradient(150deg, #061820 0%, #0a2830 35%, #071e26 65%, #04121a 100%)
        `,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Fixed navbar — always on top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar variant="public" />
      </div>

      <div style={{ paddingTop: `${HEADER_HEIGHT}px` }}>
        <main className="relative flex-1">

          {/* ── Hero text section ── */}
          <section className="relative w-full px-4 py-8 md:py-5">
            <div className="relative z-10 w-full max-w-6xl mx-auto">

              {/* Main headline + CTA buttons — slides in from left on load */}
              <div style={{ animation: 'freshRouteSlideIn 0.9s cubic-bezier(0.22,1,0.36,1) both' }}>
                <p className="mb-4 text-xs font-medium tracking-[0.5em] text-supply-teal uppercase">
                  Fresh from local markets
                </p>
                <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-slate-50 md:text-8xl">
                  Fresh<span className="block text-supply-teal">Route</span>
                </h1>
                <p className="mt-4 text-lg font-light tracking-[0.15em] text-slate-300 uppercase md:text-2xl">Local Vendor Marketplace</p>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
                  FreshRoute connects you directly with trusted local vendors across Sri Lanka — no middlemen,
                  transparent pricing, and fresh produce at your doorstep within hours.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link to="/signup/customer" className="rounded-full bg-supply-teal px-8 py-3 text-sm font-semibold text-slate-200 transition hover:bg-supply-teal/80">Start Ordering</Link>
                  <Link to="/signup/vendor"   className="rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">Become a Vendor</Link>
                  <a href="#how-it-works"     className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-400 transition hover:text-slate-200">How it works <span className="text-supply-teal">↓</span></a>
                </div>
                {/* Trust badges */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {['30+ verified vendors', '96% on-time delivery', '12,000+ customers', 'Same-day delivery'].map(t => (
                    <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-300 backdrop-blur-sm">{t}</span>
                  ))}
                </div>
              </div>

              {/* Quick stat boxes */}
              <div className="mt-6 flex flex-wrap gap-4" style={{ animation: 'freshRouteSlideIn 1.1s cubic-bezier(0.22,1,0.36,1) both' }}>
                <div className="rounded-2xl border border-white/15 p-5 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-supply-peach">On-time rate</p>
                  <p className="text-3xl font-bold text-slate-50">96%</p>
                </div>
                <div className="rounded-2xl border border-supply-teal/30 bg-supply-teal/10 p-5 backdrop-blur-md">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-supply-teal">Avg. delivery</p>
                  <p className="text-3xl font-bold text-slate-50">32 min</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Hero slideshow ── */}
          <section className="relative w-full">
            <HeroSlideshow />
          </section>

          {/* ── Animated stats bar ── */}
          <section className="w-full px-4 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.03)' }}>
            <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 md:grid-cols-5">
              <StatCounter value={30}   suffix="+"       label="Local vendors"    />
              <StatCounter value={96}   suffix="%"       label="On-time delivery" />
              <StatCounter value={32}   suffix=" min"    label="Avg. delivery"    />
              <StatCounter value={1200} suffix="+"       label="Happy customers"  />
              <StatCounter value={5}    suffix=" cities" label="Across Sri Lanka" />
            </div>
          </section>

          {/* ── Services / produce range grid ── */}
          <section className="w-full px-4 py-16 md:py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-supply-peach">What we deliver</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">Our produce range</h2>
                </div>
                <Link to="/products" className="hidden text-xs font-semibold text-primary-light hover:text-supply-peach md:block">Browse all →</Link>
              </div>
              {/* Bento-style grid — first card is large (col-span-2, row-span-2) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-white/15 p-8 backdrop-blur-md transition hover:border-supply-teal/40 hover:bg-white/10 md:col-span-2 md:row-span-2"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <span className="text-7xl">{services[0].emoji}</span>
                  <div className="mt-6">
                    <span className="rounded-full border border-supply-teal/30 bg-supply-teal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-supply-teal">{services[0].tag}</span>
                    <h3 className="mt-3 text-2xl font-bold text-slate-50">{services[0].title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{services[0].desc}</p>
                  </div>
                  <Link to="/products" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-supply-teal transition group-hover:gap-3">Browse category →</Link>
                </div>
                {services.slice(1).map((s) => (
                  <div key={s.title} className="group rounded-3xl border border-white/15 p-6 backdrop-blur-md transition hover:border-supply-teal/40 hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <span className="text-4xl">{s.emoji}</span>
                    <div className="mt-4">
                      <span className="rounded-full border border-supply-peach/20 bg-supply-peach/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-supply-peach">{s.tag}</span>
                      <h3 className="mt-2 text-sm font-bold text-slate-50">{s.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">{s.desc}</p>
                    </div>
                    <Link to="/products" className="mt-4 inline-flex text-[11px] font-semibold text-supply-teal group-hover:underline">Learn More →</Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Scrolling partner name strip ── */}
          <section className="w-full overflow-hidden py-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">Trusted vendor partners</p>
            {/* List is duplicated to create a seamless infinite scroll effect */}
            <div className="flex gap-8 whitespace-nowrap px-8" style={{ animation: 'marquee 20s linear infinite' }}>
              {[...partners, ...partners].map((p, i) => (
                <span key={i} className="inline-block rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold text-slate-300">{p}</span>
              ))}
            </div>
          </section>

          {/* ── How it works — 3-step process ── */}
          <section id="how-it-works" className="relative w-full px-4 py-16 md:py-24"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(35,101,113,0.12)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-12 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-supply-peach">Simple process</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">How FreshRoute works</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">From browse to doorstep in three easy steps — no phone calls, no haggling.</p>
              </div>
              <div className="grid gap-0 md:grid-cols-3">
                {[
                  { n: '01', title: 'Browse vendors',      desc: 'Search by category or item. See live pricing from multiple vendors side-by-side.' },
                  { n: '02', title: 'Place your order',    desc: 'Add to cart, enter your address, choose a delivery slot. Pay online or cash on delivery.' },
                  { n: '03', title: 'Track your delivery', desc: 'Real-time status updates from dispatch to your doorstep. 32-minute average.' },
                ].map((step, i) => (
                  <div key={step.n} className="relative p-8">
                    {i < 2 && <div className="absolute right-0 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-white/15 md:block" />}
                    <p className="text-5xl font-black leading-none text-white/15 md:text-6xl">{step.n}</p>
                    <h3 className="mt-3 text-base font-bold text-slate-50">{step.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── For every role — Buyers / Sellers / Admins ── */}
          <section className="w-full px-4 py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 md:flex-row">
              <div className="flex-1 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-supply-peach">For every role</p>
                <h2 className="text-2xl font-bold text-slate-50 md:text-3xl">Who is FreshRoute built for?</h2>
                <p className="text-sm leading-relaxed text-slate-300">A single platform for buyers, sellers, and admins — each with their own tailored experience.</p>
                <Link to="/products" className="inline-flex rounded-full border border-white/20 px-5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">Explore platform →</Link>
              </div>
              <div className="grid flex-1 gap-4 md:grid-cols-3">
                {[
                  { role: 'BUYERS',  color: 'text-supply-teal',   title: 'Order fresh produce', desc: 'Browse, compare, cart, and get doorstep delivery with live tracking.',      link: '/products',     cta: 'Buyer demo →'  },
                  { role: 'SELLERS', color: 'text-supply-peach',  title: 'Manage inventory',    desc: 'List products, set per-kg pricing, manage stock and toggle availability.', link: '/ratings-demo', cta: 'Seller demo →' },
                  { role: 'ADMINS',  color: 'text-supply-orange', title: 'Oversee the network', desc: 'Monitor users, routes, payments and platform health in one console.',       link: '/admin/login',  cta: 'Admin login'   },
                ].map((r) => (
                  <div key={r.role} className="flex flex-col gap-3 rounded-3xl border border-white/15 p-5 backdrop-blur-md transition hover:border-supply-teal/30 hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${r.color}`}>{r.role}</p>
                    <p className="text-sm font-bold text-slate-50">{r.title}</p>
                    <p className="text-xs leading-relaxed text-slate-300">{r.desc}</p>
                    <Link to={r.link} className="mt-auto text-[11px] font-semibold text-primary-light hover:text-supply-peach">{r.cta}</Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section className="w-full px-4 py-16"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-10 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-supply-peach">Testimonials</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">Loved across Sri Lanka</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { name: 'Amali Perera',     role: 'Home cook, Colombo',      q: 'Prices are so much better than the supermarket. My vegetables arrive fresh every single morning.' },
                  { name: 'Ruchira Silva',    role: 'Restaurant owner, Kandy', q: 'I switched my entire supply chain to FreshRoute. The vendor comparison feature saves me hours every week.' },
                  { name: 'Nimasha Fernando', role: 'Caterer, Gampaha',        q: 'Reliable, fast, and the quality check system means I never get a bad batch. Highly recommend.' },
                ].map((t) => (
                  <div key={t.name} className="flex flex-col gap-4 rounded-2xl border border-white/15 p-6 backdrop-blur-md"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-sm tracking-wider text-supply-teal">★★★★★</div>
                    <p className="text-xs leading-relaxed text-slate-300">&ldquo;{t.q}&rdquo;</p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-supply-teal/20 text-xs font-bold text-supply-teal ring-1 ring-supply-teal/30">{t.name[0]}</div>
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

          {/* ── Footer ── */}
          <footer className="w-full bg-brand-background/40 shadow-sm shadow-black/40 backdrop-blur-xl px-4 pb-6 pt-14 text-xs text-slate-400">
            <div className="mx-auto w-full max-w-6xl">
              <div className="grid gap-10 md:grid-cols-12">
                {/* Brand blurb + social icons */}
                <div className="space-y-4 md:col-span-4">
                  <p className="text-lg font-black uppercase tracking-widest text-slate-50">FreshRoute</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">A fresh produce marketplace connecting local vendors with buyers across Sri Lanka. Farm-fresh quality, transparent pricing, delivered fast.</p>
                  <div className="flex gap-5 pt-1">
                    {[
                      { name: 'Facebook',  svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M15 8h-2a1 1 0 0 0-1 1v3h3l-0.5 3H12v7H9v-7H7v-3h2V9a4 4 0 0 1 4-4h3z" /></> },
                      { name: 'Instagram', svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></> },
                      { name: 'LinkedIn',  svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M8 11v8" /><path d="M8 8v.01" strokeWidth="3" /><path d="M12 19v-8" /><path d="M12 15a3 3 0 0 1 6 0v4" /></> },
                      { name: 'YouTube',   svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><polygon points="10 8 17 12 10 16 10 8" fill="currentColor" stroke="none" /></> },
                    ].map((s) => (
                      <a key={s.name} href="#" aria-label={s.name} className="text-slate-400 transition hover:text-supply-teal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          {s.svg}
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
                {/* Footer nav columns */}
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-supply-peach">Shop</p>
                  <div className="flex flex-col gap-2">
                    {['Vegetables', 'Fruits', 'Herbs & Spices', 'Organic range', 'Root vegetables'].map(l => (
                      <Link key={l} to="/products" className="transition hover:text-supply-teal">{l}</Link>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-supply-peach">Platform</p>
                  <div className="flex flex-col gap-2">
                    <Link to="/products" className="transition hover:text-supply-teal">Buyer experience</Link>
                    <Link to="/seller/login" className="transition hover:text-supply-teal">Seller dashboard</Link>
                    <Link to="/admin/login" className="transition hover:text-supply-teal">Admin console</Link>
                    <a href="#how-it-works" className="transition hover:text-supply-teal">How it works</a>
                    <Link to="/signup/vendor" className="transition hover:text-supply-teal">Become a vendor</Link>
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-supply-peach">Company</p>
                  <div className="flex flex-col gap-2">
                    {['About us', 'News & updates', 'Awards', 'Careers'].map(l => (
                      <span key={l} className="cursor-pointer transition hover:text-supply-teal">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-supply-peach">Contact</p>
                  <div className="flex flex-col gap-2 text-[11px]">
                    <span>freshroute@gmail.com</span>
                    <span>+94 11 234 5678</span>
                    <span>+94 77 234 5678</span>
                    <span>Colombo, Sri Lanka</span>
                  </div>
                </div>
              </div>
              {/* Bottom bar */}
              <div className="mt-10 border-t border-slate-800/60 pt-5">
                <div className="flex flex-col items-center justify-between gap-3 text-[11px] text-slate-600 md:flex-row">
                  <p>FreshRoute · Connecting local vendors with buyers across Sri Lanka</p>
                  <p className="text-[10px] text-slate-700">Built with React · TypeScript · Vite · Tailwind CSS · Redux</p>
                  <p>© {new Date().getFullYear()} FreshRoute Team. All rights reserved.</p>
                </div>
              </div>
            </div>
          </footer>

        </main>
      </div>

      {/* Global keyframe animations */}
      <style>{`
        @keyframes marquee          { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes freshRouteSlideIn { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  )
}

export default LandingPage