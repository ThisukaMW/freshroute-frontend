import { useState } from 'react'
import type { JSX } from 'react'

const mockAdmin = {
  name: 'Admin User',
  email: 'admin@freshroute.com',
  phone: '+94 11 234 5678',
}

const mockStats = [
  { label: 'Total Users', value: '142', color: 'text-slate-50' },
  { label: 'Total Orders', value: '384', color: 'text-emerald-400' },
  { label: 'Vendors', value: '31', color: 'text-supply-peach' },
  { label: 'Active Drivers', value: '8', color: 'text-supply-teal' },
]

type Tab = 'profile' | 'password'

const AdminProfilePage = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [name, setName] = useState(mockAdmin.name)
  const [phone, setPhone] = useState(mockAdmin.phone)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Personal Info' },
    { key: 'password', label: 'Password' },
  ]

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-supply-orange/60 focus:bg-white/10 focus:ring-1 focus:ring-supply-orange/30 transition-all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background/90 via-supply-teal/60 to-supply-teal/45 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-4">

        {/* Identity strip */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-supply-orange/10 blur-3xl" />
          <div className="relative space-y-5">

            {/* Top row: avatar + name */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-supply-orange/70 to-red-500/50 text-2xl font-bold text-white ring-2 ring-white/10">
                {name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-supply-orange">Admin</p>
                  <span className="rounded-full border border-supply-orange/20 bg-supply-orange/10 px-2 py-0.5 text-[10px] font-medium text-supply-orange">
                    Full Access
                  </span>
                </div>
                <p className="mt-0.5 text-lg font-semibold text-slate-50">{name}</p>
                <p className="text-xs text-slate-400">{mockAdmin.email}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {mockStats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-supply-orange/70 to-red-500/50 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">

          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-supply-orange">Account Details</p>
                <h2 className="mt-0.5 text-base font-semibold text-slate-50">Personal Information</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Email</label>
                  <input value={mockAdmin.email} disabled className={`${inputClass} cursor-not-allowed opacity-50`} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Phone number</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+94 11 234 5678" />
                </div>
              </div>
              <button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-supply-orange/80 to-red-500/60 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                {saved ? '✓ Changes saved' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-supply-orange">Security</p>
                <h2 className="mt-0.5 text-base font-semibold text-slate-50">Change Password</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Current password', placeholder: 'Enter current password' },
                  { label: 'New password', placeholder: 'Enter new password' },
                  { label: 'Confirm new password', placeholder: 'Repeat new password' },
                ].map((f) => (
                  <div key={f.label} className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300">{f.label}</label>
                    <input type="password" placeholder={f.placeholder} className={inputClass} />
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-supply-orange/80 to-red-500/60 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                {saved ? '✓ Password updated' : 'Update Password'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default AdminProfilePage