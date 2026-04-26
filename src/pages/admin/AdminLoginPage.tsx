import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import React from 'react'
import { useAuth } from '../../hooks/useAuth'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'field_admin'
}

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setApiError(null)

    const newErrors: { email?: string; password?: string } = {}
    if (!email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.'
    }
    if (!password) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setApiError(data.message || 'Login failed. Please try again.')
        return
      }

      login(data.token, data.user as AdminUser)
      navigate('/admin')
    } catch {
      setApiError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.4),_transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.35),_transparent_55%)] blur-3xl" />
      </div>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <div className="mb-6 space-y-1 text-center">
            <h2 className="text-xl font-semibold text-slate-50">Admin login</h2>
          </div>

          {apiError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {apiError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
         
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
                }}
                className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/60'
                    : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/60'
                }`}
                placeholder="admin@example.com"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

       
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }))
                  }}
                  className={`w-full rounded-xl border bg-white/5 px-3 py-2 pr-16 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/60'
                      : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/60'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Continue as admin'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default AdminLoginPage