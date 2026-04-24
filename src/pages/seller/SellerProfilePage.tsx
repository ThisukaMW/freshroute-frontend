import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { RootState } from '../../store'
import { updateSellerProfile } from '../../store/slices/userSlice'
import { useToast } from '../../context/ToastContext'
import { useAuthContext } from '../../context/AuthContext'

type Tab = 'profile' | 'business' | 'password' | 'settings'

const mockProducts = [
  { name: 'Tomatoes', price: 'Rs. 120/kg', status: 'APPROVED' },
  { name: 'Red Onions', price: 'Rs. 200/kg', status: 'APPROVED' },
  { name: 'Spinach', price: 'Rs. 80/bunch', status: 'PENDING_APPROVAL' },
]

const Toggle = ({ value, onChange, label }: { value: boolean; onChange: () => void; label: string }) => (
  <button
    role="switch"
    aria-checked={value}
    aria-label={label}
    onClick={onChange}
    className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent ${value ? 'bg-emerald-500' : 'bg-white/20'}`}
  >
    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? 'left-4' : 'left-0.5'}`} />
  </button>
)

const SellerProfilePage = (): JSX.Element => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { updateUser } = useAuthContext()
  const sellerProfile = useSelector((state: RootState) => state.user.sellerProfile)
  const [searchParams] = useSearchParams()

  const tabParam = searchParams.get('tab') as Tab | null
  const activeTab: Tab = tabParam && ['profile', 'business', 'password', 'settings'].includes(tabParam)
    ? tabParam
    : 'profile'

  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem('sellerAvatarUrl'))
  const [ownerName, setOwnerName] = useState(sellerProfile?.ownerName ?? '')
  const [phone, setPhone] = useState(sellerProfile?.phone ?? '')
  const [city, setCity] = useState(sellerProfile?.city ?? 'Colombo')
  const [businessName, setBusinessName] = useState(sellerProfile?.businessName ?? '')
  const [businessAddress, setBusinessAddress] = useState(sellerProfile?.businessAddress ?? '')
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [notifOrders, setNotifOrders] = useState(true)
  const [notifPayouts, setNotifPayouts] = useState(true)
  const [notifStock, setNotifStock] = useState(false)
  const [storeVisible, setStoreVisible] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [userStatus, setUserStatus] = useState<string>('ACTIVE')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('fr_token')
        const res = await fetch('http://localhost:5000/api/v1/customer/profile/status', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setIsApproved(data.isApproved)
          setUserStatus(data.status)
        }
      } catch (err) {
        console.error('Failed to fetch seller status', err)
      }
    }
    fetchStatus()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setAvatarUrl(base64)
        localStorage.setItem('sellerAvatarUrl', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    console.log('TOKEN BEING SENT:', token)
    const prev = sellerProfile
    setSaved(true)

    try {
      if (activeTab === 'profile') {
        const res = await fetch('http://localhost:5000/api/v1/customer/profile/personal', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: ownerName, phone, city }),
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update', 'error'); setSaved(false); return }
        dispatch(updateSellerProfile({ ownerName, phone, city }))
        updateUser({ name: data.user.name }) // ← persists after logout/login
        if (prev?.ownerName !== ownerName) showToast(`Name updated to ${ownerName}`)
        else if (prev?.phone !== phone) showToast(`Phone number updated to ${phone}`)
        else if (prev?.city !== city) showToast(`City updated to ${city}`)
        else showToast('Personal info updated successfully')

      } else if (activeTab === 'business') {
        const res = await fetch('http://localhost:5000/api/v1/vendor/profile/business', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ businessName, businessAddress, city }),
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update business info', 'error'); setSaved(false); return }
        dispatch(updateSellerProfile({ businessName, businessAddress }))
        if (prev?.businessName !== businessName) showToast(`Business name updated to ${businessName}`)
        else if (prev?.businessAddress !== businessAddress) showToast(`Business address updated`)
        else showToast('Business info updated successfully')

      } else if (activeTab === 'password') {
        const currentPwd = (document.getElementById('current-password') as HTMLInputElement)?.value
        const newPwd = (document.getElementById('new-password') as HTMLInputElement)?.value
        const res = await fetch('http://localhost:5000/api/v1/customer/profile/password', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update password', 'error'); setSaved(false); return }
        showToast('Password changed successfully')
      }
    } catch (err) {
      showToast('Something went wrong', 'error')
    }

    setTimeout(() => setSaved(false), 2500)
  }

  const goToTab = (tab: Tab) => {
    navigate(`?tab=${tab}`)
  }

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-base text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/40 transition-all'

  const statusStyles: Record<string, string> = {
    APPROVED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    PENDING_APPROVAL: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    REJECTED: 'text-red-400 bg-red-400/10 border-red-400/20',
  }

  const displayName = sellerProfile?.businessName || sellerProfile?.ownerName || 'Vendor'

  const navSections = [
    {
      label: 'Account',
      items: [
        {
          tab: 'profile' as Tab,
          label: 'Personal info',
          icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
              <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            </svg>
          ),
        },
        {
          tab: 'business' as Tab,
          label: 'Business info',
          icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
              <rect x="2" y="6" width="12" height="8" rx="1" /><path d="M5 6V4a3 3 0 016 0v2" /><path d="M8 10v2" />
            </svg>
          ),
        },
      ],
    },
    {
      label: 'Security',
      items: [
        {
          tab: 'password' as Tab,
          label: 'Password',
          icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
              <rect x="2" y="7" width="12" height="7" rx="1" /><path d="M5 7V5a3 3 0 016 0v2" />
            </svg>
          ),
        },
      ],
    },
    {
      label: 'Preferences',
      items: [
        {
          tab: 'settings' as Tab,
          label: 'Settings',
          icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="2" /><path d="M8 2v1M8 13v1M2 8h1M13 8h1M3.5 3.5l.7.7M11.8 11.8l.7.7M3.5 12.5l.7-.7M11.8 4.2l.7-.7" />
            </svg>
          ),
        },
      ],
    },
  ]

  return (
    <main className="flex min-h-screen gap-0" aria-label="Vendor profile page">

      {/* SIDEBAR */}
      <aside className="flex w-64 flex-shrink-0 flex-col gap-4 border-r border-white/10 px-3 py-6" aria-label="Profile navigation">

        {/* Avatar + info */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center">
          <div className="relative">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-supply-teal text-2xl font-bold text-white ring-2 ring-white/10 overflow-hidden"
              role="img"
              aria-label={`Profile picture for ${displayName}`}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                : displayName.charAt(0).toUpperCase()
              }
            </div>
            <label
              className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-900 text-[9px] text-slate-300 hover:bg-slate-700 transition-colors"
              aria-label="Change profile picture"
              title="Change profile picture"
            >
              ✎
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <p className="text-sm font-semibold text-slate-50">{displayName}</p>
            </div>
            <p className="text-[11px] text-slate-400">{sellerProfile?.email ?? ''}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              Seller
            </span>
            {isApproved === true && (
              <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                ✓ Approved
              </span>
            )}
            {isApproved === false && userStatus !== 'SUSPENDED' && (
              <span className="rounded-full bg-yellow-500/10 px-3 py-0.5 text-[10px] font-semibold text-yellow-400 border border-yellow-500/20">
                ⏳ Pending
              </span>
            )}
            {userStatus === 'SUSPENDED' && (
              <span className="rounded-full bg-red-500/10 px-3 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                🚫 Suspended
              </span>
            )}
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-3" aria-label="Profile sections">
          {navSections.map((section, si) => (
            <div key={section.label}>
              {si > 0 && <div className="my-2 border-t border-white/10" />}
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {section.label}
              </p>
              {section.items.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => goToTab(item.tab)}
                  aria-current={activeTab === item.tab ? 'page' : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    activeTab === item.tab
                      ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          <div className="my-2 border-t border-white/10" />
          <button
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Sign out"
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
              <path d="M10 2h3a1 1 0 011 1v10a1 1 0 01-1 1h-3M7 11l3-3-3-3M10 8H3" />
            </svg>
            Sign out
          </button>
        </nav>

        {/* Stats */}
        <div className="flex flex-col gap-2">
          {[
            { label: 'Products', value: '3' },
            { label: 'Orders', value: '18' },
            { label: 'Member since', value: '2024' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <span className="text-xs text-slate-400">{s.label}</span>
              <span className="text-sm font-semibold text-slate-50">{s.value}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Personal Info */}
        <section hidden={activeTab !== 'profile'} aria-label="Personal information">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">Account Details</p>
                <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Personal Information</h2>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="owner-name" className="block text-sm font-medium text-slate-300">Owner name</label>
                    <input id="owner-name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} autoComplete="name" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="seller-email" className="block text-sm font-medium text-slate-300">Email</label>
                    <input id="seller-email" value={sellerProfile?.email ?? ''} disabled className={`${inputClass} cursor-not-allowed opacity-50`} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="seller-phone" className="block text-sm font-medium text-slate-300">Phone number</label>
                    <input id="seller-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+94 77 123 4567" type="tel" autoComplete="tel" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="seller-city" className="block text-sm font-medium text-slate-300">City</label>
                    <select id="seller-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }}>
                      {['Colombo', 'Kandy', 'Galle', 'Jaffna'].map((c) => <option key={c} style={{ backgroundColor: '#0f2d2d', color: '#f8fafc' }}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {saved ? '✓ Changes saved' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Business Info */}
        <section hidden={activeTab !== 'business'} aria-label="Business information">
          {activeTab === 'business' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">Store Details</p>
                <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Business Information</h2>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="business-name" className="block text-sm font-medium text-slate-300">Business name</label>
                    <input id="business-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} placeholder="Green Market" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="business-address" className="block text-sm font-medium text-slate-300">Business address</label>
                    <input id="business-address" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className={inputClass} placeholder="No. 45, Market Street, Colombo" autoComplete="street-address" />
                  </div>
                </div>

                {/* Products */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-300">Your Products</p>
                  <ul className="space-y-2">
                    {mockProducts.map((p) => (
                      <li key={p.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors">
                        <div>
                          <p className="text-base font-medium text-slate-50">{p.name}</p>
                          <p className="text-sm text-slate-400">{p.price}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-0.5 text-sm font-medium ${statusStyles[p.status]}`}>
                          {p.status === 'PENDING_APPROVAL' ? 'Pending' : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Earnings */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-200">Earnings Summary</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'This month', value: 'Rs. 32,500' },
                      { label: 'Last month', value: 'Rs. 28,100' },
                      { label: 'Total orders', value: '18' },
                      { label: 'Pending payout', value: 'Rs. 8,400' },
                    ].map((e) => (
                      <div key={e.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                        <p className="text-base font-semibold text-slate-50">{e.value}</p>
                        <p className="text-xs text-slate-400">{e.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {saved ? '✓ Changes saved' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Password */}
        <section hidden={activeTab !== 'password'} aria-label="Change password">
          {activeTab === 'password' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">Security</p>
                <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Change Password</h2>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
                {[
                  { id: 'current-password', label: 'Current password', placeholder: 'Enter current password', auto: 'current-password' },
                  { id: 'new-password', label: 'New password', placeholder: 'Enter new password', auto: 'new-password' },
                  { id: 'confirm-password', label: 'Confirm new password', placeholder: 'Repeat new password', auto: 'new-password' },
                ].map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <label htmlFor={f.id} className="block text-sm font-medium text-slate-300">{f.label}</label>
                    <input id={f.id} type="password" placeholder={f.placeholder} className={inputClass} autoComplete={f.auto} />
                  </div>
                ))}
                <button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {saved ? '✓ Password updated' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Settings */}
        <section hidden={activeTab !== 'settings'} aria-label="Settings">
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">Preferences</p>
                <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Settings</h2>
              </div>

              <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-base font-semibold text-slate-200">Notifications</p>
                {[
                  { label: 'New orders', sub: 'When a customer places an order', value: notifOrders, onChange: () => setNotifOrders(!notifOrders) },
                  { label: 'Payout alerts', sub: 'When earnings are transferred to you', value: notifPayouts, onChange: () => setNotifPayouts(!notifPayouts) },
                  { label: 'Low stock alerts', sub: 'When your product stock runs low', value: notifStock, onChange: () => setNotifStock(!notifStock) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                    <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                  </div>
                ))}
              </fieldset>

              <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-base font-semibold text-slate-200">Privacy</p>
                {[
                  { label: 'Store visibility', sub: 'Allow customers to find your store', value: storeVisible, onChange: () => setStoreVisible(!storeVisible) },
                  { label: 'Share data for recommendations', sub: 'Help us improve your experience', value: dataSharing, onChange: () => setDataSharing(!dataSharing) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                    <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                  </div>
                ))}
              </fieldset>

              <div className="space-y-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm font-semibold text-red-400">Danger Zone</p>
                <p className="text-sm text-slate-400">Once deleted, your store and all data will be permanently removed.</p>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                    Delete My Store
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-300">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors">Yes, delete it</button>
                      <button onClick={() => setShowDeleteConfirm(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  )
}

export default SellerProfilePage