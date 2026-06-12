// LandingPage.tsx
// This is the main home page of FreshRoute — shows the hero, slideshow, stats, services, and footer.

import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'


// Counts a number up from 0 to a target value, but only starts when trigger becomes true.(increasing no section)
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

// Watches an element on the page and flips inView to true once the user scrolls to it.(increasing no section)
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

// Shows a single animated stat number that counts up when the user scrolls to it.ex:0->12000 happy customers
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView()
  const count = useCountUp(value, 2000, inView)
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 text-center">
      <p className="text-4xl font-bold text-slate-50 md:text-5xl">
        {count.toLocaleString()}<span className="text-emerald-400">{suffix}</span>
      </p>
      <p className="text-xs tracking-widest text-slate-300 uppercase">{label}</p>
    </div>
  )
}

// The list of slides shown in the image carousel — each has a photo, badge, headline, and subtitle.
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
    url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1600&q=80',
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

// How tall the fixed navbar is in pixels — used to push content below it.
const NAVBAR_HEIGHT = 64

// Full-screen image slideshow that auto-advances every 2 seconds with a slide-in animation.
function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  // Remembers the previous slide so we can keep it visible while the new one slides in.
  const [prev, setPrev] = useState<number | null>(null)

  // Runs a timer that moves to the next slide every 2 seconds.
  useEffect(() => {
    const id = setInterval(() => {
      setPrev(current)
      setCurrent(c => (c + 1) % slides.length)
      // Clears the previous slide after the slide animation finishes (0.7s).
      setTimeout(() => setPrev(null), 700)
    }, 2000)
    return () => clearInterval(id)
  }, [current])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: `calc(100dvh - ${NAVBAR_HEIGHT}px)` }}
    >
      {/* Renders only the current and previous slide — all others are hidden */}
      {slides.map((slide, i) => {
        const isCurrent = i === current
        const isPrev    = i === prev
        if (!isCurrent && !isPrev) return null

        // Current slide slides in from the right; previous slide stays still underneath.
        let style: React.CSSProperties = {}
        if (isCurrent) {
          style = { animation: 'slideInRight 0.7s cubic-bezier(0.22,1,0.36,1) forwards', zIndex: 2 }
        } else if (isPrev) {
          style = { transform: 'translateX(0)', zIndex: 1 }
        }

        return (
          <div key={i} className="absolute inset-0" style={style}>
            {/* Background photo */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.url})` }}
            />
            {/* Dark gradient overlay so white text is readable on top of the photo */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(4,18,26,0.35) 0%, rgba(4,18,26,0.15) 40%, rgba(4,18,26,0.80) 100%)',
            }} />
            {/* Slide text content — tag badge, headline, subtitle */}
            <div className="absolute inset-0 flex flex-col justify-end px-8 pb-16 md:px-20 md:pb-20">
              <span className="mb-3 inline-block w-fit rounded-full border border-supply-teal/60 bg-supply-teal/20 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.35em] text-supply-teal backdrop-blur-sm">
                {slide.tag}
              </span>
              <h1
                className="whitespace-pre-line text-4xl font-black leading-tight text-white md:text-6xl lg:text-7xl"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
              >
                {slide.headline}
              </h1>
              <p
                className="mt-4 max-w-lg text-sm leading-relaxed text-slate-200 md:text-base"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
              >
                {slide.sub}
              </p>
            </div>
          </div>
        )
      })}

      {/* Small dots at the bottom showing which slide is active */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className="block h-[3px] rounded-full transition-all duration-500"
            style={{
              width: i === current ? 32 : 10,
              background: i === current ? '#fff' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>

      {/* Thin teal progress bar at the very bottom that fills up over 2 seconds then resets */}
      <div className="absolute bottom-0 left-0 z-10 h-[3px] w-full bg-white/10">
        <div
          key={current}
          className="h-full bg-supply-teal"
          style={{ animation: 'progressBar 2s linear forwards' }}
        />
      </div>

      {/* CSS keyframe definitions for the slide and progress bar animations */}
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes progressBar  { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  )
}

// ─── LandingPage ─────────────────────────────────────────────────────────────
const LandingPage = (): JSX.Element => {

  // The list of produce categories shown in the services grid section.
  const services = [
    { title: 'Farm-Fresh Vegetables', desc: 'Direct from upcountry farms to your door. Handpicked each morning, delivered by noon.',      tag: 'Most ordered', emoji: '🥦' },
    { title: 'Tropical Fruits',       desc: 'Seasonal mangoes, papayas, pineapples and more — sourced from certified local growers.',     tag: 'In season',    emoji: '🍍' },
    { title: 'Herbs & Spices',        desc: 'Fresh curry leaves, lemongrass, pandan and a full spice range from hill-country suppliers.', tag: 'New arrivals', emoji: '🌿' },
    { title: 'Organic Range',         desc: 'Pesticide-free, verified organic produce from our certified vendor network.',                tag: 'Certified',    emoji: '🌱' },
    { title: 'Root Vegetables',       desc: 'Potatoes, carrots, beetroot, and more — bulk or per-unit pricing from multiple vendors.',    tag: 'Best value',   emoji: '🥕' },
  ]

  // The scrolling partner name strip data.
  const partners = ['Peiris Farm', 'Green Valley', 'Kandy Farms', 'Coastal Co-op', 'Uva Organics', 'Matale Growers', 'Ceylon Herbs', 'Lanka Fresh']

  const location = useLocation()

  // When the URL has a #hash (like #how-it-works), smoothly scrolls the page down to that section.
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

      {/* Fixed navbar pinned to the top of the screen */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar variant="public" />
      </div>

      {/* Pushes all page content below the fixed navbar */}
      <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <main className="relative flex-1 overflow-hidden">

          {/* ── HERO SECTION — headline, CTA buttons, and why freshroute cards ── */}
          <section className="relative flex min-h-screen w-full justify-center bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4 py-12 md:py-20">
            <div className="flex w-full max-w-6xl flex-col gap-10 md:flex-row md:items-center">

              {/* Left side: brand name, tagline, CTA buttons, and quick facts */}
              <div
                className="flex-1 space-y-6"
                style={{ animation: 'freshRouteSlideIn 0.9s cubic-bezier(0.22,1,0.36,1) both' }}
              >
                <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-medium tracking-[0.3em] text-supply-paper/80 ring-1 ring-white/20 uppercase">
                  Fresh from local markets
                </p>

                <div>
                  <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-slate-50 md:text-7xl">
                    Fresh<span className="block text-supply-teal">Route</span>
                  </h1>
                  <p className="mt-3 text-lg font-light tracking-[0.15em] text-slate-300 uppercase md:text-xl">
                    Local Vendor Marketplace
                  </p>
                </div>

                <p className="max-w-xl text-sm text-slate-300 md:text-base">
                  Discover trusted local vendors, compare prices in real time, and get fresh fruits,
                  vegetables, and essentials delivered to your doorstep — no middlemen, transparent
                  pricing, powered by FreshRoute.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Link to="/signup/customer" className="rounded-full bg-primary-dark px-6 py-2 text-sm font-medium text-supply-paper hover:bg-primary-dark/80">
                    Start Ordering
                  </Link>
                  <Link to="/signup/vendor" className="rounded-full border border-supply-ash/40 px-6 py-2 text-sm font-medium text-supply-ash hover:bg-white/10">
                    Become a Vendor
                  </Link>
                  <a href="#how-it-works" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-200">
                    How it works <span className="text-supply-teal">↓</span>
                  </a>
                </div>

                <div className="flex flex-wrap gap-6 pt-4 text-xs text-slate-300 md:text-sm">
                  <div>
                    <p className="font-semibold text-supply-paper">30+ local vendors</p>
                    <p>Compare prices across your city.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-supply-paper">Same-day delivery</p>
                    <p>Order before 5 pm and get it today.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-supply-paper">Quality checked</p>
                    <p>Vendors are verified by FreshRoute.</p>
                  </div>
                </div>
              </div>

              {/* Right side: why freshroute */}
              {/* Right side: who are you matcher */}
<div
  className="flex-1 flex justify-center items-center"
  style={{ animation: 'freshRouteSlideIn 1.1s cubic-bezier(0.22,1,0.36,1) both' }}
>
  {(() => {
    const [selected, setSelected] = useState<'buyer' | 'seller' | null>(null)
    return (
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl">

        {/* header */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
          Find your fit
        </p>
        <p className="text-xl font-bold text-slate-50 leading-snug mb-6">
          Who are you on FreshRoute?
        </p>

        {/* options */}
        <div className="flex flex-col gap-3 mb-5">
          {[
            {
              type: 'buyer' as const,
              emoji: '🛒',
              title: 'I want to order fresh produce',
              sub: 'Browse vendors, compare prices, get delivery',
            },
            {
              type: 'seller' as const,
              emoji: '🏪',
              title: 'I want to sell my products',
              sub: 'List produce, manage orders, grow sales',
            },
          ].map((o) => (
            <button
              key={o.type}
              onClick={() => setSelected(o.type)}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                selected === o.type
                  ? 'border-supply-teal/50 bg-supply-teal/10'
                  : 'border-white/10 bg-white/4 hover:border-supply-teal/30 hover:bg-supply-teal/5'
              }`}
            >
              <span className="text-3xl">{o.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-50">{o.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{o.sub}</p>
              </div>
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
                selected === o.type
                  ? 'border-supply-teal bg-supply-teal text-white'
                  : 'border-white/15'
              }`}>
                {selected === o.type && '✓'}
              </div>
            </button>
          ))}
        </div>

        {/* buyer result */}
        {selected === 'buyer' && (
          <div className="mb-4 rounded-2xl border border-supply-teal/20 bg-supply-teal/8 p-4">
            <p className="text-sm font-bold text-slate-50 mb-1">FreshRoute is perfect for you!</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get fresh vegetables, fruits and herbs delivered from verified local vendors — faster and cheaper than any supermarket.
            </p>
          </div>
        )}

        {/* seller result */}
        {selected === 'seller' && (
          <div className="mb-4 rounded-2xl border border-orange-500/20 bg-orange-500/8 p-4">
            <p className="text-sm font-bold text-slate-50 mb-1">FreshRoute is perfect for you!</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reach thousands of buyers across Sri Lanka. List your produce, manage orders, and grow your business — all in one place.
            </p>
          </div>
        )}

        {/* CTA button */}
        {selected === 'buyer' && (
          <Link
            to="/signup/customer"
            className="block w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-supply-teal py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start ordering now →
          </Link>
        )}
        {selected === 'seller' && (
          <Link
            to="/signup/vendor"
            className="block w-full rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Become a vendor →
          </Link>
        )}

        {/* placeholder when nothing selected */}
        {!selected && (
          <div className="rounded-2xl border border-white/6 bg-white/3 py-3 text-center text-xs text-slate-600">
            Select an option above to get started
          </div>
        )}

      </div>
    )
  })()}
</div>

            </div>
          </section>

          {/* ── CAROUSEL SECTION — full-screen image slideshow ── */}
          <section style={{ height: `calc(100dvh - ${NAVBAR_HEIGHT}px)` }}>
            <HeroSlideshow />
          </section>
          

          {/* ── STATS BAR — animated numbers that count up on scroll ── */}
          <section className="relative w-full  bg-gradient-to-br from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-16">
            <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 md:grid-cols-5">
              <StatCounter value={30}   suffix="+"       label="Local vendors"    />
              <StatCounter value={96}   suffix="%"       label="On-time delivery" />
              <StatCounter value={32}   suffix=" min"    label="Avg. delivery"    />
              <StatCounter value={1200} suffix="+"       label="Happy customers"  />
              <StatCounter value={5}    suffix=" cities" label="Across Sri Lanka" />
            </div>
          </section>


          {/* ── SERVICES / products range grid ── */}
          <section className="relative w-full bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-16 md:py-20">
            <div className="mx-auto w-full max-w-6xl">

              {/* Section header */}
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-supply-peach">
                    What we deliver
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-50 md:text-3xl">
                    Our products range
                  </h2>
                </div>
             </div>

              {/* Uniform 5-card grid — all cards same size, no bento */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {[
                  {
                    ...services[0],
                    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
                  },
                  {
                    ...services[1],
                    img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80',
                  },
                  {
                    ...services[2],
                    img: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80',
                  },
                  {
                    ...services[3],
                    img: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&q=80',
                  },
                  {
                    ...services[4],
                    img: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&q=80',
                  },
                ].map((s) => (
                  <div
                    key={s.title}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-supply-teal/40"
                  >
                    {/* Card photo */}
                    <img
                      src={s.img}
                      alt={s.title}
                      className="h-36 w-full object-cover"
                    />

                    {/* Card body */}
                    <div className="flex flex-1 flex-col gap-2 p-4">

                      {/* Badge */}
                      <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider
                        ${s.tag === 'Most ordered' ? 'bg-supply-teal/20 text-supply-teal-400 border border-supply-teal/30' : ''}
                        ${s.tag === 'In season'    ? 'bg-supply-peach/10 text-supply-peach border border-supply-peach/20' : ''}
                        ${s.tag === 'New arrivals' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                        ${s.tag === 'Certified'    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                        ${s.tag === 'Best value'   ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : ''}
                      `}>
                        {s.tag}
                      </span>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-50">{s.title}</h3>

                      {/* Description */}
                      <p className="text-xs leading-relaxed text-slate-400">{s.desc}</p>

                      {/* Footer row — divider + link + icon */}

                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* ── PARTNER STRIP — scrolling marquee of vendor partner names ── */}
          <section className="w-full overflow-hidden border-y border-white/10 bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 py-6">
            <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">Trusted vendor partners</p>
            {/* List is doubled so the scroll loop looks seamless */}
            <div className="flex gap-8 whitespace-nowrap px-8" style={{ animation: 'marquee 20s linear infinite' }}>
              {[...partners, ...partners].map((p, i) => (
                <span key={i} className="inline-block rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-slate-300">{p}</span>
              ))}
            </div>
          </section>

          {/* ── HOW IT WORKS — 3 numbered step cards ── */}
          <section id="how-it-works" className="relative w-full bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-12 md:py-16">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-12 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-supply-peach">Simple process</p>
                <h2 className="mt-2 text-center text-xl font-semibold text-slate-50 md:text-2xl">How FreshRoute works</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">From browse to doorstep in three easy steps — no phone calls, no haggling.</p>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {[
                  { n: '01', title: 'Browse nearby vendors',  desc: 'Search by category or vendor and see live pricing from multiple markets side-by-side.' },
                  { n: '02', title: 'Place your order',       desc: 'Add items to cart, choose your address and delivery time slot. Pay online or cash on delivery.' },
                  { n: '03', title: 'Track your delivery',    desc: 'Follow your order status from confirmation to your doorstep. 32-minute average.' },
                ].map((step, i) => (
                  <div key={step.n} className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    {/* Horizontal connector line between cards (hidden on mobile) */}
                    {i < 2 && (
                      <div className="absolute right-0 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-white/15 md:block" />
                    )}
                    <p className="text-5xl font-black leading-none text-white/15 md:text-6xl">{step.n}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-50">{step.title}</p>
                    <p className="mt-2 text-xs text-slate-300 md:text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FOR EVERY ROLE — 3 cards for Buyers, Sellers, Admins ── */}
          <section className="bg-gradient-to-br from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-12 text-slate-50">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row">
              <div className="flex-1 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">For every role</p>
                <h2 className="text-xl font-semibold md:text-2xl">Who is FreshRoute built for?</h2>
                <p className="text-sm text-slate-300">A single platform for buyers, sellers, and admins — each with their own tailored experience.</p>
                <Link to="/products" className="inline-flex rounded-full border border-white/20 px-5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10">Explore platform →</Link>
              </div>
              <div className="grid flex-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-supply-teal">BUYERS</p>
                  <p className="mt-2 text-sm font-semibold text-supply-paper">Order fresh produce</p>
                  <p className="mt-2 text-slate-300">Browse products, add to cart, and run through a demo checkout flow to explain the customer journey.</p>
                  <Link to="/products" className="mt-3 inline-flex text-[11px] font-semibold text-primary-light hover:text-supply-peach">Open buyer demo →</Link>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-supply-peach">SELLERS</p>
                  <p className="mt-2 text-sm font-semibold text-supply-paper">Manage inventory</p>
                  <p className="mt-2 text-slate-300">Vendors can add products, update prices per kg, adjust stock, and toggle availability without a backend.</p>
                  <Link to="/seller/login" className="mt-3 inline-flex text-[11px] font-semibold text-primary-light hover:text-supply-peach">Open seller demo →</Link>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-supply-orange">ADMINS</p>
                  <p className="mt-2 text-sm font-semibold text-supply-paper">Oversee the network</p>
                  <p className="mt-2 text-slate-300">Admin pages outline how you would manage users, routes, payments, and analytics in a real deployment.</p>
                  <Link to="/admin/login" className="mt-3 inline-flex text-[11px] font-semibold text-primary-light hover:text-supply-peach">Admin login</Link>
                </div>
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS — 3 customer review cards ── */}
          <section className="w-full bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-16">
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
                  <div key={t.name} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                    <div className="text-sm tracking-wider text-supply-teal">★★★★★</div>
                    <p className="text-xs leading-relaxed text-slate-300">&ldquo;{t.q}&rdquo;</p>
                    <div className="mt-auto flex items-center gap-3">
                      {/* Avatar circle showing first letter of name */}
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

          {/* ── FOOTER — links, contact info, social icons, copyright ── */}
          <footer className="w-full bg-brand-background px-4 pb-6 pt-14 text-xs text-slate-400">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{s.svg}</svg>
                      </a>
                    ))}
                  </div>
                </div>
                {/* Shop links */}
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-supply-peach">Shop</p>
                  <div className="flex flex-col gap-2">
                    {['Vegetables', 'Fruits', 'Herbs & Spices', 'Organic range', 'Root vegetables'].map(l => (
                      <Link key={l} to="/products" className="transition hover:text-supply-teal">{l}</Link>
                    ))}
                  </div>
                </div>
                {/* Platform links */}
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-supply-peach">Platform</p>
                  <div className="flex flex-col gap-2">
                    <Link to="/products"      className="transition hover:text-supply-teal">Buyer experience</Link>
                    <Link to="/seller/login"  className="transition hover:text-supply-teal">Seller dashboard</Link>
                    <Link to="/admin/login"   className="transition hover:text-supply-teal">Admin console</Link>
                    <a href="#how-it-works"   className="transition hover:text-supply-teal">How it works</a>
                    <Link to="/signup/vendor" className="transition hover:text-supply-teal">Become a vendor</Link>
                  </div>
                </div>
                {/* Company links */}
                <div className="space-y-3 md:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-supply-peach">Company</p>
                  <div className="flex flex-col gap-2">
                    {['About us', 'News & updates', 'Awards', 'Careers'].map(l => (
                      <span key={l} className="cursor-pointer transition hover:text-supply-teal">{l}</span>
                    ))}
                  </div>
                </div>
                {/* Contact info */}
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
              {/* Bottom copyright bar */}
              <div className="mt-10 border-t border-slate-800/60 pt-5">
                <div className="flex flex-col items-center justify-between gap-3 text-[11px] text-slate-500 md:flex-row">
                  <p>FreshRoute · Frontend demo (no live backend) · Built for academic/project use</p>
                  <p className="text-[10px] text-slate-600">Stack: React · TypeScript · Vite · Tailwind CSS · Redux</p>
                  <p>© {new Date().getFullYear()} FreshRoute Team. All rights reserved.</p>
                </div>
              </div>
            </div>
          </footer>

        </main>
      </div>

      {/* Global CSS animations used across the page */}
      <style>{`
        @keyframes marquee           { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes freshRouteSlideIn { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  )
}

export default LandingPage