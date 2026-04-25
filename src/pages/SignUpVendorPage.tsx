import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDispatch } from 'react-redux'
import { setSellerProfile } from '../store/slices/userSlice'
import { setCredentials } from '../store/slices/authSlice'
import { registerVendor } from '../services/authService'
import Navbar from '../components/Navbar'
import { useToast } from '../context/ToastContext'

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score === 2) return { score, label: 'Fair', color: 'bg-yellow-500' }
  if (score === 3) return { score, label: 'Good', color: 'bg-blue-500' }
  return { score, label: 'Strong', color: 'bg-emerald-500' }
}

const validatePassword = (pwd: string): string[] => {
  const errors: string[] = []
  if (pwd.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(pwd)) errors.push('At least 1 uppercase letter')
  if (!/[0-9]/.test(pwd)) errors.push('At least 1 number')
  if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('At least 1 special character (!@#$...)')
  return errors
}

// Role-based redirect map — frontend owns navigation, not the backend
const roleRedirectMap: Record<string, string> = {
  buyer:       '/buyer/products',
  seller:      '/seller',
  driver:      '/driver/dashboard',
  admin:       '/admin/dashboard',
  field_admin: '/field-admin/dashboard',
}

const SignUpVendorPage = (): JSX.Element => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const dispatch = useDispatch()
  const { showToast } = useToast()

  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [city, setCity] = useState('Colombo')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordHints, setShowPasswordHints] = useState(false)

  const strength = getPasswordStrength(password)
  const passwordErrors = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!businessName.trim()) { setError('Business name is required'); return }
    if (!ownerName.trim()) { setError('Owner name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }
    if (!isValidEmail(email)) { setError('Please enter a valid email address'); return }
    if (!businessAddress.trim()) { setError('Business address is required'); return }
    if (passwordErrors.length > 0) {
      setError('Please fix password requirements')
      setShowPasswordHints(true)
      return
    }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (!agreedToPolicy) { setError('You must agree to the vendor policy'); return }

    setLoading(true)
    try {
      const data = await registerVendor({
        businessName, ownerName, email, phone, password, confirmPassword,
        businessAddress, city, agreedToPolicy,
      })

      dispatch(setCredentials({
        user: { id: data.user.id, email: data.user.email, name: data.user.name },
        token: data.token,
      }))

      dispatch(setSellerProfile({
        ownerName, email: data.user.email, businessName, businessAddress, phone, city,
      }))

      const role = data.user.role?.toLowerCase() ?? 'seller'

      login(data.token, {
        id:    data.user.id,
        name:  data.user.name,
        email: data.user.email,
        role,
      })

      showToast('Welcome to FreshRoute! 🎉')

      // Frontend decides where to navigate based on role
      navigate(roleRedirectMap[role] ?? '/')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Registration failed. Please try again.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-slate-50">Register as Vendor</h1>
              <p className="mt-1 text-sm text-slate-300">Create a store to list your products, manage orders and track earnings.</p>
            </div>
            <div className="rounded-2xl border border-supply-teal/40 bg-gradient-to-r from-supply-teal/20 via-supply-peach/20 to-supply-orange/20 text-[11px] text-supply-paper/80 backdrop-blur-xl p-3">
              Fill in your business details to get started as a vendor on FreshRoute.
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Business name <span className="text-red-400">*</span></label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className={inputClass} placeholder="Green Market" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Owner full name <span className="text-red-400">*</span></label>
              <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required className={inputClass} placeholder="Kamal Perera" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Email <span className="text-red-400">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="store@example.com" />
              {email && !isValidEmail(email) && <p className="text-[10px] text-red-400">✕ Please enter a valid email address</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+94 77 123 4567" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-200">Business address <span className="text-red-400">*</span></label>
              <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} required className={inputClass} placeholder="No. 45, Market Street, Colombo" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2">
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Jaffna</option>
              </select>
            </div>

            {/* Password with strength meter */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Password <span className="text-red-400">*</span></label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setShowPasswordHints(true) }}
                required
                className={inputClass}
                placeholder="Create a strong password"
              />
              {password && (
                <div className="space-y-1.5 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <span className={`text-[10px] font-medium ${strength.score <= 1 ? 'text-red-400' : strength.score === 2 ? 'text-yellow-400' : strength.score === 3 ? 'text-blue-400' : 'text-emerald-400'}`}>
                      {strength.label}
                    </span>
                  </div>
                  {showPasswordHints && passwordErrors.length > 0 && (
                    <ul className="space-y-0.5">
                      {passwordErrors.map((err) => (
                        <li key={err} className="flex items-center gap-1 text-[10px] text-red-400"><span>✕</span> {err}</li>
                      ))}
                    </ul>
                  )}
                  {passwordErrors.length === 0 && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1"><span>✓</span> Password looks great!</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Confirm password <span className="text-red-400">*</span></label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputClass}
                placeholder="Repeat your password"
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-red-400 mt-1">✕ Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="text-[10px] text-emerald-400 mt-1">✓ Passwords match</p>
              )}
            </div>

            <div className="mt-2 flex items-start gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="mt-1 h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400"
              />
              <p className="text-xs text-slate-300">I agree to the FreshRoute Vendor Policy and understand that orders and payouts are managed by the platform.</p>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading || passwordErrors.length > 0 || password !== confirmPassword}
                className="mt-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register Vendor Account'}
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

export default SignUpVendorPage