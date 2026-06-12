// RoleSelectPage.tsx
// This page asks the user to pick their account type (Customer or Vendor) before signing up.

import { Link, useNavigate } from 'react-router-dom'
import type { JSX } from 'react'
import Navbar from '../components/Navbar'

// The shape of one role card — what data each card needs to display itself.
type RoleItem = {
  key: string
  title: string
  description: string
  to: string
  icon: JSX.Element
}

// Shopping cart icon shown on the Customer card.
const CustomerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

// House/shop icon shown on the Vendor card.
const VendorIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

// The list of role cards shown on this page — add a new object here to add a new role.
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
]

// The full role selection page — renders the two role cards and handles navigation.
const RoleSelectPage = (): JSX.Element => {

  // Used to programmatically navigate to a new page when a card is clicked.
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 text-supply-ash">
      <Navbar variant="public" />

      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-4xl flex-col items-center">

          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">

            {/* Page title and subtitle */}
            <div className="mb-2 text-center">
              <h1 className="text-2xl font-bold text-supply-paper decoration-supply-teal decoration-2 underline-offset-4">
                Create your FreshRoute account
              </h1>
              <p className="mt-2 text-sm text-supply-ash">
                Choose the account type that best fits your needs
              </p>
            </div>

            {/* Loops through the roles array and renders one card per role */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {roles.map((role) => (
                // Clicking the card navigates to that role's signup page
                <button
                  key={role.key}
                  onClick={() => navigate(role.to)}
                  className="group flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-5 min-h-[250px] text-left text-supply-paper transition-all duration-200 hover:border-supply-teal hover:bg-primary-dark hover:text-white hover:shadow-lg hover:shadow-supply-teal/30 hover:-translate-y-2"
                >
                  {/* Icon box — brightens on hover */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                    <span className="text-supply-ash group-hover:text-white transition-colors duration-200">
                      {role.icon}
                    </span>
                  </div>

                  {/* Role title and description */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">{role.title}</p>
                    <p className="mt-1 text-sm leading-snug text-supply-ash group-hover:text-white/90 transition-colors duration-200">
                      {role.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* "Already have an account? Sign in" link shown below the cards */}
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