import { useState } from 'react'
import type { JSX } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { RootState } from '../../store'
import { updateBuyerProfile } from '../../store/slices/userSlice'
import { useToast } from '../../context/ToastContext'
import { useAuthContext } from '../../context/AuthContext'
import RatingModal from '../../components/RatingModal'

const mockOrders = [
  { id: 'ORD-2024-042', date: 'Dec 1, 2024', status: 'Delivered', total: 'Rs. 1,240', items: 4, driverId: 'driver-1', buyerId: 'buyer-1', sellerName: 'Green Market' },
  { id: 'ORD-2024-038', date: 'Nov 28, 2024', status: 'Delivered', total: 'Rs. 870', items: 2, driverId: 'driver-2', buyerId: 'buyer-1', sellerName: 'Fresh Farms' },
  { id: 'ORD-2024-031', date: 'Nov 20, 2024', status: 'Cancelled', total: 'Rs. 530', items: 1, driverId: 'driver-3', buyerId: 'buyer-1', sellerName: 'City Veggies' },
]

type Tab = 'profile' | 'orders' | 'address' | 'password' | 'settings'

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

const CustomerProfilePage = (): JSX.Element => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { updateUser } = useAuthContext()
  const buyerProfile = useSelector((state: RootState) => state.user.buyerProfile)
  const [searchParams] = useSearchParams()

  const tabParam = searchParams.get('tab') as Tab | null
  const activeTab: Tab = tabParam && ['profile', 'orders', 'address', 'password', 'settings'].includes(tabParam)
    ? tabParam
    : 'profile'

  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem('buyerAvatarUrl'))
  const [name, setName] = useState(buyerProfile?.name ?? '')
  const [phone, setPhone] = useState(buyerProfile?.phone ?? '')
  const [city, setCity] = useState(buyerProfile?.city ?? 'Colombo')
  const [address, setAddress] = useState(buyerProfile?.address ?? '')
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [ratingOrder, setRatingOrder] = useState<typeof mockOrders[0] | null>(null)

  const [notifOrders, setNotifOrders] = useState(true)
  const [notifPromos, setNotifPromos] = useState(false)
  const [notifStock, setNotifStock] = useState(true)
  const [profileVisible, setProfileVisible] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setAvatarUrl(base64)
        localStorage.setItem('buyerAvatarUrl', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    console.log('TOKEN BEING SENT:', token)
    const prev = buyerProfile
    setSaved(true)

    try {
      if (activeTab === 'profile') {
        const res = await fetch('http://localhost:5000/api/v1/customer/profile/personal', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, phone, city }),
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update', 'error'); setSaved(false); return }
        dispatch(updateBuyerProfile({ name, phone, city }))
        updateUser({ name: data.user.name })
        if (prev?.name !== name) showToast(`Name updated to ${name}`)
        else if (prev?.phone !== phone) showToast(`Phone number updated to ${phone}`)
        else if (prev?.city !== city) showToast(`City updated to ${city}`)
        else showToast('Personal info updated successfully')

      } else if (activeTab === 'address') {
        const res = await fetch('http://localhost:5000/api/v1/customer/profile/address', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ address, city }),
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update address', 'error'); setSaved(false); return }
        dispatch(updateBuyerProfile({ address, city }))
        if (prev?.address !== address) showToast(`Address updated to ${address}`)
        else if (prev?.city !== city) showToast(`City updated to ${city}`)
        else showToast('Delivery address updated successfully')

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

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-base text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/40 transition-all'

  const statusStyles: Record<string, string> = {
    Delivered: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
    Pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  }

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
          tab: 'orders' as Tab,
          label: 'Orders',
          icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
              <rect x="2" y="3" width="12" height="10" rx="1" /><path d="M5 7h6M5 10h4" />
            </svg>
          ),
        },
        {
          tab: 'address' as Tab,
          label: 'Delivery address',
          icon: (
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
              <path d="M8 2C5.8 2 4 3.8 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z" /><circle cx="8" cy="6" r="1.5" />
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
    <main className="flex min-h-screen gap-0" aria-label="Customer profile page">

      {/* Rating Modal */}
      {ratingOrder && (
        <RatingModal
          isOpen={!!ratingOrder}
          onClose={() => setRatingOrder(null)}
          orderId={ratingOrder.id}
          driverId={ratingOrder.driverId}
          buyerId={ratingOrder.buyerId}
          sellerName={ratingOrder.sellerName}
        />
      )}

      {/* SIDEBAR */}
      <aside className="flex w-64 flex-shrink-0 flex-col gap-4 border-r border-white/10 px-3 py-6" aria-label="Profile navigation">

        {/* Avatar + user info */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center">
          <div className="relative">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-supply-teal text-2xl font-bold text-white ring-2 ring-white/10 overflow-hidden"
              role="img"
              aria-label={`Profile picture for ${buyerProfile?.name ?? 'User'}`}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                : (buyerProfile?.name ?? 'U').charAt(0).toUpperCase()
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
            <p className="text-sm font-semibold text-slate-50">{buyerProfile?.name ?? 'User'}</p>
            <p className="text-[11px] text-slate-400">{buyerProfile?.email ?? ''}</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            Buyer
          </span>
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

          {/* Divider + sign out */}
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
            { label: 'Orders', value: '3' },
            { label: 'Delivered', value: '2' },
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
      <div className="flex-1 px-6 py-6 overflow-y-auto">

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
                    <label htmlFor="full-name" className="block text-sm font-medium text-slate-300">Full name</label>
                    <input id="full-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoComplete="name" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
                    <input id="email" value={buyerProfile?.email ?? ''} disabled className={`${inputClass} cursor-not-allowed opacity-50`} autoComplete="email" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300">Phone number</label>
                    <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+94 71 234 5678" type="tel" autoComplete="tel" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="city" className="block text-sm font-medium text-slate-300">City</label>
                    <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }}>
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

        {/* Orders */}
        <section hidden={activeTab !== 'orders'} aria-label="Order history">
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">History</p>
                <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Your Orders</h2>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                <ul className="space-y-2">
                  {mockOrders.map((order) => (
                    <li key={order.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-50">{order.id}</p>
                        <p className="mt-0.5 text-sm text-slate-400">{order.date} · {order.items} items · {order.sellerName}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-base font-semibold text-slate-200">{order.total}</p>
                        <span className={`rounded-full border px-3 py-0.5 text-sm font-medium ${statusStyles[order.status] ?? statusStyles['Pending']}`}>
                          {order.status}
                        </span>
                        {order.status === 'Delivered' && (
                          <button
                            onClick={() => setRatingOrder(order)}
                            className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            ★ Rate order
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Delivery Address */}
        <section hidden={activeTab !== 'address'} aria-label="Delivery address">
          {activeTab === 'address' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">Delivery</p>
                <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Delivery Address</h2>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="street-address" className="block text-sm font-medium text-slate-300">Full address</label>
                  <input id="street-address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="No. 12, Flower Road" autoComplete="street-address" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="delivery-city" className="block text-sm font-medium text-slate-300">City</label>
                  <select id="delivery-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }}>
                    {['Colombo', 'Kandy', 'Galle', 'Jaffna'].map((c) => <option key={c} style={{ backgroundColor: '#0f2d2d', color: '#f8fafc' }}>{c}</option>)}
                  </select>
                </div>
                <button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {saved ? '✓ Address saved' : 'Save Address'}
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
                  { label: 'Order updates', sub: 'Confirmed, picked up, delivered', value: notifOrders, onChange: () => setNotifOrders(!notifOrders) },
                  { label: 'Promotions & offers', sub: 'Deals and discounts from vendors', value: notifPromos, onChange: () => setNotifPromos(!notifPromos) },
                  { label: 'Low stock alerts', sub: 'When your favourite items run low', value: notifStock, onChange: () => setNotifStock(!notifStock) },
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
                  { label: 'Profile visibility', sub: 'Allow vendors to see your profile', value: profileVisible, onChange: () => setProfileVisible(!profileVisible) },
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
                <p className="text-sm text-slate-400">Once deleted, your account and all data will be permanently removed.</p>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                    Delete My Account
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

export default CustomerProfilePage