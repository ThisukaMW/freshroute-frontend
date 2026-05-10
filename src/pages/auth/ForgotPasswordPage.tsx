// Forgot password page — user types their email, hits send, gets a reset link in their inbox

import { useState } from 'react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

const ForgotPasswordPage = (): JSX.Element => {

  // Holds whatever the user is typing in the email input box
  const [email, setEmail] = useState('')

  // Flips to true after the API call succeeds — switches the form to the "check your email" screen
  const [submitted, setSubmitted] = useState(false)

  // True while the API call is running — disables the button and shows "Sending..."
  const [loading, setLoading] = useState(false)

  // Holds an error message string if something goes wrong — empty string means no error
  const [error, setError] = useState('')

  // Validates the email, calls the API, and handles success/failure
  const handleSubmit = async () => {

    // Stop immediately if the email box is empty — show an error instead
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)  // disable button, show "Sending..."
    setError('')      // clear any old error before trying again

    try {
      // Send the email to the backend — backend will email a reset link to that address
      const res = await fetch('http://localhost:5000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      // If the server returned an error status, read the message and throw it
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message ?? 'Something went wrong')
      }

      // API worked — switch to the success screen
      setSubmitted(true)

    } catch (err: any) {
      // API failed — show the error message in the red banner
      setError(err.message)
    } finally {
      // Always turn off loading whether it worked or not
      setLoading(false)
    }
  }

  // Reusable CSS class string for the email input box — stored here to keep JSX clean
  const inputClass = 'w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-base text-slate-50 outline-none placeholder:text-slate-400 focus:border-emerald-500/60 focus:bg-white/15 focus:ring-2 focus:ring-emerald-500/40 transition-all'

  return (
    // Full screen centered layout with gradient background
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4">
      <div className="w-full max-w-md">

        {/* FreshRoute logo and brand name at the top */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/30 text-sm font-bold text-emerald-300 ring-2 ring-emerald-400/40">
            FR
          </div>
          <span className="text-xl font-semibold text-slate-50">
            Fresh<span className="text-emerald-400">Route</span>
          </span>
        </div>

        {/* Main card — switches between two views based on submitted state */}
        <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-8 backdrop-blur-2xl">

          {/* VIEW 1 — the form (shown when submitted is false)(email enter part) */}
          {!submitted ? (
            <>
              {/* Title and subtitle */}
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-slate-50">Forgot your password?</h1>
                <p className="mt-1 text-sm text-slate-300">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {/* Red error banner — only shows if error string is not empty */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}                                    // controlled by email state
                    onChange={(e) => setEmail(e.target.value)}      // updates email state on every keypress
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} // pressing Enter submits the form
                    className={inputClass}
                    placeholder="you@example.com"
                    autoComplete="email"                            // browser can autofill saved emails
                  />
                </div>

                {/* Submit button — disabled while loading, text changes to "Sending..." */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>
            </>

          ) : (

            /* VIEW 2 — success screen (shown when submitted flips to true)(success part) */
            <div className="text-center space-y-4">

              {/* Big email envelope icon in a green circle */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>

              {/* Success message — shows the exact email address they typed */}
              <div>
                <h2 className="text-lg font-semibold text-slate-50">Check your email</h2>
                <p className="mt-1 text-sm text-slate-300">
                  We sent a reset link to <span className="text-emerald-400">{email}</span>. Check your inbox and follow the instructions.
                </p>
              </div>

              {/* "Didn't get it?" — clicking "try again" flips submitted back to false, showing the form again */}
              <p className="text-xs text-slate-400">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSubmitted(false)} className="text-emerald-400 hover:underline">
                  try again
                </button>
              </p>
            </div>
          )}

          {/* "Remember your password? Sign in" link — shows on both views */}
          <div className="mt-6 text-center text-sm text-slate-300">
            Remember your password?{' '}
            <Link to="/signin" className="text-emerald-400 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage