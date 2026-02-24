/*const LandingPage = () => {
  return <div>LandingPage</div>;
};

export default LandingPage;*/
/*import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import type { JSX } from 'react';
import { useEffect } from 'react'

const LandingPage = (): JSX.Element => {
  interface StepItem {
    title: string;
    desc: string;
  }

  const howItWorksSteps: StepItem[] = [
    {
      title: 'Browse nearby vendors',
      desc: 'Search by category or vendor and see live pricing from multiple markets.',
    },
    {
      title: 'Place your order',
      desc: 'Add items to cart, choose your address and delivery time slot.',
    },
    {
      title: 'Track your delivery',
      desc: 'Follow your order status from confirmation to delivery.',
    },
  ];

  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    // wait a tick for the landing page to render, then scroll
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [location]);

  return (
    <div className="flex min-h-screen flex-col bg-supply-charcoal text-supply-ash">
      <Navbar variant="public" />
      <main className="relative flex-1 overflow-hidden">
        <section className="relative flex min-h-screen w-full justify-center bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4 py-12 md:py-20">
          <div className="flex w-full max-w-6xl flex-col gap-10 md:flex-row md:items-center">
            <div className="flex-1 space-y-6">
              <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-medium tracking-[0.3em] text-supply-paper/80 ring-1 ring-white/20">
              SUPPLY LINK THEME
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 md:text-5xl">
              Seamless supply chains,
              <span className="text-primary-dark"> powered by FreshRoute</span>.
            </h1>
            <p className="max-w-xl text-sm text-slate-300 md:text-base">
              Discover trusted local vendors, compare prices in real time, and get fresh fruits, vegetables, and essentials
              delivered to your doorstep.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="rounded-full bg-primary-dark px-6 py-2 text-sm font-medium text-supply-paper hover:bg-primary-dark/80"
              >
                Start Ordering
              </Link>
              <Link
                to="/signup/vendor"
                className="rounded-full border border-supply-ash/40 px-6 py-2 text-sm font-medium text-supply-ash hover:bg-white/10"
              >
                Become a Vendor
              </Link>
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

            <div className="flex-1">
              <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6  backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] font-medium text-supply-peach">Today&apos;s picks</p>
                    <p className="mt-1 text-lg font-semibold text-supply-paper">Fresh veggies</p>
                    <p className="mt-2 text-[11px] text-slate-300">Handpicked from local markets each morning.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="rounded-2xl border border-supply-teal/40 bg-supply-teal/30 p-3">
                      <p className="text-[11px] font-medium text-white">Average delivery</p>
                      <p className="text-lg font-semibold text-slate-50">32 min</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-supply-deep/70 p-3 text-slate-50">
                      <p className="text-[11px] font-medium text-supply-peach">On-time rate</p>
                      <p className="text-lg font-semibold text-supply-peach">96%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-xs text-slate-300">
                  <p className="font-semibold text-slate-50">For your project demo</p>
                  <p className="mt-1 text-slate-300">
                    This is a frontend-only prototype. All data here is mocked, so you can show flows without needing a
                    backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="relative flex w-full justify-center bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-12 md:py-16"
        >
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-center text-xl font-semibold text-slate-50 md:text-2xl">
              How FreshRoute works
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {howItWorksSteps.map((item: StepItem) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5  backdrop-blur-xl"
                >
                  <p className="text-sm font-semibold text-slate-50">{item.title}</p>
                  <p className="mt-2 text-xs text-slate-300 md:text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-12 text-slate-50">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row">
            <div className="flex-1 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">
                For every role
              </p>
              <h2 className="text-xl font-semibold md:text-2xl">Who is FreshRoute built for?</h2>
              <p className="text-sm text-slate-300">
                This frontend is designed to clearly show how buyers, sellers, and admins all see
                different views of the same logistics platform.
              </p>
            </div>
            <div className="grid flex-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-supply-teal">BUYERS</p>
                <p className="mt-2 text-sm font-semibold text-supply-paper">Order fresh produce</p>
                <p className="mt-2 text-slate-300">
                  Browse products, add to cart, and run through a demo checkout flow to explain the
                  customer journey.
                </p>
                <Link
                  to="/products"
                  className="mt-3 inline-flex text-[11px] font-semibold text-primary-light hover:text-supply-peach"
                >
                  Open buyer demo →
                </Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-supply-peach">SELLERS</p>
                <p className="mt-2 text-sm font-semibold text-supply-paper">Manage inventory</p>
                <p className="mt-2 text-slate-300">
                  Vendors can add products, update prices per kg, adjust stock, and toggle
                  availability without a backend.
                </p>
                <Link
                  to="/seller/login"
                  className="mt-3 inline-flex text-[11px] font-semibold text-primary-light hover:text-supply-peach"
                >
                  Open seller demo →
                </Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-supply-orange">ADMINS</p>
                <p className="mt-2 text-sm font-semibold text-supply-paper">Oversee the network</p>
                <p className="mt-2 text-slate-300">
                  Admin pages outline how you would manage users, routes, payments, and analytics in
                  a real deployment.
                </p>
                <span className="mt-3 inline-flex text-[11px] font-semibold text-primary-light">
                  Admin UI is prototype-only
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className=" bg-brand-background/40 shadow-sm shadow-black/40 backdrop-blur-xl px-4 py-10 text-xs text-slate-300">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-supply-paper">FreshRoute</p>
                <p className="text-[11px] text-slate-400">
                  A mock logistics and fresh-produce marketplace used to demonstrate frontend flows
                  for buyers, sellers and admins.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-supply-peach">
                  Product
                </p>
                <div className="flex flex-col gap-1">
                  <Link to="/products" className="hover:text-supply-teal">
                    Buyer experience
                  </Link>
                  <Link to="/seller/login" className="hover:text-supply-teal">
                    Seller dashboard
                  </Link>
                  <Link to="/admin/login" className="hover:text-supply-teal">
                    Admin console
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-supply-peach">
                  Project
                </p>
                <div className="flex flex-col gap-1">
                  <a href="#how-it-works" className="hover:text-supply-teal">
                    How it works
                  </a>
                  <span className="text-slate-500">
                    Stack: React, TypeScript, Vite, Tailwind CSS, Redux (frontend only)
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-supply-peach">
                  Contact
                </p>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">
                    Use this section during your presentation to add team names, email, or Git repo
                    links.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800/70 pt-4 text-[11px] text-slate-500 md:flex-row">
              <p>FreshRoute · Frontend demo (no live backend) · Built for academic/project use</p>
              <p>© {new Date().getFullYear()} FreshRoute Team</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingPage*/


