// SignUpPage.tsx

import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import type { JSX } from 'react'
import Navbar from '../components/Navbar'
import { registerCustomer, registerVendor } from '../services/authService'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../hooks/useAuth'
import { useDispatch } from 'react-redux'
import { setBuyerProfile } from '../store/slices/userSlice'
import { setCredentials } from '../store/slices/authSlice'
import MapAddressPicker from '../components/MapAddressPicker'


// ─── Validation helpers ───────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const isValidPersonName = (v: string) => /^[A-Za-z\s]+$/.test(v.trim()) && v.trim().length > 0
const isValidLocalPhone = (v: string) => /^\d{9}$/.test(v)

const getPasswordStrength = (pwd: string) => {
  let score = 0
  if (pwd.length >= 8)          score++
  if (/[A-Z]/.test(pwd))        score++
  if (/[0-9]/.test(pwd))        score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500'    }
  if (score === 2) return { score, label: 'Fair',   color: 'bg-yellow-500' }
  if (score === 3) return { score, label: 'Good',   color: 'bg-blue-500'   }
  return             { score, label: 'Strong', color: 'bg-emerald-500' }
}

const getPasswordErrors = (pwd: string): string[] => {
  const e: string[] = []
  if (pwd.length < 8)            e.push('At least 8 characters')
  if (!/[A-Z]/.test(pwd))        e.push('At least 1 uppercase letter')
  if (!/[0-9]/.test(pwd))        e.push('At least 1 number')
  if (!/[^A-Za-z0-9]/.test(pwd)) e.push('At least 1 special character (!@#$...)')
  return e
}

// ─── Shared styles ────────────────────────────────────────────────

const base = 'w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 transition-colors'
const cls = {
  input:  `${base} border-white/10 focus:border-emerald-500 focus:ring-2 ring-emerald-500/60`,
  error:  `${base} border-red-500/70 focus:border-red-500 focus:ring-2 ring-red-500/40`,
  ok:     `${base} border-emerald-500/60 focus:border-emerald-500 focus:ring-2 ring-emerald-500/40`,
}

const Hint = ({ ok, msg }: { ok: boolean; msg: string }) => (
  <p className={`text-[10px] mt-0.5 ${ok ? 'text-emerald-400' : 'text-red-400'}`}>
    {ok ? '✓' : '✕'} {msg}
  </p>
)

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

// ─── NameField ────────────────────────────────────────────────────

interface NameFieldProps {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  touched: boolean
  label?: string
  placeholder?: string
  required?: boolean
}

const NameField = ({
  value, onChange, onBlur, touched,
  label = 'Full name', placeholder = 'John Perera', required = false,
}: NameFieldProps) => {
  const isEmpty  = value.trim().length === 0
  const isValid  = isValidPersonName(value)
  const hasError = touched && (isEmpty || !isValid)
  const hasOk    = touched && !isEmpty && isValid

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-200">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={hasError ? cls.error : hasOk ? cls.ok : cls.input}
        placeholder={placeholder}
        autoComplete="name"
      />
      {touched && isEmpty  && <Hint ok={false} msg={`${label} is required`} />}
      {touched && !isEmpty && !isValid && <Hint ok={false} msg="Only letters and spaces allowed" />}
      {hasOk && <Hint ok={true} msg="Looks good" />}
    </div>
  )
}

// ─── PhoneField ───────────────────────────────────────────────────

interface PhoneFieldProps {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  touched: boolean
  label?: string
  required?: boolean
}

const PhoneField = ({
  value, onChange, onBlur, touched,
  label = 'Phone number', required = false,
}: PhoneFieldProps) => {
  const isEmpty  = value.length === 0
  const isValid  = isValidLocalPhone(value)
  const hasError = touched && !isEmpty && !isValid
  const hasOk    = touched && isValid

  const borderCls = hasError
    ? 'border-red-500/70 ring-2 ring-red-500/40'
    : hasOk
    ? 'border-emerald-500/60 ring-2 ring-emerald-500/40'
    : 'border-white/10 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/60'

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-200">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className={`flex rounded-xl overflow-hidden border transition-all ${borderCls}`}>
        <span className="flex items-center px-3 bg-white/10 text-sm text-slate-300 border-r border-white/10 select-none whitespace-nowrap">
          🇱🇰 +94
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
            onChange(digits)
          }}
          onBlur={onBlur}
          placeholder="771234567"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500"
          autoComplete="tel-national"
        />
        {hasOk    && <span className="flex items-center pr-3 text-emerald-400 text-xs select-none">✓</span>}
        {hasError && <span className="flex items-center pr-3 text-red-400 text-xs select-none">✕</span>}
      </div>
      {hasError && <Hint ok={false} msg="Enter exactly 9 digits (e.g. 771234567)" />}
      {hasOk    && <Hint ok={true}  msg={`+94${value}`} />}
    </div>
  )
}

