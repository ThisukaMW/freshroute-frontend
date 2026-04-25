import { useState } from 'react'
import type { JSX } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

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

const ResetPasswordPage = (): JSX.Element => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const strength = getPasswordStrength(newPassword)
  const passwordErrors = validatePassword(newPassword)

  const inputClass = 'w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-base text-slate-50 outline-none placeholder:text-slate-400 focus:border-emerald-500/60 focus:bg-white/15 focus:ring-2 focus:ring-emerald-500/40 transition-all'

  const startCountdown = () => {
    let count = 5
    const interval = setInterval(() => {
      count -= 1
      setCountdown(count)
      if (count <= 0) {
        clearInterval(interval)
        navigate('/signin')
      }
    }, 1000)
  }

  const handleSubmit = async () => {
    setError('')

    if (passwordErrors.length > 0) {
      setError('Please fix password requirements')
      setShowHints(true)
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Reset failed')

      setSuccess(true)
      startCountdown()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/30 text-sm font-bold text-emerald-300 ring-2 ring-emerald-400/40">FR</div>
          <span className="text-xl font-semibold text-slate-50">Fresh<span className="text-emerald-400">Route</span></span>
        </div>

        <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-8 backdrop-blur-2xl">
          {!success ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-slate-50">Set new password</h1>
                <p className="mt-1 text-sm text-slate-300">Choose a strong password for your account.</p>
              </div>

              {!token && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  Invalid reset link. Please <Link to="/forgot-password" className="underline">request a new one</Link>.
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-200">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setShowHints(true) }}
                    className={inputClass}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  {newPassword && (
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
                      {showHints && passwordErrors.length > 0 && (
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

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-200">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className={inputClass}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[10px] text-red-400 mt-1">✕ Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-[10px] text-emerald-400 mt-1">✓ Passwords match</p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !token || passwordErrors.length > 0 || newPassword !== confirmPassword}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </div>
            </>
          ) : (
            // ---- success state ----
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-50">Password reset!</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Your password has been updated successfully.
                </p>
              </div>

              {/* email notice */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-left">
                <p className="text-xs text-emerald-300 font-medium mb-1">📧 Check your email</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We sent a confirmation to your inbox. If this wasn't you, click <strong className="text-red-400">"Secure My Account"</strong> in that email to immediately lock your account and sign out all devices.
                </p>
              </div>

              {/* countdown */}
              <p className="text-sm text-slate-400">
                Redirecting to sign in in{' '}
                <span className="font-semibold text-emerald-400">{countdown}s</span>...
              </p>

              <button
                onClick={() => navigate('/signin')}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Go to sign in now
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-300">
            <Link to="/signin" className="text-emerald-400 hover:underline">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage