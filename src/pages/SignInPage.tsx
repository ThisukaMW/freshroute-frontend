import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import { useDispatch } from 'react-redux'
import { setBuyerProfile, setSellerProfile } from '../store/slices/userSlice'
import { setCredentials } from '../store/slices/authSlice'
import { loginCustomer } from '../services/authService'

const SignInPage = (): JSX.Element => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // try buyer login first, if role comes back as seller handle accordingly
      const data = await loginCustomer({ email, password })
      const role = data.user.role?.toLowerCase()

      dispatch(setCredentials({
        user: { id: data.user.id, email: data.user.email, name: data.user.name },
        token: data.token,
      }))

      login(data.token, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role,
      })

      if (role === 'seller') {
        dispatch(setSellerProfile({
          ownerName: data.user.name,
          email: data.user.email,
          businessName: data.user.sellerProfile?.businessName ?? '',
          businessAddress: data.user.sellerProfile?.businessAddress ?? '',
          phone: data.user.phone ?? '',
          city: data.user.city ?? 'Colombo',
        }))
        navigate('/seller')
      } else {
        dispatch(setBuyerProfile({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone ?? '',
          city: data.user.city ?? 'Colombo',
          address: data.user.address ?? '',
        }))
        navigate('/buyer/products')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2">

          <div className="hidden flex-col justify-center md:flex">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500/80 via-emerald-400/60 to-accent-blue/70 p-[1px]">
              <div className="h-full rounded-3xl bg-slate-950/80 px-6 py-8 text-slate-50 backdrop-blur-2xl">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-200">FreshRoute for customers</p>
                <h1 className="mt-4 text-2xl font-semibold leading-tight md:text-3xl">
                  Fresh groceries, delivered straight from your favorite local vendors.
                </h1>
                <p className="mt-4 text-sm text-slate-300">
                  Sign in to browse products, place orders and track deliveries from local vendors.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
                    <p className="text-emerald-300">Role-based access</p>
                    <p className="mt-1 text-slate-200">Customer, vendor and admin views.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
                    <p className="text-emerald-300">Modern UI</p>
                    <p className="mt-1 text-slate-200">Built with React and Tailwind CSS.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="mb-6 space-y-1 text-center">
                <h2 className="text-xl font-semibold text-slate-50">Welcome back</h2>
                <p className="text-xs text-slate-400">Sign in to continue to your FreshRoute workspace.</p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-200">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-slate-200">Password</label>
                    <Link to="/forgot-password" className="text-emerald-400 hover:text-emerald-300">Forgot password?</Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400" />
                    <span>Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-700">Sign up</Link>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default SignInPage