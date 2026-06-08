import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { JSX } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { sellerLogin } from '../../api/endpoints/auth'
import Navbar from '../../components/Navbar'

const SellerLoginPage = (): JSX.Element => {
	const navigate = useNavigate()
	const { login } = useAuth()
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validation
		if (!email.trim()) {
			setError('Business email is required')
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
			console.log('🔐 Attempting seller login...')
			const data = await sellerLogin(email, password)

			console.log('✅ Seller login successful', data)

		if (!data.seller) {
			throw new Error('Invalid response from server')
		}

		login(data.token, {
			id: data.seller.id,
			name: data.seller.name,
			email: data.seller.email,
			role: 'seller',
		})

		navigate('/seller')
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
				} else if (message.includes('not found')) {
					message = 'Seller account not found'
				}
			}

			setError(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
			<div className="pointer-events-none absolute inset-0 opacity-60">
				<div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.4),_transparent_60%)] blur-3xl" />
				<div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.35),_transparent_55%)] blur-3xl" />
			</div>
			<Navbar variant="public" />
			<main className="relative flex flex-1 items-center justify-center px-4 py-10">
				<div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
					<div className="mb-6 space-y-1 text-center">
						<h2 className="text-xl font-semibold text-slate-50">Vendor login</h2>
						<p className="text-xs text-slate-400">Sign in to manage your FreshRoute store.</p>
					</div>

					<form className="space-y-4" onSubmit={handleSubmit}>
					{error && (
						<div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3">
							<p className="text-xs text-red-300">❌ {error}</p>
						</div>
					)}

					<div className="space-y-1">
							<label className="block text-xs font-medium text-slate-200">Business email</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
								placeholder="store@example.com"
							/>
						</div>
						<div className="space-y-1">
							<label className="block text-xs font-medium text-slate-200">Password</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
								placeholder="Enter your password"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? 'Signing in…' : 'Sign in as vendor'}
						</button>
					</form>

					<p className="mt-4 text-center text-xs text-slate-500">
						New to FreshRoute?{' '}
						<Link to="/signup/vendor" className="font-medium text-emerald-400 hover:text-emerald-300">
							Register as vendor
						</Link>
					</p>
				<div className="mt-6 rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
					<p className="text-xs font-medium text-slate-300 mb-2">📝 Demo Credentials:</p>
					<div className="space-y-1 text-xs text-slate-400">
						<p>Email: <code className="bg-slate-800/50 px-1 rounded">freshfarm@freshroute.com</code></p>
						<p>Password: <code className="bg-slate-800/50 px-1 rounded">driver123</code></p>
					</div>
				</div>				</div>
			</main>
		</div>
	)
}

export default SellerLoginPage

