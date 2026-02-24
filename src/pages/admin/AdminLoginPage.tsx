import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import Navbar from '../../components/Navbar'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'buyer' | 'seller'
}

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState<string>('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const user: User = {
      id: 'admin-demo',
      name: 'Demo Admin',
      email,
      role: 'admin',
    }
    login('demo-token', user)
    navigate('/admin')
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.4),_transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.35),_transparent_55%)] blur-3xl" />
      </div>
      <Navbar variant="public" />
      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <div className="mb-6 space-y-1 text-center">
            <h2 className="text-xl font-semibold text-slate-50">Admin login</h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
                placeholder="admin@example.com"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Continue as admin
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default AdminLoginPage

