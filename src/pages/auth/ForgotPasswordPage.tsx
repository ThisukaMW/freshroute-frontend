import { useState } from 'react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

const ForgotPasswordPage = (): JSX.Element => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message ?? 'Something went wrong')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-base text-slate-50 outline-none placeholder:text-slate-400 focus:border-emerald-500/60 focus:bg-white/15 focus:ring-2 focus:ring-emerald-500/40 transition-all'

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
          {!submitted ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold text-slate-50">Forgot your password?</h1>
                <p className="mt-1 text-sm text-slate-300">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className={inputClass}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

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
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-50">Check your email</h2>
                <p className="mt-1 text-sm text-slate-300">
                  We sent a reset link to <span className="text-emerald-400">{email}</span>. Check your inbox and follow the instructions.
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSubmitted(false)} className="text-emerald-400 hover:underline">
                  try again
                </button>
              </p>
            </div>
          )}

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