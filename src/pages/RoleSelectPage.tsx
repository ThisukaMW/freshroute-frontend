/*import { Link } from 'react-router-dom'
import type { JSX } from 'react'
import Navbar from '../components/Navbar'

type RoleItem = {
  key: string
  title: string
  description: string
  to: string
}

const roles: RoleItem[] = [
  {
    key: 'customer',
    title: 'Customer',
    description: 'Browse vendors, compare prices and order fresh produce.',
    to: '/signup/customer',
  },
  {
    key: 'vendor',
    title: 'Vendor',
    description: 'List your products, manage orders and track earnings.',
    to: '/signup/vendor',
  },
  {
    key: 'rider',
    title: 'Delivery Partner',
    description: 'Deliver orders and track your daily earnings. (UI only)',
    to: '/signin',
  },
]

const RoleSelectPage = (): JSX.Element => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 text-supply-ash">
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8  backdrop-blur-2xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-md space-y-2">
              <h1 className="text-2xl font-semibold text-supply-paper">Create your FreshRoute account</h1>
              <p className="text-sm text-supply-ash">
                Choose how you plan to use the platform. You can always add more roles later in a real backend.
              </p>
            </div>
            <p className="rounded-2xl border border-supply-teal/50 bg-supply-teal/20 px-4 py-3 text-xs text-supply-paper backdrop-blur-xl">
              For your project demo, you can explain what each role does and then open the corresponding UI quickly.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <Link
                key={role.key}
                to={role.to}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left  backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-supply-teal"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-supply-peach">{role.title}</p>
                  <p className="mt-2 text-sm text-supply-paper">{role.description}</p>
                </div>
                <span className="mt-4 inline-flex items-center text-xs font-medium text-primary-light">
                  Continue as {role.title} <span className="ml-1">→</span>
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-supply-peach">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-primary-light hover:text-supply-peach">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default RoleSelectPage
*/
import { Link, useNavigate } from 'react-router-dom'
import type { JSX } from 'react'
import Navbar from '../components/Navbar'

type RoleItem = {
  key: string
  title: string
  description: string
  to: string
  icon: JSX.Element
}

const CustomerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const VendorIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const DeliveryIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

const roles: RoleItem[] = [
  {
    key: 'customer',
    title: 'Customer',
    description: 'Browse and purchase products from our marketplace',
    to: '/signup/customer',
    icon: <CustomerIcon />,
  },
  {
    key: 'vendor',
    title: 'Vendor',
    description: 'Sell your products and grow your business',
    to: '/signup/vendor',
    icon: <VendorIcon />,
  },
  {
    key: 'rider',
    title: 'Delivery Person',
    description: 'Deliver order and earn on your schedule',
    to: '/signup/rider',
    icon: <DeliveryIcon />,
  },
]

const RoleSelectPage = (): JSX.Element => {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 text-supply-ash">
      <Navbar variant="public" />

      <main className="relative flex flex-1 items-center justify-center px-4 py-10">

        <div className="flex w-full max-w-6xl flex-col items-center">

          {/* Main container */}
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">

            {/* Header */}
            <div className="mb-2 text-center">
              <h1 className="text-2xl font-bold text-supply-paper decoration-supply-teal decoration-2 underline-offset-4">
                Create your FreshRoute account
              </h1>
              <p className="mt-2 text-sm text-supply-ash">
                Choose the account type that best fits your needs
              </p>
            </div>

            {/* Role Cards */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {roles.map((role) => (
                <button
                  key={role.key}
                  onClick={() => navigate(role.to)}
                  className="group flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-5 min-h-[250px] text-left text-supply-paper transition-all duration-200 hover:border-supply-teal hover:bg-primary-dark hover:text-white hover:shadow-lg hover:shadow-supply-teal/30 hover:-translate-y-2"
                >
                  {/* Icon box */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                    <span className="text-supply-ash group-hover:text-white transition-colors duration-200">
                      {role.icon}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      {role.title}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-supply-ash group-hover:text-white/90 transition-colors duration-200">
                      {role.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

          </div>

          {/* Sign in link — outside the box, below it */}
          <p className="mt-24 text-center text-xs text-supply-peach">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-primary-light underline hover:text-supply-peach">
              Sign in
            </Link>
          </p>

        </div>
      </main>
    </div>
  )
}

export default RoleSelectPage