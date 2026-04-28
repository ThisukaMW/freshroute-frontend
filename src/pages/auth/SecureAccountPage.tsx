import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const SecureAccountPage = (): JSX.Element => {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!email) {
      setStatus('error')
      setMessage('Invalid link. No email address found.')
      return
    }

    setStatus('loading')

    fetch(`${import.meta.env.VITE_API_URL}/auth/secure-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.message ?? 'Failed to secure account')
        setStatus('success')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message)
      })
  }, [email])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4">
      <div className="w-full max-w-md">

        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/30 text-sm font-bold text-emerald-300 ring-2 ring-emerald-400/40">FR</div>
          <span className="text-xl font-semibold text-slate-50">Fresh<span className="text-emerald-400">Route</span></span>
        </div>

        <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-8 backdrop-blur-2xl">

          {/* Loading */}
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/30">
                <svg className="h-8 w-8 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-50">Securing your account...</h2>
              <p className="text-sm text-slate-400">Please wait while we lock your account and sign out all devices.</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-50">Account secured</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Your account has been locked and all active sessions have been signed out.
                </p>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left">
                <p className="text-xs text-red-300 font-medium mb-1">⚠️ What happens next?</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your account is now locked. To recover access, contact our support team at{' '}
                  <a href="mailto:support@freshroute.lk" className="text-emerald-400 hover:underline">
                    support@freshroute.lk
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-50">Something went wrong</h2>
                <p className="mt-1 text-sm text-slate-400">{message}</p>
              </div>
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

export default SecureAccountPage