// ─── EmailField ───────────────────────────────────────────────────

interface EmailFieldProps {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  touched: boolean
  placeholder?: string
}

const EmailField = ({
  value, onChange, onBlur, touched, placeholder = 'you@example.com',
}: EmailFieldProps) => {
  const isEmpty  = value.trim().length === 0
  const isValid  = isValidEmail(value)
  const hasError = touched && (isEmpty || !isValid)
  const hasOk    = touched && !isEmpty && isValid

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-200">
        Email <span className="text-red-400">*</span>
      </label>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={hasError ? cls.error : hasOk ? cls.ok : cls.input}
        placeholder={placeholder}
        autoComplete="email"
      />
      {touched && isEmpty  && <Hint ok={false} msg="Email is required" />}
      {touched && !isEmpty && !isValid && <Hint ok={false} msg="Enter a valid email address" />}
      {hasOk && <Hint ok={true} msg="Looks good" />}
    </div>
  )
}

// ─── PasswordField ────────────────────────────────────────────────

interface PasswordFieldProps {
  value: string
  onChange: (v: string) => void
  showHints: boolean
  setShowHints: (v: boolean) => void
  label?: string
}

const PasswordField = ({
  value, onChange, showHints, setShowHints, label = 'Password',
}: PasswordFieldProps) => {
  const [show, setShow] = useState(false)
  const strength = getPasswordStrength(value)
  const errors   = getPasswordErrors(value)

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-200">
        {label} <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => { onChange(e.target.value); setShowHints(true) }}
          className={cls.input}
          placeholder="Create a strong password"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          tabIndex={-1}
        >
          <EyeIcon show={show} />
        </button>
      </div>
      {value && (
        <div className="mt-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[1,2,3,4].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
              ))}
            </div>
            <span className={`text-[10px] font-medium ${
              strength.score <= 1 ? 'text-red-400' :
              strength.score === 2 ? 'text-yellow-400' :
              strength.score === 3 ? 'text-blue-400' : 'text-emerald-400'
            }`}>{strength.label}</span>
          </div>
          {showHints && errors.length > 0 && (
            <ul className="space-y-0.5">
              {errors.map((e) => <li key={e} className="text-[10px] text-red-400">✕ {e}</li>)}
            </ul>
          )}
          {errors.length === 0 && (
            <p className="text-[10px] text-emerald-400">✓ Password looks great!</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ConfirmPasswordField ─────────────────────────────────────────

const ConfirmPasswordField = ({
  value, onChange, onBlur, password, touched,
}: { value: string; onChange: (v: string) => void; onBlur: () => void; password: string; touched: boolean }) => {
  const [show, setShow] = useState(false)
  const hasError = touched && value.length > 0 && value !== password
  const hasOk    = touched && value.length > 0 && value === password
  const isEmpty  = touched && value.length === 0

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-200">
        Confirm password <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={hasError ? cls.error : hasOk ? cls.ok : cls.input}
          placeholder="Repeat your password"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          tabIndex={-1}
        >
          <EyeIcon show={show} />
        </button>
      </div>
      {isEmpty   && <Hint ok={false} msg="Please confirm your password" />}
      {hasError  && <Hint ok={false} msg="Passwords do not match" />}
      {hasOk     && <Hint ok={true}  msg="Passwords match" />}
    </div>
  )
}


// ─── CustomerForm ─────────────────────────────────────────────────

const CustomerForm = ({ onSuccess, onError }: {
  onSuccess: (data: { token: string; user: any; redirectTo: string }) => void
  onError: (msg: string) => void
}) => {
  const [fullName, setFullName]       = useState('')
  const [email, setEmail]             = useState('')
  const [phoneLocal, setPhoneLocal]   = useState('')
  const [city, setCity]               = useState('Colombo')
  const [address, setAddress]         = useState('')
  const [coords, setCoords]           = useState<{ lat: number; lng: number } | null>(null)
  const [password, setPassword]       = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [loading, setLoading]         = useState(false)
  const [showPwdHints, setShowPwdHints] = useState(false)

  const [touched, setTouched] = useState({
    fullName: false, email: false, phone: false, address: false, confirmPwd: false,
  })
  const touch = (f: keyof typeof touched) => setTouched((p) => ({ ...p, [f]: true }))
  const touchAll = () => setTouched({ fullName: true, email: true, phone: true, address: true, confirmPwd: true })

  const validate = (): string | null => {
    if (!fullName.trim())                             return 'Full name is required'
    if (!isValidPersonName(fullName))                 return 'Name can only contain letters and spaces'
    if (!email.trim())                                return 'Email is required'
    if (!isValidEmail(email))                         return 'Enter a valid email address'
    if (!address.trim())                              return 'Address is required'
    if (phoneLocal && !isValidLocalPhone(phoneLocal)) return 'Phone must be exactly 9 digits after +94'
    if (getPasswordErrors(password).length > 0)       return 'Password does not meet the requirements'
    if (!confirmPwd.trim())                           return 'Please confirm your password'
    if (password !== confirmPwd)                      return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    touchAll()
    setShowPwdHints(true)

    const err = validate()
    if (err) { onError(err); return }

    setLoading(true)
    try {
      const phone = phoneLocal ? `+94${phoneLocal}` : ''
      const data  = await registerCustomer({
        name: fullName, email, password, phone, city, address,
        latitude: coords?.lat, longitude: coords?.lng,
      })
      onSuccess(data)
    } catch (err: any) {
      onError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
      <div className="md:col-span-2">
        <NameField value={fullName} onChange={setFullName} onBlur={() => touch('fullName')} touched={touched.fullName} required placeholder="John Perera" />
      </div>
      <EmailField value={email} onChange={setEmail} onBlur={() => touch('email')} touched={touched.email} />
      <PhoneField value={phoneLocal} onChange={setPhoneLocal} onBlur={() => touch('phone')} touched={touched.phone} />
      <div className="md:col-span-2 space-y-1">
        <label className="block text-xs font-medium text-slate-200">
          Address <span className="text-red-400">*</span>
        </label>
        <MapAddressPicker
          address={address}
          onChange={({ address: a, city: c, lat, lng }) => {
            setAddress(a)
            if (c) setCity(c)
            setCoords({ lat, lng })
            touch('address')
          }}
        />
        {touched.address && !address.trim() && (
          <p className="text-[10px] mt-0.5 text-red-400">✕ Address is required</p>
        )}
      </div>
      <PasswordField value={password} onChange={setPassword} showHints={showPwdHints} setShowHints={setShowPwdHints} />
      <ConfirmPasswordField value={confirmPwd} onChange={setConfirmPwd} onBlur={() => touch('confirmPwd')} password={password} touched={touched.confirmPwd} />
      <div className="mt-2 flex items-start gap-2 md:col-span-2">
        <input type="checkbox" required className="mt-1 h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400" />
        <p className="text-xs text-slate-300">
          I agree to the <button type="button" className="text-emerald-400 underline">Terms & Conditions</button> of FreshRoute.
        </p>
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create Customer Account'}
        </button>
      </div>
    </form>
  )
}

// ─── VendorForm ───────────────────────────────────────────────────

const VendorForm = ({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) => {
  const [businessName, setBusinessName]   = useState('')
  const [ownerName, setOwnerName]         = useState('')
  const [email, setEmail]                 = useState('')
  const [phoneLocal, setPhoneLocal]       = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [coords, setCoords]               = useState<{ lat: number; lng: number } | null>(null)
  const [city, setCity]                   = useState('Colombo')
  const [password, setPassword]           = useState('')
  const [confirmPwd, setConfirmPwd]       = useState('')
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  const [loading, setLoading]             = useState(false)
  const [showPwdHints, setShowPwdHints]   = useState(false)

  const [touched, setTouched] = useState({
    businessName: false, ownerName: false, email: false,
    phone: false, businessAddress: false, confirmPwd: false,
  })
  const touch = (f: keyof typeof touched) => setTouched((p) => ({ ...p, [f]: true }))
  const touchAll = () => setTouched({
    businessName: true, ownerName: true, email: true,
    phone: true, businessAddress: true, confirmPwd: true,
  })

  const validate = (): string | null => {
    if (!businessName.trim())                             return 'Business name is required'
    if (!ownerName.trim())                                return 'Owner name is required'
    if (!isValidPersonName(ownerName))                    return 'Owner name can only contain letters and spaces'
    if (!email.trim())                                    return 'Email is required'
    if (!isValidEmail(email))                             return 'Enter a valid email address'
    if (!businessAddress.trim())                          return 'Business address is required'
    if (phoneLocal && !isValidLocalPhone(phoneLocal))     return 'Phone must be exactly 9 digits after +94'
    if (getPasswordErrors(password).length > 0)           return 'Password does not meet the requirements'
    if (!confirmPwd.trim())                               return 'Please confirm your password'
    if (password !== confirmPwd)                          return 'Passwords do not match'
    if (!agreedToPolicy)                                  return 'You must agree to the vendor policy'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    touchAll()
    setShowPwdHints(true)

    const err = validate()
    if (err) { onError(err); return }

    setLoading(true)
    try {
      const phone = phoneLocal ? `+94${phoneLocal}` : ''
      await registerVendor({
        businessName, ownerName, email, phone, password, confirmPassword: confirmPwd,
        businessAddress, city, agreedToPolicy,
        latitude: coords?.lat, longitude: coords?.lng,
      })
      onSuccess()
    } catch (err: any) {
      onError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
      {/* Business name — plain input, no letter restriction */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-200">Business name <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          onBlur={() => touch('businessName')}
          className={touched.businessName && !businessName.trim() ? cls.error : touched.businessName && businessName.trim() ? cls.ok : cls.input}
          placeholder="Green Market"
        />
        {touched.businessName && !businessName.trim() && <Hint ok={false} msg="Business name is required" />}
        {touched.businessName &&  businessName.trim() && <Hint ok={true}  msg="Looks good" />}
      </div>

      <NameField value={ownerName} onChange={setOwnerName} onBlur={() => touch('ownerName')} touched={touched.ownerName} label="Owner full name" placeholder="Kamal Perera" required />
      <EmailField value={email} onChange={setEmail} onBlur={() => touch('email')} touched={touched.email} placeholder="store@example.com" />
      <PhoneField value={phoneLocal} onChange={setPhoneLocal} onBlur={() => touch('phone')} touched={touched.phone} />

      <div className="md:col-span-2 space-y-1">
        <label className="block text-xs font-medium text-slate-200">
          Business address <span className="text-red-400">*</span>
        </label>
        <MapAddressPicker
          address={businessAddress}
          onChange={({ address: a, city: c, lat, lng }) => {
            setBusinessAddress(a)
            if (c) setCity(c)
            setCoords({ lat, lng })
            touch('businessAddress')
          }}
        />
        {touched.businessAddress && !businessAddress.trim() && (
          <p className="text-[10px] mt-0.5 text-red-400">✕ Business address is required</p>
        )}
      </div>

      <PasswordField value={password} onChange={setPassword} showHints={showPwdHints} setShowHints={setShowPwdHints} />
      <ConfirmPasswordField value={confirmPwd} onChange={setConfirmPwd} onBlur={() => touch('confirmPwd')} password={password} touched={touched.confirmPwd} />

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
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Registering…' : 'Register Vendor Account'}
        </button>
      </div>
    </form>
  )
}

// ─── SignUpPage ───────────────────────────────────────────────────

const SignUpPage = (): JSX.Element => {
  const { role }      = useParams<{ role: string }>()
  const navigate      = useNavigate()
  const { showToast } = useToast()
  const dispatch      = useDispatch()
  const { login }     = useAuth()
  const isVendor      = role === 'vendor'
  const [error, setError] = useState('')

  const handleError = (msg: string) => { setError(msg); showToast(msg, 'error') }
  const handleVendorSuccess = () => { navigate('/pending-approval') }
  const handleBuyerSuccess  = (data: { token: string; user: any; redirectTo: string }) => {
    dispatch(setCredentials({ user: { id: data.user.id, email: data.user.email, name: data.user.name }, token: data.token }))
    dispatch(setBuyerProfile({ name: data.user.name, email: data.user.email, phone: '', city: 'Colombo', address: '' }))
    login(data.token, { id: data.user.id, name: data.user.name, email: data.user.email, role: 'buyer' })
    showToast(`Welcome to FreshRoute, ${data.user.name}! 🎉`)
    navigate(data.redirectTo)
  }

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

          {isVendor && (
            <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
              ⏳ Vendor accounts require admin approval before you can log in.
            </div>
          )}
          {isVendor && (
            <div className="mb-5 rounded-2xl border border-supply-teal/40 bg-gradient-to-r from-supply-teal/20 via-supply-peach/20 to-supply-orange/20 p-3 text-[11px] text-supply-paper/80 backdrop-blur-xl">
              Fill in your business details to get started as a vendor on FreshRoute.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          {isVendor
            ? <VendorForm   onSuccess={handleVendorSuccess} onError={handleError} />
            : <CustomerForm onSuccess={handleBuyerSuccess}  onError={handleError} />
          }

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