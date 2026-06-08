// Page where the user sets their new password after clicking the reset link from their email

import { useState } from 'react'
import type { JSX } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

// Checks how strong the password is and returns a score (0-4), label, and bar color
const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0
  if (pwd.length >= 8)          score++ // +1 if long enough
  if (/[A-Z]/.test(pwd))        score++ // +1 if has uppercase letter
  if (/[0-9]/.test(pwd))        score++ // +1 if has a number
  if (/[^A-Za-z0-9]/.test(pwd)) score++ // +1 if has a special character like !@#$
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500'     }
  if (score === 2) return { score, label: 'Fair',   color: 'bg-yellow-500'  }
  if (score === 3) return { score, label: 'Good',   color: 'bg-blue-500'    }
  return                        { score, label: 'Strong', color: 'bg-emerald-500' }
}

// Returns a list of error strings for any password rules the user hasn't met yet
const validatePassword = (pwd: string): string[] => {
  const errors: string[] = []
  if (pwd.length < 8)               errors.push('At least 8 characters')
  if (!/[A-Z]/.test(pwd))           errors.push('At least 1 uppercase letter')
  if (!/[0-9]/.test(pwd))           errors.push('At least 1 number')
  if (!/[^A-Za-z0-9]/.test(pwd))   errors.push('At least 1 special character (!@#$...)')
  return errors // empty array means password is valid
}

