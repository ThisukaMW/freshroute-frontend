// SignUpPage.tsx
// Handles both customer AND vendor registration in one file.
// The URL param :role decides which form to show — /signup/customer or /signup/vendor.

import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import Navbar from '../components/Navbar'
import { registerCustomer, registerVendor } from '../services/authService'
import { useToast } from '../context/ToastContext'

// Returns true if the email looks valid (has an @ and a dot after it).
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Scores how strong a password is from 0 (terrible) to 4 (strong).
// Also returns a label ("Weak" / "Fair" / "Good" / "Strong") and a colour for the strength bar.
const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0
  if (pwd.length >= 8)            score++ // Long enough.
  if (/[A-Z]/.test(pwd))          score++ // Has an uppercase letter.
  if (/[0-9]/.test(pwd))          score++ // Has a number.
  if (/[^A-Za-z0-9]/.test(pwd))   score++ // Has a special character.
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500'    }
  if (score === 2) return { score, label: 'Fair',   color: 'bg-yellow-500' }
  if (score === 3) return { score, label: 'Good',   color: 'bg-blue-500'   }
  return             { score, label: 'Strong', color: 'bg-emerald-500' }
}

// Returns a list of things wrong with the password (empty list = password is fine).
const validatePassword = (pwd: string): string[] => {
  const errors: string[] = []
  if (pwd.length < 8)             errors.push('At least 8 characters')
  if (!/[A-Z]/.test(pwd))         errors.push('At least 1 uppercase letter')
  if (!/[0-9]/.test(pwd))         errors.push('At least 1 number')
  if (!/[^A-Za-z0-9]/.test(pwd))  errors.push('At least 1 special character (!@#$...)')
  return errors
}

// Shared Tailwind class strings so every input looks the same.
const inputClass  = 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 ring-emerald-500/60'
const selectClass = 'w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 ring-emerald-500/60'

// Shows an eye icon — open eye when show=true (password visible), slashed eye when show=false.
const EyeIcon = ({ show }: { show: boolean }) => show ? (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
) : (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

interface PasswordFieldProps {
  value: string
  onChange: (v: string) => void
  showHints: boolean
  setShowHints: (v: boolean) => void
  label?: string
}

// A reusable password input with a show/hide toggle, a strength bar, and error hints.
// showHints controls whether the error list is visible (only shown after the user starts typing).
const PasswordField = ({ value, onChange, showHints, setShowHints, label = 'Password' }: PasswordFieldProps) => {
  // Controls whether the password text is visible or hidden.
  const [showPassword, setShowPassword] = useState(false)
  const strength       = getPasswordStrength(value)
  const passwordErrors = validatePassword(value)

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-200">
        {label} <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          // Turns on the hint list as soon as the user starts typing.
          onChange={(e) => { onChange(e.target.value); setShowHints(true) }}
          required
          className={inputClass}
          placeholder="Create a strong password"
        />
        {/* Toggles the password visibility when clicked. tabIndex=-1 keeps it out of tab order. */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <EyeIcon show={showPassword} />
        </button>
      </div>

      {/* Only shows the strength bar and hints once the user has typed something. */}
      {value && (
        <div className="mt-1 space-y-1.5">
          {/* Four small bar segments — filled up to the current strength score. */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
              ))}
            </div>
            <span className={`text-[10px] font-medium ${
              strength.score <= 1 ? 'text-red-400' : strength.score === 2 ? 'text-yellow-400' : strength.score === 3 ? 'text-blue-400' : 'text-emerald-400'
            }`}>{strength.label}</span>
          </div>
          {/* Shows each failing rule as a red error. Hidden until showHints is true. */}
          {showHints && passwordErrors.length > 0 && (
            <ul className="space-y-0.5">
              {passwordErrors.map((err) => (
                <li key={err} className="flex items-center gap-1 text-[10px] text-red-400"><span>✕</span> {err}</li>
              ))}
            </ul>
          )}
          {/* Shows a green success message when all rules pass. */}
          {passwordErrors.length === 0 && (
            <p className="flex items-center gap-1 text-[10px] text-emerald-400"><span>✓</span> Password looks great!</p>
          )}
        </div>
      )}
    </div>
  )
}

