import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import { useDispatch } from 'react-redux'
import { setBuyerProfile } from '../store/slices/userSlice'
import { setCredentials } from '../store/slices/authSlice'
import { registerCustomer } from '../services/authService'
import { useToast } from '../context/ToastContext'

const SignUpCustomerPage = (): JSX.Element => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { login } = useAuth()
  const { showToast } = useToast()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Colombo')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const data = await registerCustomer({ name: fullName, email, password, phone, city, address })

      dispatch(setCredentials({
        user: { id: data.user.id, email: data.user.email, name: data.user.name },
        token: data.token,
      }))

      dispatch(setBuyerProfile({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone ?? phone,
        city: data.user.city ?? city,
        address: data.user.address ?? address,
      }))

      login(data.token, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role?.toLowerCase(),
      })

      showToast('Welcome to FreshRoute! 🎉')
      navigate('/buyer/products')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Registration failed. Please try again.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2"

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">

          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold text-slate-50">Sign up as Customer</h1>
            <p className="text-sm text-slate-300">Create an account to order from local vendors through FreshRoute.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-200">Full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} placeholder="John Perera" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+94 71 234 5678" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2">
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Jaffna</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="No. 12, Flower Road" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} placeholder="Create a strong password" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Confirm password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} placeholder="Repeat your password" />
            </div>
            <div className="mt-2 flex items-start gap-2 md:col-span-2">
              <input type="checkbox" required className="mt-1 h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400" />
              <p className="text-xs text-slate-300">
                I agree to the{' '}
                <button type="button" className="text-emerald-400 underline">Terms & Conditions</button>{' '}
                of FreshRoute.
              </p>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Customer Account'}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-emerald-400 hover:text-emerald-300">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SignUpCustomerPage