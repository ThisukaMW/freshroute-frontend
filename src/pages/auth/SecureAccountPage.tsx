import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          renderButton: (el: HTMLElement, config: object) => void
        }
      }
    }
  }
}

const SecureAccountPage = (): JSX.Element => {
  console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!email) {
      setStatus('error')
      setMessage('Invalid link. No email address found.')
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (!window.google) return
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        login_hint: email, // pre-fills the google account picker with this email
      })
      const btnEl = document.getElementById('google-signin-btn')
      if (btnEl) {
        window.google.accounts.id.renderButton(btnEl, {
          theme: 'filled_black',
          size: 'large',
          width: 320,
          text: 'continue_with',
        })
      }
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [email])

  const handleGoogleResponse = async (response: { credential: string }) => {
    setStatus('verifying')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/secure-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, googleIdToken: response.credential }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Verification failed')
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message)
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

          {/* IDLE — show Google button */}
          {status === 'idle' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                  <svg className="h-7 w-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-slate-50">Secure your account</h1>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Someone changed the password for{' '}
                  <span className="text-emerald-400 font-medium">{email}</span>.
                  Verify with Google to instantly revert the change.
                </p>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-xs text-red-300 font-medium mb-1.5">⚠️ What happens after verification?</p>
                <ul className="text-xs text-slate-400 leading-relaxed space-y-1">
                  <li>• The unauthorized password change is reverted</li>
                  <li>• All active sessions are signed out immediately</li>
                  <li>• You can sign in with your original password</li>
                </ul>
              </div>

              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-slate-400">Verify it's you by signing in with Google</p>
                <div id="google-signin-btn" />
              </div>
            </div>
          )}

          {/* VERIFYING */}
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/30">
                <svg className="h-8 w-8 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-50">Verifying your identity...</h2>
              <p className="text-sm text-slate-400">Reverting the password change and signing out all devices.</p>
            </div>
          )}

          {/* SUCCESS */}
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-50">Account secured!</h2>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  The unauthorized change has been reverted and all sessions signed out.
                  You can sign in with your original password.
                </p>
              </div>
              <Link to="/signin" className="block w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2.5 text-sm font-medium text-white text-center hover:opacity-90 transition-opacity">
                Back to sign in
              </Link>
            </div>
          )}

          {/* ERROR */}
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
              <button onClick={() => setStatus('idle')} className="w-full rounded-xl border border-white/20 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                Try again
              </button>
            </div>
          )}

          {status !== 'success' && (
            <div className="mt-6 text-center text-sm text-slate-300">
                <Link to="/signin" className="text-emerald-400 hover:underline">Back to sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SecureAccountPage