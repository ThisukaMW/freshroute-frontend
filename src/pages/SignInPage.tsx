// import { Link, useNavigate } from 'react-router-dom'
// import { useState } from 'react'
// import type { JSX } from 'react'
// import { useAuth } from '../hooks/useAuth'
// import Navbar from '../components/Navbar'

// const SignInPage = (): JSX.Element => {
//   const navigate = useNavigate()
//   const { login } = useAuth()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Frontend-only demo login as buyer
//     login('demo-token', {
//       id: 'buyer-demo',
//       name: 'Demo Buyer',
//       email,
//       role: 'buyer',
//     })
//     navigate('/products')
//   }

//   return (
//     <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
//       <Navbar variant="public" />
//       <main className="relative flex flex-1 items-center justify-center px-4 py-10">
//         <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2">
//           <div className="hidden flex-col justify-center md:flex">
//             <div className="rounded-3xl bg-gradient-to-br from-emerald-500/80 via-emerald-400/60 to-accent-blue/70 p-[1px] ">
//               <div className="h-full rounded-3xl bg-slate-950/80 px-6 py-8 text-slate-50 backdrop-blur-2xl">
//                 <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-200">
//                   FreshRoute for customers
//                 </p>
//                 <h1 className="mt-4 text-2xl font-semibold leading-tight md:text-3xl">
//                   Fresh groceries, delivered straight from your favorite local vendors.
//                 </h1>
//                 <p className="mt-4 text-sm text-slate-300">
//                   This is a frontend-only demo. Use it to walk through complete authentication and ordering flows during
//                   your project presentation.
//                 </p>
//                 <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
//                   <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
//                     <p className="text-emerald-300">Role-based access</p>
//                     <p className="mt-1 text-slate-200">Customer, vendor and admin views.</p>
//                   </div>
//                   <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
//                     <p className="text-emerald-300">Modern UI</p>
//                     <p className="mt-1 text-slate-200">Built with React and Tailwind CSS.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-center">
//             <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
//               <div className="mb-6 space-y-1 text-center">
//                 <h2 className="text-xl font-semibold text-slate-50">Welcome back</h2>
//                 <p className="text-xs text-slate-400">Sign in to continue to your FreshRoute workspace.</p>
//               </div>

//               <form className="space-y-4" onSubmit={handleSubmit}>
//                 <div className="space-y-1">
//                   <label className="block text-xs font-medium text-slate-200">Email</label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
//                     placeholder="you@example.com"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <div className="flex items-center justify-between text-xs">
//                     <label className="font-medium text-slate-200">Password</label>
//                     <button type="button" className="text-emerald-400 hover:text-emerald-300">
//                       Forgot password?
//                     </button>
//                   </div>
//                   <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
//                     placeholder="Enter your password"
//                   />
//                 </div>

//                 <div className="flex items-center justify-between text-xs">
//                   <label className="flex items-center gap-2 text-slate-300">
//                     <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400" />
//                     <span>Remember me</span>
//                   </label>
//                 </div>

//                 <button
//                   type="submit"
//                   className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
//                 >
//                   Sign In
//                 </button>
//               </form>

//               <p className="mt-4 text-center text-xs text-slate-500">
//                 Don&apos;t have an account?{' '}
//                 <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-700">
//                   Sign up
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// export default SignInPage
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../hooks/useAuth'
import { buyerLogin } from '../api/endpoints/auth'
import Navbar from '../components/Navbar'

const SignInPage = (): JSX.Element => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setError(null)
    setLoading(true)

    try {
      console.log('🔐 Attempting to login...')
      const data = await buyerLogin(email, password)

      console.log('✅ Login successful, storing token...', data)
      
      if (!data.buyer) {
        throw new Error('Invalid response from server')
      }
      
      login(data.token, {
        id: data.buyer.id,
        name: data.buyer.name,
        email: data.buyer.email,
        role: 'buyer',
      })

      navigate('/products')
    } catch (err: unknown) {
      console.error('❌ Login error:', err)
      
      let message = 'Login failed. Please check your credentials.'
      
      if (err instanceof Error) {
        message = err.message
        // Parse axios error messages
        if (message.includes('401')) {
          message = 'Invalid email or password'
        } else if (message.includes('Network')) {
          message = 'Network error. Please check your connection.'
        }
      }
      
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2">
          <div className="hidden flex-col justify-center md:flex">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500/80 via-emerald-400/60 to-accent-blue/70 p-[1px]">
              <div className="h-full rounded-3xl bg-slate-950/80 px-6 py-8 text-slate-50 backdrop-blur-2xl">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-200">
                  FreshRoute for customers
                </p>
                <h1 className="mt-4 text-2xl font-semibold leading-tight md:text-3xl">
                  Fresh groceries, delivered straight from your favorite local vendors.
                </h1>
                <p className="mt-4 text-sm text-slate-300">
                  Sign in to browse products and place orders from local vendors in your area.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
                    <p className="text-emerald-300">Role-based access</p>
                    <p className="mt-1 text-slate-200">Customer, vendor and admin views.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
                    <p className="text-emerald-300">Modern UI</p>
                    <p className="mt-1 text-slate-200">Built with React and Tailwind CSS.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="mb-6 space-y-1 text-center">
                <h2 className="text-xl font-semibold text-slate-50">Welcome back</h2>
                <p className="text-xs text-slate-400">
                  Sign in to continue to your FreshRoute workspace.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3">
                    <p className="text-xs text-red-300">❌ {error}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-200">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-slate-200">Password</label>
                    <button type="button" className="text-emerald-400 hover:text-emerald-300">
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-600/80 bg-brand-background text-emerald-400"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-700">
                  Sign up
                </Link>
              </p>

              <div className="mt-6 rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
                <p className="text-xs font-medium text-slate-300 mb-2">📝 Demo Credentials:</p>
                <div className="space-y-1 text-xs text-slate-400">
                  <p>Email: <code className="bg-slate-800/50 px-1 rounded">john.doe@example.com</code></p>
                  <p>Password: <code className="bg-slate-800/50 px-1 rounded">buyer123</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SignInPage