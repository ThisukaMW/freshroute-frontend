import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

const SignUpCustomerPage = (): JSX.Element => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Frontend-only signup → log the user in as buyer
    login('demo-token', {
      id: 'buyer-demo',
      name: fullName || 'New Buyer',
      email,
      role: 'buyer',
    })
    navigate('/products')
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.4),_transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.35),_transparent_55%)] blur-3xl" />
      </div>
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8  backdrop-blur-2xl">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold text-slate-50">Sign up as Customer</h1>
            <p className="text-sm text-slate-300">Create an account to order from local vendors through FreshRoute.</p>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-200">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                placeholder="John Perera"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Phone number</label>
              <input
                type="tel"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                placeholder="+94 71 234 5678"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">City</label>
              <select className="w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2">
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Jaffna</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Address (short)</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                placeholder="No. 12, Flower Road"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                placeholder="Create a strong password"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Confirm password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                placeholder="Repeat your password"
              />
            </div>

            <div className="mt-2 flex items-start gap-2 md:col-span-2">
              <input type="checkbox" className="mt-1 h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400" />
              <p className="text-xs text-slate-300">
                I agree to the{' '}
                <button type="button" className="text-emerald-400 underline">
                  Terms & Conditions
                </button>{' '}
                of FreshRoute.
              </p>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Create Customer Account
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SignUpCustomerPage
