// PendingApprovalPage.tsx
// Shown right after someone registers. Tells them their account is being reviewed
// and that they'll get an email once a decision is made. No logic — just a static info page.

import { Link } from 'react-router-dom'
import type { JSX } from 'react'
import Navbar from '../components/Navbar'

const PendingApprovalPage = (): JSX.Element => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <Navbar variant="public" />

      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl text-center space-y-6">

          {/* Clock icon in an amber circle — visually signals "waiting". */}
          <div className="flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
              <svg className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Main heading and explanation paragraph. */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-50">Registration Received!</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your account is under review by our admin team. You don't need to keep checking back —{' '}
              <span className="text-slate-100 font-medium">we'll email you</span> as soon as a decision is made.
            </p>
          </div>

          {/* Blue info box reminding the user to check their inbox and spam folder. */}
          <div className="rounded-2xl border border-sky-500/25 bg-sky-500/8 px-4 py-3.5 flex items-start gap-3 text-left">
            <svg className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <p className="text-xs text-sky-300 leading-relaxed">
              We'll send an email to the address you registered with once your account is{' '}
              <span className="font-medium text-sky-200">approved or rejected</span>. Check your inbox (and spam folder, just in case).
            </p>
          </div>

          {/* Step-by-step list of what happens next, rendered from an array for easy editing. */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">What happens next?</p>
            {[
              { step: '1', text: 'Our team reviews your registration details' },
              { step: '2', text: 'You receive an email with the decision' },
              { step: '3', text: 'If approved, log in and start using FreshRoute!' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                {/* Numbered circle badge next to each step. */}
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-400">
                  {step}
                </span>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>

          {/* Small "usually under 24 hours" hint. */}
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 px-4 py-3">
            <p className="text-xs text-teal-400">
              ⏱ Approval usually takes <span className="font-semibold">less than 24 hours</span>
            </p>
          </div>

          {/* Two navigation buttons — go to sign in or go back home. */}
          <div className="space-y-3">
            <Link to="/signin" className="block w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
              Go to Sign In
            </Link>
            <Link to="/" className="block w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PendingApprovalPage