// A "confirm password" input that shows a green tick when it matches and a red error when it doesn't.
const ConfirmPasswordField = ({ value, onChange, password }: { value: string; onChange: (v: string) => void; password: string }) => {
  // Controls whether the confirm password text is visible or hidden.
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-200">
        Confirm password <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className={inputClass}
          placeholder="Repeat your password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <EyeIcon show={showPassword} />
        </button>
      </div>
      {/* Red error if the two passwords don't match yet. */}
      {value && value !== password && <p className="mt-1 text-[10px] text-red-400">✕ Passwords do not match</p>}
      {/* Green tick once they match. */}
      {value && value === password  && <p className="mt-1 text-[10px] text-emerald-400">✓ Passwords match</p>}
    </div>
  )
}

// A simple dropdown for picking a city. Only shows the four cities FreshRoute operates in.
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

// The sign-up form for a new customer. Validates all fields before calling the API.
// onSuccess = called when registration works (navigates to pending-approval).
// onError   = called when something goes wrong (shows a toast + inline error).
const CustomerForm = ({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) => {
  const [fullName, setFullName]                   = useState('')
  const [email, setEmail]                         = useState('')
  const [phone, setPhone]                         = useState('')
  const [city, setCity]                           = useState('Colombo')
  const [address, setAddress]                     = useState('')
  const [password, setPassword]                   = useState('')
  const [confirmPassword, setConfirmPassword]     = useState('')
  const [loading, setLoading]                     = useState(false)
  const [showPasswordHints, setShowPasswordHints] = useState(false)

  const passwordErrors = validatePassword(password)

  // Validates all fields and sends the registration data to the backend.
  // Stops early and calls onError with a message if any field is wrong.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim())             { onError('Full name is required');              return }
    if (!email.trim())                { onError('Email is required');                  return }
    if (!isValidEmail(email))         { onError('Please enter a valid email address'); return }
    if (!address.trim())              { onError('Address is required');                return }  
    if (passwordErrors.length > 0)    { onError('Please fix password requirements'); setShowPasswordHints(true); return }
    if (password !== confirmPassword) { onError('Passwords do not match');             return }

    setLoading(true)
    try {
      await registerCustomer({ name: fullName, email, password, phone, city, address })
      onSuccess() // Registration worked — go to the pending approval page.
    } catch (err: any) {
      onError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      {/* Full name — spans both columns on desktop. */}
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-slate-200">Full name <span className="text-red-400">*</span></label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} placeholder="John Perera" />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">Email <span className="text-red-400">*</span></label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
        {/* Inline email format error shown while the user is typing. */}
        {email && !isValidEmail(email) && <p className="text-[10px] text-red-400">✕ Please enter a valid email address</p>}
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">Phone number</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+94 71 234 5678" />
      </div>
      <CitySelect value={city} onChange={setCity} />
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">Address<span className="text-red-400">*</span></label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className={inputClass} placeholder="No. 12, Flower Road" />
      </div>
      <PasswordField value={password} onChange={setPassword} showHints={showPasswordHints} setShowHints={setShowPasswordHints} />
      <ConfirmPasswordField value={confirmPassword} onChange={setConfirmPassword} password={password} />
      <div className="mt-2 flex items-start gap-2 md:col-span-2">
        <input type="checkbox" required className="mt-1 h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400" />
        <p className="text-xs text-slate-300">I agree to the <button type="button" className="text-emerald-400 underline">Terms & Conditions</button> of FreshRoute.</p>
      </div>
      <div className="md:col-span-2">
        {/* Submit button is disabled while loading or while the password still has errors. */}
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

// The sign-up form for a new vendor. Similar to CustomerForm but with business-specific fields.
// onSuccess = called when registration works (navigates to pending-approval).
// onError   = called when something goes wrong (shows a toast + inline error).
const VendorForm = ({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) => {
  const [businessName, setBusinessName]           = useState('')
  const [ownerName, setOwnerName]                 = useState('')
  const [email, setEmail]                         = useState('')
  const [phone, setPhone]                         = useState('')
  const [businessAddress, setBusinessAddress]     = useState('')
  const [city, setCity]                           = useState('Colombo')
  const [password, setPassword]                   = useState('')
  const [confirmPassword, setConfirmPassword]     = useState('')
  const [agreedToPolicy, setAgreedToPolicy]       = useState(false)
  const [loading, setLoading]                     = useState(false)
  const [showPasswordHints, setShowPasswordHints] = useState(false)

  const passwordErrors = validatePassword(password)

  // Validates all vendor-specific fields and sends registration data to the backend.
  // Stops early and calls onError if any required field is missing or invalid.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim())         { onError('Business name is required');           return }
    if (!ownerName.trim())            { onError('Owner name is required');              return }
    if (!email.trim())                { onError('Email is required');                   return }
    if (!isValidEmail(email))         { onError('Please enter a valid email address');  return }
    if (!businessAddress.trim())      { onError('Business address is required');        return }
    if (passwordErrors.length > 0)    { onError('Please fix password requirements'); setShowPasswordHints(true); return }
    if (password !== confirmPassword) { onError('Passwords do not match');              return }
    if (!agreedToPolicy)              { onError('You must agree to the vendor policy'); return }

    setLoading(true)
    try {
      await registerVendor({ businessName, ownerName, email, phone, password, confirmPassword, businessAddress, city, agreedToPolicy })
      onSuccess() // Registration worked — go to the pending approval page.
    } catch (err: any) {
      onError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
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
      {/* Business address — spans both columns on desktop. */}
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-slate-200">Business address <span className="text-red-400">*</span></label>
        <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} required className={inputClass} placeholder="No. 45, Market Street, Colombo" />
      </div>
      <CitySelect value={city} onChange={setCity} />
      <div /> {/* empty spacer to push city to left col only */}
      <PasswordField value={password} onChange={setPassword} showHints={showPasswordHints} setShowHints={setShowPasswordHints} />
      <ConfirmPasswordField value={confirmPassword} onChange={setConfirmPassword} password={password} />
      <div className="mt-2 flex items-start gap-2 md:col-span-2">
        {/* Vendor must tick the policy checkbox — it's tracked in state, not just a HTML required attribute. */}
        <input type="checkbox" checked={agreedToPolicy} onChange={(e) => setAgreedToPolicy(e.target.checked)} className="mt-1 h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400" />
        <p className="text-xs text-slate-300">I agree to the FreshRoute Vendor Policy and understand that orders and payouts are managed by the platform.</p>
      </div>
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

// The main page component. Reads :role from the URL to decide which form to show.
const SignUpPage = (): JSX.Element => {
  const { role }      = useParams<{ role: string }>()  // "customer" or "vendor" from the URL.
  const navigate      = useNavigate()
  const { showToast } = useToast()
  const isVendor      = role === 'vendor'
  const [error, setError] = useState('')

  // Shows the error message both inline on the page and as a toast popup.
  const handleError = (msg: string) => { setError(msg); showToast(msg, 'error') }

  // On success, go to the pending-approval waiting page.
  const handleSuccess = () => { navigate('/pending-approval') }

  // If someone visits /signup/something-random, send them back to /signup to pick a valid role.
  if (role !== 'customer' && role !== 'vendor') {
    navigate('/signup')
    return <></>
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
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
          {/* Warning banner reminding the user that admin approval is needed before they can log in. */}
          <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            ⏳ All new accounts require admin approval before you can log in.
          </div>
          {/* Extra info banner shown only on the vendor form. */}
          {isVendor && (
            <div className="mb-5 rounded-2xl border border-supply-teal/40 bg-gradient-to-r from-supply-teal/20 via-supply-peach/20 to-supply-orange/20 p-3 text-[11px] text-supply-paper/80 backdrop-blur-xl">
              Fill in your business details to get started as a vendor on FreshRoute.
            </div>
          )}
          {/* Inline error banner — shown when validation or the API call fails. */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}
          {/* Shows the vendor form or customer form based on the URL param. */}
          {isVendor
            ? <VendorForm   onSuccess={handleSuccess} onError={handleError} />
            : <CustomerForm onSuccess={handleSuccess} onError={handleError} />
          }
          {/* Links to switch between the customer and vendor forms. */}
          <p className="mt-4 text-center text-xs text-slate-400">
            {isVendor ? 'Want to order instead? ' : 'Want to sell instead? '}
            <Link to={isVendor ? '/signup/customer' : '/signup/vendor'} className="font-medium text-emerald-400 hover:text-emerald-300">
              {isVendor ? 'Sign up as a Customer' : 'Register as a Vendor'}
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-emerald-400 hover:text-emerald-300">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SignUpPage