// Eye icon button — shows an open eye when password is visible, slashed eye when hidden
const EyeIcon = ({ show }: { show: boolean }) => show ? (
  // Slashed eye SVG — shown when password is currently visible (click to hide)
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
) : (
  // Open eye SVG — shown when password is hidden (click to reveal)
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ResetPasswordPage = (): JSX.Element => {
  // Reads the URL query params — grabs the reset token from the URL like ?token=abc123
  const [searchParams] = useSearchParams()

  // Used to programmatically redirect the user to another page
  const navigate = useNavigate()

  // The reset token from the URL — empty string if missing (invalid link)
  const token = searchParams.get('token') ?? ''

  // Holds what the user types in the "new password" input
  const [newPassword, setNewPassword] = useState('')

  // Holds what the user types in the "confirm password" input
  const [confirmPassword, setConfirmPassword] = useState('')

  // True while the API call is running — disables button and shows "Resetting..."
  const [loading, setLoading] = useState(false)

  // Holds error message string if anything goes wrong — empty means no error
  const [error, setError] = useState('')

  // Flips to true after successful reset — switches to the success screen
  const [success, setSuccess] = useState(false)

  // True once the user starts typing — shows the password requirement hints below the input
  const [showHints, setShowHints] = useState(false)

  // Counts down from 5 to 0 on the success screen before auto-redirecting to sign in
  const [countdown, setCountdown] = useState(5)

  // Toggles the new password input between "password" (dots) and "text" (visible)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Toggles the confirm password input between "password" (dots) and "text" (visible)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Live password strength result — recalculates every time newPassword changes
  const strength = getPasswordStrength(newPassword)

  // Live list of unmet password rules — empty array means all rules are satisfied
  const passwordErrors = validatePassword(newPassword)

  // Shared CSS classes for both password input boxes
  const inputClass = 'w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 pr-10 text-base text-slate-50 outline-none placeholder:text-slate-400 focus:border-emerald-500/60 focus:bg-white/15 focus:ring-2 focus:ring-emerald-500/40 transition-all'

  // Starts a 5 second countdown and redirects to sign in when it hits 0
  const startCountdown = () => {
    let count = 5
    const interval = setInterval(() => {
      count -= 1
      setCountdown(count)       // update the number shown on screen each second
      if (count <= 0) {
        clearInterval(interval) // stop the timer
        navigate('/signin')     // redirect to sign in page
      }
    }, 1000) // fires every 1000ms = every 1 second
  }

  // Validates everything then calls the API to save the new password
  const handleSubmit = async () => {
    setError('')

    // Stop if password doesn't meet requirements — show the hints list
    if (passwordErrors.length > 0) {
      setError('Please fix password requirements')
      setShowHints(true)
      return
    }

    // Stop if the two password boxes don't match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Stop if there's no token in the URL — the reset link is broken or expired
    if (!token) {
      setError('Invalid reset link. Please request a new one.')
      return
    }

    setLoading(true)
    try {
      // Send the token + new password to the backend to save
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Reset failed')

      // Success — switch to the success screen and start the countdown
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

        {/* FreshRoute logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/30 text-sm font-bold text-emerald-300 ring-2 ring-emerald-400/40">FR</div>
          <span className="text-xl font-semibold text-slate-50">Fresh<span className="text-emerald-400">Route</span></span>
        </div>

        {/* Main card — switches between form and success screen */}
        <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-8 backdrop-blur-2xl">
          {!success ? (

            /* VIEW 1 — the reset password form */
            <>
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-slate-50">Set new password</h1>
                <p className="mt-1 text-sm text-slate-300">Choose a strong password for your account.</p>
              </div>

              {/* Warning shown if the URL has no token — link is invalid or expired */}
              {!token && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  Invalid reset link. Please <Link to="/forgot-password" className="underline">request a new one</Link>.
                </div>
              )}

              {/* General error banner for API failures or validation errors */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
              )}

              <div className="space-y-4">

                {/* New password input with eye toggle and strength meter */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-200">New password</label>
                  <div className="relative">
                    {/* type switches between "password" (dots) and "text" (visible) */}
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        setShowHints(true) // start showing requirement hints as soon as they type
                      }}
                      className={inputClass}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                    {/* Eye button sits inside the input on the right side */}
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1} // skipped when tabbing through the form
                    >
                      <EyeIcon show={showNewPassword} />
                    </button>
                  </div>

                  {/* Strength bar + hints — only shows once the user starts typing */}
                  {newPassword && (
                    <div className="space-y-1.5 mt-1">

                      {/* 4 segment bar — filled segments match the strength score */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            // Segment is colored if i <= score, grey if not yet reached
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
                          ))}
                        </div>
                        {/* Label text changes color to match the strength level */}
                        <span className={`text-[10px] font-medium ${
                          strength.score <= 1 ? 'text-red-400'
                          : strength.score === 2 ? 'text-yellow-400'
                          : strength.score === 3 ? 'text-blue-400'
                          : 'text-emerald-400'
                        }`}>
                          {strength.label}
                        </span>
                      </div>

                      {/* Show each unmet rule as a red ✕ bullet — only after user starts typing */}
                      {showHints && passwordErrors.length > 0 && (
                        <ul className="space-y-0.5">
                          {passwordErrors.map((err) => (
                            <li key={err} className="flex items-center gap-1 text-[10px] text-red-400">
                              <span>✕</span> {err}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* All rules met — show green success message instead */}
                      {passwordErrors.length === 0 && (
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span>✓</span> Password looks great!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password input with eye toggle and match indicator */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-200">Confirm new password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} // Enter key submits
                      className={inputClass}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      <EyeIcon show={showConfirmPassword} />
                    </button>
                  </div>

                  {/* Red mismatch warning — only shows if confirm box has text AND it doesn't match */}
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[10px] text-red-400 mt-1">✕ Passwords do not match</p>
                  )}

                  {/* Green match confirmation — only shows if both boxes have the same text */}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-[10px] text-emerald-400 mt-1">✓ Passwords match</p>
                  )}
                </div>

                {/* Submit button — disabled if any of the 4 conditions below are true */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||                          // API call running
                    !token ||                           // no token in URL
                    passwordErrors.length > 0 ||        // password fails requirements
                    newPassword !== confirmPassword     // passwords don't match
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </div>
            </>

          ) : (

            /* VIEW 2 — success screen after password is reset */
            <div className="text-center space-y-4">

              {/* Big green checkmark circle */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Success heading */}
              <div>
                <h2 className="text-lg font-semibold text-slate-50">Password reset!</h2>
                <p className="mt-1 text-sm text-slate-300">Your password has been updated successfully.</p>
              </div>

              {/* Security notice — tells user to check email and what to do if it wasn't them */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-left">
                <p className="text-xs text-emerald-300 font-medium mb-1">📧 Check your email</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We sent a confirmation to your inbox. If this wasn't you, click <strong className="text-red-400">"Secure My Account"</strong> in that email to immediately lock your account and sign out all devices.
                </p>
              </div>

              {/* Countdown text — number updates every second via startCountdown() */}
              <p className="text-sm text-slate-400">
                Redirecting to sign in in <span className="font-semibold text-emerald-400">{countdown}s</span>...
              </p>

              {/* Skip the countdown and go to sign in right now */}
              <button
                onClick={() => navigate('/signin')}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Go to sign in now
              </button>
            </div>
          )}

          {/* "Back to sign in" link — shows on both views */}
          <div className="mt-6 text-center text-sm text-slate-300">
            <Link to="/signin" className="text-emerald-400 hover:underline">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage