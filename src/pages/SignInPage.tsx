import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import { useDispatch } from 'react-redux'
import { setBuyerProfile, setSellerProfile } from '../store/slices/userSlice'
import { setCredentials } from '../store/slices/authSlice'
import { loginUser } from '../services/authService'
import { useToast } from '../context/ToastContext'

// Validates that the given string is a properly formatted email address
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const SignInPage = (): JSX.Element => {
  // Hook for programmatic navigation after login
  const navigate = useNavigate()
  // Hook to dispatch Redux actions for storing auth/profile state
  const dispatch = useDispatch()
  // Custom auth hook that persists token and user info in local context
  const { login } = useAuth()
  // Hook to trigger global toast notifications
  const { showToast } = useToast()

  // Controlled state for form field values
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Stores API or validation error messages to display in the form
  const [error, setError] = useState('')
  // Tracks whether the form is awaiting an API response
  const [loading, setLoading] = useState(false)
  // Tracks which fields have been interacted with to trigger inline validation
  const [touched, setTouched] = useState({ email: false, password: false })

  // Computes the inline error message for the email field after it has been touched
  const emailError = touched.email && !email ? 'Email is required'
    : touched.email && !isValidEmail(email) ? 'Please enter a valid email address' : ''

  // Computes the inline error message for the password field after it has been touched
  const passwordError = touched.password && !password ? 'Password is required'
    : touched.password && password.length < 8 ? 'Password must be at least 8 characters' : ''

  // Handles form submission: validates inputs, calls login API, stores credentials, and navigates by role
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mark all fields as touched so validation errors become visible
    setTouched({ email: true, password: true })
    setError('')

    // Guard: abort if email is missing or invalid
    if (!email || !isValidEmail(email)) return
    // Guard: abort if password is missing or too short
    if (!password || password.length < 8) return

    setLoading(true)
    try {
      // Send credentials to the backend; response includes user, token, role, and redirectTo path
      const data = await loginUser({ email, password })
      const role = data.user.role?.toLowerCase()

      // Store the auth token and basic user info in Redux for app-wide access
      dispatch(setCredentials({
        user: { id: data.user.id, email: data.user.email, name: data.user.name },
        token: data.token,
      }))

      // Persist token and user info in the local auth context/hook as well
      login(data.token, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role,
      })

      // Populate the role-specific Redux profile slice based on whether the user is a seller or buyer
      if (role === 'seller') {
        dispatch(setSellerProfile({
          ownerName: data.user.name,
          email: data.user.email,
          businessName: data.profile?.businessName ?? '',
          businessAddress: data.profile?.businessAddress ?? '',
          phone: data.user.phone ?? '',
          city: data.user.city ?? 'Colombo',
        }))
      } else {
        dispatch(setBuyerProfile({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone ?? '',
          city: data.user.city ?? 'Colombo',
          address: data.user.address ?? '',
        }))
      }

      // Show a personalised welcome toast to the user
      showToast(`Welcome back, ${data.user.name}! 👋`)

      // Navigate to the role-specific dashboard path provided by the backend
      navigate(data.redirectTo)

    } catch (err: any) {
      // Display the server error message or fall back to a generic invalid credentials message
      setError(err?.response?.data?.message ?? 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  // Base Tailwind class string shared by all text inputs for consistent styling
  const inputBase = "w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:ring-2 transition-all"

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2">

          {/* Left panel: marketing copy visible only on medium+ screens */}
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
                    <p className="text-emerald-300">Auto role detection</p>
                    <p className="mt-1 text-slate-200">System directs you to the right dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: the sign-in form card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="mb-6 space-y-1 text-center">
                <h2 className="text-xl font-semibold text-slate-50">Welcome back</h2>
                <p className="text-xs text-slate-400">
                  Sign in to continue to your FreshRoute workspace.
                </p>
              </div>

              {/* Top-level error banner shown when the API returns an error */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Email field with conditional border colour based on validation state */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-200">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // Mark field as touched on blur to trigger inline validation
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className={`${inputBase} ${emailError ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-emerald-500'}`}
                    placeholder="you@example.com"
                  />
                  {emailError && <p className="text-[10px] text-red-400">✕ {emailError}</p>}
                </div>

                {/* Password field with forgot-password link and inline validation message */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-slate-200">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <Link to="/forgot-password" className="text-emerald-400 hover:text-emerald-300">Forgot password?</Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    // Mark field as touched on blur to trigger inline validation
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className={`${inputBase} ${passwordError ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-emerald-500'}`}
                    placeholder="Enter your password"
                  />
                  {passwordError && <p className="text-[10px] text-red-400">✕ {passwordError}</p>}
                </div>

                {/* Remember me checkbox — UI only, no persistence logic wired yet */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Submit button: disabled while loading or if validation would fail */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                {/* Inline error repeated below the button for visibility on smaller screens */}
                {error && (
                  <p className="text-center text-xs text-red-400">{error}</p>
                )}
              </form>

              <p className="mt-4 text-center text-xs text-slate-500">
                Don't have an account?{' '}
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