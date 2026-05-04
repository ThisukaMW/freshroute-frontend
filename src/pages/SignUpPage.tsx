import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import { useDispatch } from 'react-redux'
import { setBuyerProfile, setSellerProfile } from '../store/slices/userSlice'
import { setCredentials } from '../store/slices/authSlice'
import { registerCustomer, registerVendor } from '../services/authService'
import { useToast } from '../context/ToastContext'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500'     }
  if (score === 2) return { score, label: 'Fair',   color: 'bg-yellow-500'  }
  if (score === 3) return { score, label: 'Good',   color: 'bg-blue-500'    }
  return             { score, label: 'Strong', color: 'bg-emerald-500'  }
}

const validatePassword = (pwd: string): string[] => {
  const errors: string[] = []
  if (pwd.length < 8)             errors.push('At least 8 characters')
  if (!/[A-Z]/.test(pwd))         errors.push('At least 1 uppercase letter')
  if (!/[0-9]/.test(pwd))         errors.push('At least 1 number')
  if (!/[^A-Za-z0-9]/.test(pwd))  errors.push('At least 1 special character (!@#$...)')
  return errors
}

const roleRedirectMap: Record<string, string> = {
  buyer:       '/buyer/products',
  seller:      '/seller',
  driver:      '/driver/dashboard',
  admin:       '/admin/dashboard',
  field_admin: '/field-admin/dashboard',
}

// ─── Shared sub-components ───────────────────────────────────────────────────

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 ring-emerald-500/60'

const selectClass =
  'w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 ring-emerald-500/60'

interface PasswordFieldProps {
  value: string
  onChange: (v: string) => void
  showHints: boolean
  setShowHints: (v: boolean) => void
  label?: string
}

const PasswordField = ({ value, onChange, showHints, setShowHints, label = 'Password' }: PasswordFieldProps) => {
  const strength      = getPasswordStrength(value)
  const passwordErrors = validatePassword(value)

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-200">
        {label} <span className="text-red-400">*</span>
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowHints(true) }}
        required
        className={inputClass}
        placeholder="Create a strong password"
      />
      {value && (
        <div className="mt-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-white/10'}`}
                />
              ))}
            </div>
            <span className={`text-[10px] font-medium ${
              strength.score <= 1 ? 'text-red-400'
              : strength.score === 2 ? 'text-yellow-400'
              : strength.score === 3 ? 'text-blue-400'
              : 'text-emerald-400'
            }`}>
              {strength.label}
            </span>
          </div>
          {showHints && passwordErrors.length > 0 && (
            <ul className="space-y-0.5">
              {passwordErrors.map((err) => (
                <li key={err} className="flex items-center gap-1 text-[10px] text-red-400">
                  <span>✕</span> {err}
                </li>
              ))}
            </ul>
          )}
          {passwordErrors.length === 0 && (
            <p className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span>✓</span> Password looks great!
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface ConfirmPasswordFieldProps {
  value: string
  onChange: (v: string) => void
  password: string
}

const ConfirmPasswordField = ({ value, onChange, password }: ConfirmPasswordFieldProps) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-slate-200">
      Confirm password <span className="text-red-400">*</span>
    </label>
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className={inputClass}
      placeholder="Repeat your password"
    />
    {value && value !== password && (
      <p className="mt-1 text-[10px] text-red-400">✕ Passwords do not match</p>
    )}
    {value && value === password && (
      <p className="mt-1 text-[10px] text-emerald-400">✓ Passwords match</p>
    )}
  </div>
)

const CitySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-slate-200">City</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
      <option>Colombo</option>
      <option>Kandy</option>
      <option>Galle</option>
      <option>Jaffna</option>
    </select>
  </div>
)

// ─── Customer form ────────────────────────────────────────────────────────────

interface CustomerFormProps {
  onSuccess: (data: any) => void
  onError:   (msg: string) => void
}

const CustomerForm = ({ onSuccess, onError }: CustomerFormProps) => {
  const [fullName,         setFullName]         = useState('')
  const [email,            setEmail]            = useState('')
  const [phone,            setPhone]            = useState('')
  const [city,             setCity]             = useState('Colombo')
  const [address,          setAddress]          = useState('')
  const [password,         setPassword]         = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')
  const [loading,          setLoading]          = useState(false)
  const [showPasswordHints,setShowPasswordHints]= useState(false)

  const passwordErrors = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim())         { onError('Full name is required');              return }
    if (!email.trim())            { onError('Email is required');                  return }
    if (!isValidEmail(email))     { onError('Please enter a valid email address'); return }
    if (passwordErrors.length > 0){ onError('Please fix password requirements'); setShowPasswordHints(true); return }
    if (password !== confirmPassword) { onError('Passwords do not match');         return }

    setLoading(true)
    try {
      const data = await registerCustomer({ name: fullName, email, password, phone, city, address })
      onSuccess({ ...data, _meta: { phone, city, address } })
    } catch (err: any) {
      onError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      {/* Full name */}
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-slate-200">
          Full name <span className="text-red-400">*</span>
        </label>
        <input
          type="text" value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required className={inputClass} placeholder="John Perera"
        />
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          required className={inputClass} placeholder="you@example.com"
        />
        {email && !isValidEmail(email) && (
          <p className="text-[10px] text-red-400">✕ Please enter a valid email address</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">Phone number</label>
        <input
          type="tel" value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass} placeholder="+94 71 234 5678"
        />
      </div>

      {/* City */}
      <CitySelect value={city} onChange={setCity} />

      {/* Address */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">Address</label>
        <input
          type="text" value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass} placeholder="No. 12, Flower Road"
        />
      </div>

      {/* Password */}
      <PasswordField
        value={password} onChange={setPassword}
        showHints={showPasswordHints} setShowHints={setShowPasswordHints}
      />

      {/* Confirm password */}
      <ConfirmPasswordField value={confirmPassword} onChange={setConfirmPassword} password={password} />

      {/* T&C */}
      <div className="mt-2 flex items-start gap-2 md:col-span-2">
        <input
          type="checkbox" required
          className="mt-1 h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400"
        />
        <p className="text-xs text-slate-300">
          I agree to the{' '}
          <button type="button" className="text-emerald-400 underline">Terms & Conditions</button>{' '}
          of FreshRoute.
        </p>
      </div>

      {/* Submit */}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading || passwordErrors.length > 0 || password !== confirmPassword}
          className="mt-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create Customer Account'}
        </button>
      </div>
    </form>
  )
}

// ─── Vendor form ──────────────────────────────────────────────────────────────

interface VendorFormProps {
  onSuccess: (data: any) => void
  onError:   (msg: string) => void
}