import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import RatingPopup from '../components/common/RatingPopup'

const LandingPage = (): JSX.Element => {
  const [showRating, setShowRating] = useState<boolean>(false)

  interface StepItem {
    title: string
    desc: string
  }

  const howItWorksSteps: StepItem[] = [
    {
      title: 'Browse nearby vendors',
      desc: 'Search by category or vendor and see live pricing from multiple markets.',
    },
    {
      title: 'Place your order',
      desc: 'Add items to cart, choose your address and delivery time slot.',
    },
    {
      title: 'Track your delivery',
      desc: 'Follow your order status from confirmation to delivery.',
    },
  ]

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
    <div className="flex min-h-screen flex-col bg-supply-charcoal text-supply-ash">
      <Navbar variant="public" />

      {showRating && (
        <RatingPopup
          sellerName="Green Market"
          orderId="ORD-2024-042"
          itemCount={8}
          onSubmit={(ratings, comment) => {
            console.log('ratings:', ratings, 'comment:', comment)
            setShowRating(false)
          }}
          onSkip={() => setShowRating(false)}
        />
      )}

      <main className="relative flex-1 overflow-hidden">
        <section className="relative flex min-h-screen w-full justify-center bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4 py-12 md:py-20">
          <div className="flex w-full max-w-6xl flex-col gap-10 md:flex-row md:items-center">
            <div className="flex-1 space-y-6">
              <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-medium tracking-[0.3em] text-supply-paper/80 ring-1 ring-white/20">
                FRESH FROM LOCAL MARKETS
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-50 md:text-5xl">
                Seamless supply chains,
                <span className="text-primary-dark"> powered by FreshRoute</span>.
              </h1>
              <p className="max-w-xl text-sm text-slate-300 md:text-base">
                Discover trusted local vendors, compare prices in real time, and get fresh fruits, vegetables, and essentials
                delivered to your doorstep.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowRating(true)}
                  className="rounded-full bg-primary-dark px-6 py-2 text-sm font-medium text-supply-paper hover:bg-primary-dark/80"
                >
                  Start Ordering
                </button>
                <Link
                  to="/signup/vendor"
                  className="rounded-full border border-supply-ash/40 px-6 py-2 text-sm font-medium text-supply-ash hover:bg-white/10"
                >
                  Become a Vendor
                </Link>
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

            <div className="flex-1">
              <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] font-medium text-supply-peach">Today&apos;s picks</p>
                    <p className="mt-1 text-lg font-semibold text-supply-paper">Fresh veggies</p>
                    <p className="mt-2 text-[11px] text-slate-300">Handpicked from local markets each morning.</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="rounded-2xl border border-supply-teal/40 bg-supply-teal/30 p-3">
                      <p className="text-[11px] font-medium text-white">Average delivery</p>
                      <p className="text-lg font-semibold text-slate-50">32 min</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-supply-deep/70 p-3 text-slate-50">
                      <p className="text-[11px] font-medium text-supply-peach">On-time rate</p>
                      <p className="text-lg font-semibold text-supply-peach">96%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-xs text-slate-300">
                  <p className="font-semibold text-slate-50">Why FreshRoute?</p>
                  <p className="mt-1 text-slate-300">
                    We connect you directly with trusted local vendors — no middlemen, just fresh produce delivered fast to your doorstep.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="relative flex w-full justify-center bg-gradient-to-tr from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-12 md:py-16"
        >
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-center text-xl font-semibold text-slate-50 md:text-2xl">
              How FreshRoute works
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {howItWorksSteps.map((item: StepItem) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <p className="text-sm font-semibold text-slate-50">{item.title}</p>
                  <p className="mt-2 text-xs text-slate-300 md:text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-supply-teal/30 via-supply-teal/60 to-supply-teal/45 px-4 py-12 text-slate-50">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row">
            <div className="flex-1 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">
                For every role
              </p>
              <h2 className="text-xl font-semibold md:text-2xl">Who is FreshRoute built for?</h2>
              <p className="text-sm text-slate-300">
                FreshRoute serves buyers, sellers, and admins — each with their own tailored experience on the same platform.
              </p>
            </div>
            <div className="grid flex-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-supply-teal">BUYERS</p>
                <p className="mt-2 text-sm font-semibold text-supply-paper">Order fresh produce</p>
                <p className="mt-2 text-slate-300">
                  Browse products, add to cart, and get fresh groceries delivered to your door.
                </p>
                <Link to="/products" className="mt-3 inline-flex text-[11px] font-semibold text-primary-light hover:text-supply-peach">
                  Open buyer demo →
                </Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-supply-peach">SELLERS</p>
                <p className="mt-2 text-sm font-semibold text-supply-paper">Manage inventory</p>
                <p className="mt-2 text-slate-300">
                  Vendors can add products, update prices per kg, adjust stock, and toggle availability all in one place.
                </p>
                <Link to="/seller/login" className="mt-3 inline-flex text-[11px] font-semibold text-primary-light hover:text-supply-peach">
                  Open seller demo →
                </Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-supply-orange">ADMINS</p>
                <p className="mt-2 text-sm font-semibold text-supply-paper">Oversee the network</p>
                <p className="mt-2 text-slate-300">
                  Monitor users, manage delivery routes, track payments and keep the platform running smoothly.
                </p>
                <span className="mt-3 inline-flex text-[11px] font-semibold text-primary-light">
                  Admin login
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-brand-background/40 shadow-sm shadow-black/40 backdrop-blur-xl px-4 py-10 text-xs text-slate-300">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-supply-paper">FreshRoute</p>
                <p className="text-[11px] text-slate-400">
                  A fresh produce marketplace connecting local vendors with buyers across the city.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-supply-peach">Product</p>
                <div className="flex flex-col gap-1">
                  <Link to="/products" className="hover:text-supply-teal">Buyer experience</Link>
                  <Link to="/seller/login" className="hover:text-supply-teal">Seller dashboard</Link>
                  <Link to="/admin/login" className="hover:text-supply-teal">Admin console</Link>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-supply-peach">Project</p>
                <div className="flex flex-col gap-1">
                  <a href="#how-it-works" className="hover:text-supply-teal">How it works</a>
                  <span className="text-slate-500">Stack: React, TypeScript, Vite, Tailwind CSS, Redux (frontend only)</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-supply-peach">Contact</p>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">freshroute@gmail.com</span>
                  <span className="text-slate-400">Colombo, Sri Lanka</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800/70 pt-4 text-[11px] text-slate-500 md:flex-row">
              <p>FreshRoute · Connecting local vendors with buyers across Sri Lanka</p>
              <p>© {new Date().getFullYear()} FreshRoute Team</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingPage