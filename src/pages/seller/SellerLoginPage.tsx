/*import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDispatch } from 'react-redux'
import { setSellerProfile } from '../../store/slices/userSlice'
import Navbar from '../../components/Navbar'

const SellerLoginPage = (): JSX.Element => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const dispatch = useDispatch()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login('demo-token', {
      id: 'seller-demo',
      name: 'Demo Vendor',
      email,
      role: 'seller',
    })
    dispatch(setSellerProfile({
      ownerName: 'Demo Vendor',
      email,
      businessName: email.split('@')[0],
      businessAddress: '',
      phone: '',
      city: 'Colombo',
    }))
    navigate('/seller')
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.4),_transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.35),_transparent_55%)] blur-3xl" />
      </div>
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <div className="mb-6 space-y-1 text-center">
            <h2 className="text-xl font-semibold text-slate-50">Vendor login</h2>
            <p className="text-xs text-slate-400">Sign in to manage your FreshRoute store.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Business email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
                placeholder="store@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
              Sign in as vendor
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            New to FreshRoute?{' '}
            <Link to="/signup/vendor" className="font-medium text-emerald-400 hover:text-emerald-300">Register as vendor</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SellerLoginPage*/