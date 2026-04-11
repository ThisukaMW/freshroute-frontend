import { useState } from 'react'
import type { JSX } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

const ResetPasswordPage = (): JSX.Element => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const inputClass = 'w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-base text-slate-50 outline-none placeholder:text-slate-400 focus:border-emerald-500/60 focus:bg-white/15 focus:ring-2 focus:ring-emerald-500/40 transition-all'

  const handleSubmit = async () => {
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!token) {
      setError('Invalid reset link. Please request a new one.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message ?? 'Reset failed')
      }

      setSuccess(true)
      setTimeout(() => navigate('/signin'), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/30 text-sm font-bold text-emerald-300 ring-2 ring-emerald-400/40">
            FR
          </div>
          <span className="text-xl font-semibold text-slate-50">
            Fresh<span className="text-emerald-400">Route</span>
          </span>
        </div>

        <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-8 backdrop-blur-2xl">
          {!success ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-slate-50">Set new password</h1>
                <p className="mt-1 text-sm text-slate-300">
                  Choose a strong password for your account.
                </p>
              </div>

              {!token && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  Invalid reset link. Please{' '}
                  <Link to="/forgot-password" className="underline">request a new one</Link>.
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-200">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-200">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className={inputClass}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !token}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-50">Password reset!</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Your password has been updated. Redirecting you to sign in...
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-300">
            <Link to="/signin" className="text-emerald-400 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage