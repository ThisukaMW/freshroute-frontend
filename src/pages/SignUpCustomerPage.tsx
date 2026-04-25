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
  const [showPasswordHints, setShowPasswordHints] = useState(false)

  const strength = getPasswordStrength(password)
  const passwordErrors = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) { setError('Full name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }
    if (!isValidEmail(email)) { setError('Please enter a valid email address'); return }
    if (passwordErrors.length > 0) {
      setError('Please fix password requirements')
      setShowPasswordHints(true)
      return
    }
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
        name:    data.user.name,
        email:   data.user.email,
        phone:   data.user.phone ?? phone,
        city:    data.user.city ?? city,
        address: data.user.address ?? address,
      }))

      const role = data.user.role?.toLowerCase() ?? 'buyer'

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
              <label className="block text-xs font-medium text-slate-200">Full name <span className="text-red-400">*</span></label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} placeholder="John Perera" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Email <span className="text-red-400">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
              {email && !isValidEmail(email) && <p className="text-[10px] text-red-400">✕ Please enter a valid email address</p>}
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

            {/* Password with strength meter */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Password</label>
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
                  {/* strength bar */}
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
                  {/* hints */}
                  {showPasswordHints && passwordErrors.length > 0 && (
                    <ul className="space-y-0.5">
                      {passwordErrors.map((err) => (
                        <li key={err} className="flex items-center gap-1 text-[10px] text-red-400">
                          <span>✕</span> {err}
                        </li>
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
              <label className="block text-xs font-medium text-slate-200">Confirm password</label>
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
                disabled={loading || passwordErrors.length > 0 || password !== confirmPassword}
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