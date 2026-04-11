import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDispatch } from 'react-redux'
import { setSellerProfile } from '../store/slices/userSlice'
import { setCredentials } from '../store/slices/authSlice'
import { registerVendor } from '../services/authService'
import Navbar from '../components/Navbar'

const SignUpVendorPage = (): JSX.Element => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const dispatch = useDispatch()

  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [city, setCity] = useState('Colombo')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  const [verificationDoc, setVerificationDoc] = useState<File | undefined>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!agreedToPolicy) {
      setError('You must agree to the vendor policy')
      return
    }

    setLoading(true)
    try {
      const data = await registerVendor({
        businessName,
        ownerName,
        email,
        phone,
        password,
        confirmPassword,
        businessAddress,
        city,
        agreedToPolicy,
        verificationDoc,
      })

      dispatch(setCredentials({
        user: { id: data.user.id, email: data.user.email, name: data.user.name },
        token: data.token,
      }))

      dispatch(setSellerProfile({
        ownerName,
        email: data.user.email,
        businessName,
        businessAddress,
        phone,
        city,
      }))

      login(data.token, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role?.toLowerCase(),
      })

      navigate('/seller')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-offwhite/60 focus:border-emerald-500 focus:ring-2"

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
              <label className="block text-xs font-medium text-slate-200">Business name</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className={inputClass} placeholder="Green Market" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Owner full name</label>
              <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required className={inputClass} placeholder="Kamal Perera" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="store@example.com" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+94 77 123 4567" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-200">Business address</label>
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
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} placeholder="Create a strong password" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Confirm password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} placeholder="Repeat your password" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-medium text-slate-200">Business verification (optional)</label>
              <input
                type="file"
                onChange={(e) => setVerificationDoc(e.target.files?.[0])}
                className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-500 bg-brand-background/60 px-3 py-2 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:border-emerald-400"
              />
              <p className="mt-1 text-[11px] text-offwhite/60">Upload your business registration document or valid ID.</p>
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
                disabled={loading}
                className="mt-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register Vendor Account'}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/seller/login" className="font-medium text-emerald-400 hover:text-emerald-300">Seller login</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SignUpVendorPage