const VendorForm = ({ onSuccess, onError }: VendorFormProps) => {
  const [businessName,      setBusinessName]      = useState('')
  const [ownerName,         setOwnerName]         = useState('')
  const [email,             setEmail]             = useState('')
  const [phone,             setPhone]             = useState('')
  const [businessAddress,   setBusinessAddress]   = useState('')
  const [city,              setCity]              = useState('Colombo')
  const [password,          setPassword]          = useState('')
  const [confirmPassword,   setConfirmPassword]   = useState('')
  const [agreedToPolicy,    setAgreedToPolicy]    = useState(false)
  const [loading,           setLoading]           = useState(false)
  const [showPasswordHints, setShowPasswordHints] = useState(false)

  const passwordErrors = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!businessName.trim())     { onError('Business name is required');          return }
    if (!ownerName.trim())        { onError('Owner name is required');             return }
    if (!email.trim())            { onError('Email is required');                  return }
    if (!isValidEmail(email))     { onError('Please enter a valid email address'); return }
    if (!businessAddress.trim())  { onError('Business address is required');       return }
    if (passwordErrors.length > 0){ onError('Please fix password requirements'); setShowPasswordHints(true); return }
    if (password !== confirmPassword) { onError('Passwords do not match');         return }
    if (!agreedToPolicy)          { onError('You must agree to the vendor policy'); return }

    setLoading(true)
    try {
      const data = await registerVendor({
        businessName, ownerName, email, phone, password, confirmPassword,
        businessAddress, city, agreedToPolicy,
      })
      onSuccess({ ...data, _meta: { businessName, ownerName, businessAddress, phone, city } })
    } catch (err: any) {
      onError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      {/* Business name */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">
          Business name <span className="text-red-400">*</span>
        </label>
        <input
          type="text" value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required className={inputClass} placeholder="Green Market"
        />
      </div>

      {/* Owner name */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">
          Owner full name <span className="text-red-400">*</span>
        </label>
        <input
          type="text" value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required className={inputClass} placeholder="Kamal Perera"
        />
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          required className={inputClass} placeholder="store@example.com"
        />
        {email && !isValidEmail(email) && (
          <p className="text-[10px] text-red-400">✕ Please enter a valid email address</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">Phone number</label>
        <input
          type="tel" value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass} placeholder="+94 77 123 4567"
        />
      </div>

      {/* Business address */}
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-slate-200">
          Business address <span className="text-red-400">*</span>
        </label>
        <input
          type="text" value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          required className={inputClass} placeholder="No. 45, Market Street, Colombo"
        />
      </div>

      {/* City */}
      <CitySelect value={city} onChange={setCity} />

      {/* Password */}
      <PasswordField
        value={password} onChange={setPassword}
        showHints={showPasswordHints} setShowHints={setShowPasswordHints}
      />

      {/* Confirm password */}
      <ConfirmPasswordField value={confirmPassword} onChange={setConfirmPassword} password={password} />

      {/* Vendor policy */}
      <div className="mt-2 flex items-start gap-2 md:col-span-2">
        <input
          type="checkbox"
          checked={agreedToPolicy}
          onChange={(e) => setAgreedToPolicy(e.target.checked)}
          className="mt-1 h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400"
        />
        <p className="text-xs text-slate-300">
          I agree to the FreshRoute Vendor Policy and understand that orders and payouts are managed by the platform.
        </p>
      </div>

      {/* Submit */}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading || passwordErrors.length > 0 || password !== confirmPassword}
          className="mt-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Registering...' : 'Register Vendor Account'}
        </button>
      </div>
    </form>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

/**
 * Unified signup page for both customers and vendors.
 *
 * Route: /signup/:role  (role = "customer" | "vendor")
 *
 * The role param drives which form and copy is rendered.
 * The role selector lives on /signup (RoleSelectPage) — untouched.
 *
 * Landing page CTAs should link directly:
 *   "Start Ordering"  → /signup/customer
 *   "Become a Vendor" → /signup/vendor
 */
const SignUpPage = (): JSX.Element => {
  const { role }    = useParams<{ role: string }>()
  const navigate    = useNavigate()
  const dispatch    = useDispatch()
  const { login }   = useAuth()
  const { showToast } = useToast()

  const isVendor = role === 'vendor'

  const [error, setError] = useState('')

  const handleError = (msg: string) => {
    setError(msg)
    showToast(msg, 'error')
  }

  const handleSuccess = (data: any) => {
    const resolvedRole = data.user.role?.toLowerCase() ?? (isVendor ? 'seller' : 'buyer')

    dispatch(setCredentials({
      user:  { id: data.user.id, email: data.user.email, name: data.user.name },
      token: data.token,
    }))

    if (isVendor) {
      const { businessName, ownerName, businessAddress, phone, city } = data._meta
      dispatch(setSellerProfile({ ownerName, email: data.user.email, businessName, businessAddress, phone, city }))
    } else {
      const { phone, city, address } = data._meta
      dispatch(setBuyerProfile({ name: data.user.name, email: data.user.email, phone, city, address }))
    }

    login(data.token, { id: data.user.id, name: data.user.name, email: data.user.email, role: resolvedRole })
    showToast('Welcome to FreshRoute! 🎉')
    navigate(roleRedirectMap[resolvedRole] ?? '/')
  }

  // Guard: unknown role → redirect to role picker
  if (role !== 'customer' && role !== 'vendor') {
    navigate('/signup')
    return <></>
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <Navbar variant="public" />

      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">

          {/* Header */}
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold text-slate-50">
              {isVendor ? 'Register as Vendor' : 'Sign up as Customer'}
            </h1>
            <p className="text-sm text-slate-300">
              {isVendor
                ? 'Create a store to list your products, manage orders and track earnings.'
                : 'Create an account to order from local vendors through FreshRoute.'}
            </p>
          </div>

          {/* Vendor info banner */}
          {isVendor && (
            <div className="mb-5 rounded-2xl border border-supply-teal/40 bg-gradient-to-r from-supply-teal/20 via-supply-peach/20 to-supply-orange/20 p-3 text-[11px] text-supply-paper/80 backdrop-blur-xl">
              Fill in your business details to get started as a vendor on FreshRoute.
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Form — swaps based on role */}
          {isVendor
            ? <VendorForm   onSuccess={handleSuccess} onError={handleError} />
            : <CustomerForm onSuccess={handleSuccess} onError={handleError} />
          }

          {/* Switch role link */}
          <p className="mt-4 text-center text-xs text-slate-400">
            {isVendor ? 'Want to order instead? ' : 'Want to sell instead? '}
            <Link
              to={isVendor ? '/signup/customer' : '/signup/vendor'}
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              {isVendor ? 'Sign up as a Customer' : 'Register as a Vendor'}
            </Link>
          </p>

          <p className="mt-2 text-center text-xs text-slate-400">
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

export default SignUpPage