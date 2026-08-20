//ProfilePage.tsx

import { useState, useEffect, useRef } from 'react'
import type { JSX } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { RootState } from '../store'
import { updateSellerProfile, updateBuyerProfile } from '../store/slices/userSlice'
import { useToast } from '../context/ToastContext'
import { useAuthContext } from '../context/AuthContext'
import MapAddressPicker from '../components/MapAddressPicker'

const API = `${import.meta.env.VITE_API_URL}/api/v1/profile`

// ─── Types ────────────────────────────────────────────────────────

type Role      = 'buyer' | 'seller' | 'admin'
type BuyerTab  = 'profile' | 'address' | 'password' | 'settings'
type SellerTab = 'profile' | 'business' | 'password' | 'settings'
type AdminTab  = 'profile' | 'password' | 'settings'
type Tab       = BuyerTab | SellerTab | AdminTab

type Product = { name: string; price: string; status: 'APPROVED' | 'PENDING_APPROVAL' }
type SavedAddress = { id: string; label: string; address: string; city: string; lat?: number; lng?: number; isDefault: boolean }
type StatsData = {
  totalOrders?: number; delivered?: number; memberSince?: string;
  totalProducts?: number; totalUsers?: number; activeVendors?: number;
  ordersToday?: number; adminSince?: string;
}

// ─── Validation helpers ───────────────────────────────────────────

const isValidName       = (v: string) => /^[A-Za-z\s]+$/.test(v.trim()) && v.trim().length > 0
const isValidLocalPhone = (v: string) => /^\d{9}$/.test(v)

// ─── Shared CSS ───────────────────────────────────────────────────

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/40 transition-all'

// ─── PhoneInput ───────────────────────────────────────────────────

const PhoneInput = ({
  value, onChange, label = 'Phone number',
}: {
  value: string; onChange: (v: string) => void; label?: string
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
    onChange(digits)
  }

  const isTouched = value.length > 0
  const isValid   = value === '' || isValidLocalPhone(value)

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/40 transition-all">
        <span className="flex items-center px-3 bg-white/10 text-sm text-slate-300 border-r border-white/10 select-none whitespace-nowrap">
          🇱🇰 +94
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder="771234567"
          className="flex-1 bg-white/5 px-3 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500"
          autoComplete="tel-national"
        />
      </div>
      {isTouched && !isValid && (
        <p className="text-[10px] text-red-400">✕ Enter exactly 9 digits (e.g. 771234567)</p>
      )}
      {isTouched && isValid && value.length === 9 && (
        <p className="text-[10px] text-emerald-400">✓ Looks good</p>
      )}
    </div>
  )
}

// ─── NameInput ────────────────────────────────────────────────────

const NameInput = ({
  value, onChange, label, placeholder = '', autoComplete = 'name',
}: {
  value: string; onChange: (v: string) => void; label: string; placeholder?: string; autoComplete?: string
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^A-Za-z\s]/g, '')
    onChange(filtered)
  }

  const isTouched = value.length > 0
  const isValid   = isValidName(value)

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClass}
        autoComplete={autoComplete}
      />
      {isTouched && !isValid && (
        <p className="text-[10px] text-red-400">✕ Only letters and spaces allowed</p>
      )}
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────

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

// ─── Sidebar tab configs ──────────────────────────────────────────

const buyerTabs = [
  { section: 'Account',      items: [
    { tab: 'profile'  as Tab, label: 'Personal info',    icon: 'user'     },
    { tab: 'address'  as Tab, label: 'Delivery address', icon: 'location' },
  ]},
  { section: 'Security',     items: [{ tab: 'password' as Tab, label: 'Password', icon: 'lock' }] },
  { section: 'Preferences',  items: [{ tab: 'settings' as Tab, label: 'Settings', icon: 'settings' }] },
]
const sellerTabs = [
  { section: 'Account',      items: [
    { tab: 'profile'  as Tab, label: 'Personal info', icon: 'user'     },
    { tab: 'business' as Tab, label: 'Business info', icon: 'business' },
  ]},
  { section: 'Security',     items: [{ tab: 'password' as Tab, label: 'Password', icon: 'lock' }] },
  { section: 'Preferences',  items: [{ tab: 'settings' as Tab, label: 'Settings', icon: 'settings' }] },
]
const adminTabs = [
  { section: 'Account',      items: [{ tab: 'profile'  as Tab, label: 'Personal info', icon: 'user' }] },
  { section: 'Security',     items: [{ tab: 'password' as Tab, label: 'Password', icon: 'lock' }] },
  { section: 'Preferences',  items: [{ tab: 'settings' as Tab, label: 'Settings', icon: 'settings' }] },
]

// ─── TabIcon ──────────────────────────────────────────────────────

const TabIcon = ({ type }: { type: string }) => {
  const icons: Record<string, JSX.Element> = {
    user: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
        <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    ),
    orders: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
        <rect x="2" y="3" width="12" height="10" rx="1" /><path d="M5 7h6M5 10h4" />
      </svg>
    ),
    location: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
        <path d="M8 2C5.8 2 4 3.8 4 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.2-1.8-4-4-4z" /><circle cx="8" cy="6" r="1.5" />
      </svg>
    ),
    lock: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
        <rect x="2" y="7" width="12" height="7" rx="1" /><path d="M5 7V5a3 3 0 016 0v2" />
      </svg>
    ),
    settings: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="2" />
        <path d="M8 2v1M8 13v1M2 8h1M13 8h1M3.5 3.5l.7.7M11.8 11.8l.7.7M3.5 12.5l.7-.7M11.8 4.2l.7-.7" />
      </svg>
    ),
    business: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
        <rect x="2" y="6" width="12" height="8" rx="1" /><path d="M5 6V4a3 3 0 016 0v2" /><path d="M8 10v2" />
      </svg>
    ),
    wishlist: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
        <path d="M8 13.5s-5.5-3.3-5.5-7A3 3 0 018 4.5 3 3 0 0113.5 6.5c0 3.7-5.5 7-5.5 7z" />
      </svg>
    ),
    payments: (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
        <rect x="1.5" y="4" width="13" height="9" rx="1.5" /><path d="M1.5 6.5h13" strokeLinecap="round" />
      </svg>
    ),
  }
  return icons[type] ?? null
}

// ─── ProfilePage ──────────────────────────────────────────────────

const ProfilePage = (): JSX.Element => {
  const dispatch                          = useDispatch()
  const navigate                          = useNavigate()
  const { showToast }                     = useToast()
  const { user, logout, updateUser }      = useAuthContext()
  const buyerProfile                      = useSelector((state: RootState) => state.user.buyerProfile)
  const sellerProfile                     = useSelector((state: RootState) => state.user.sellerProfile)
  const [searchParams]                    = useSearchParams()
  const role                              = (user?.role?.toLowerCase() ?? 'buyer') as Role

  const validTabs: Tab[] =
    role === 'admin'  ? ['profile', 'password', 'settings'] :
    role === 'seller' ? ['profile', 'business', 'password', 'settings'] :
                        ['profile', 'address', 'password', 'settings']

  const tabParam               = searchParams.get('tab') as Tab | null
  const activeTab: Tab         = tabParam && validTabs.includes(tabParam) ? tabParam : 'profile'
  const tabSections            = role === 'admin' ? adminTabs : role === 'seller' ? sellerTabs : buyerTabs

  // ── State ──
  const [saved, setSaved]         = useState(false)

  const [name, setName]   = useState(
    role === 'seller' ? (sellerProfile?.ownerName ?? '') : (buyerProfile?.name ?? '')
  )
  const stripPrefix = (p: string) => p.startsWith('+94') ? p.slice(3) : p.startsWith('94') && p.length === 11 ? p.slice(2) : p
  const [phoneLocal, setPhoneLocal] = useState(
    role === 'seller'
      ? stripPrefix(sellerProfile?.phone ?? '')
      : stripPrefix(buyerProfile?.phone ?? '')
  )
  const [city, setCity]   = useState(
    role === 'seller' ? (sellerProfile?.city ?? 'Colombo') : (buyerProfile?.city ?? 'Colombo')
  )
  const [address, setAddress]                 = useState(buyerProfile?.address          ?? '')
  const [coords, setCoords]                   = useState<{ lat: number; lng: number } | null>(null)

  // Saved addresses (multi-address, buyer + seller)
  const [addresses, setAddresses]               = useState<SavedAddress[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null) // null = closed, 'new' = adding
  const [addrLabel, setAddrLabel]                = useState('')
  const [businessName, setBusinessName]       = useState(sellerProfile?.businessName    ?? '')
  const [adminName, setAdminName]             = useState(user?.name ?? 'Super Admin')
  const [adminPhone, setAdminPhone]           = useState('')

  // Notification preferences — fetched from / saved to the backend so the
  // toggles here actually control whether notification.service.ts sends
  // notifications (mirrors the mobile app's NotificationsSection).
  const [notifPrefs, setNotifPrefs]               = useState<Record<string, boolean>>({})
  const [notifPrefsLoading, setNotifPrefsLoading] = useState(true)

  // Privacy / platform toggles
  const [auditLogging,       setAuditLogging]       = useState(true)
  const [newRegistrations,   setNewRegistrations]   = useState(true)
  const [showPwdFields, setShowPwdFields] = useState<Record<string, boolean>>({})

  // Danger zone
  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false)
  const [showSessionConfirm, setShowSessionConfirm] = useState(false)
  const [deleteLoading,      setDeleteLoading]      = useState(false)

  // Real data
  const [products,        setProducts]        = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [statsData,       setStatsData]       = useState<StatsData | null>(null)

  // ── Fetches ──

  const hasFetchedProducts = useRef(false)
  const hasFetchedStats    = useRef(false)
  const hasFetchedAddresses = useRef(false)
  const hasFetchedNotifPrefs = useRef(false)

  useEffect(() => {
    if (role !== 'seller' || hasFetchedProducts.current) return
    hasFetchedProducts.current = true
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) return
    setProductsLoading(true)
    fetch(`${API}/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d?.products) setProducts(d.products) }).catch(() => {}).finally(() => setProductsLoading(false))
  }, [role])

  useEffect(() => {
    if (hasFetchedStats.current) return
    hasFetchedStats.current = true
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) return
    fetch(`${API}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d?.stats) setStatsData(d.stats) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (role === 'admin' || hasFetchedAddresses.current) return
    hasFetchedAddresses.current = true
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) return
    setAddressesLoading(true)
    fetch(`${API}/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d?.addresses) setAddresses(d.addresses) }).catch(() => {}).finally(() => setAddressesLoading(false))
  }, [role])

  // Notification preferences — same endpoint the mobile app uses:
  // GET /profile/notification-prefs -> { prefs: Record<string, boolean> }
  useEffect(() => {
    if (hasFetchedNotifPrefs.current) return
    hasFetchedNotifPrefs.current = true
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) { setNotifPrefsLoading(false); return }
    fetch(`${API}/notification-prefs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setNotifPrefs(d.prefs ?? {}) })
      .catch(() => { /* fall back to empty — toggles default to "on" below */ })
      .finally(() => setNotifPrefsLoading(false))
  }, [])

  // ── Saved addresses (multi-address) ──

  const openAddAddress = () => {
    setEditingAddressId('new')
    setAddrLabel('')
    setAddress('')
    setCity('Colombo')
    setCoords(null)
  }

  const openEditAddress = (a: SavedAddress) => {
    setEditingAddressId(a.id)
    setAddrLabel(a.label)
    setAddress(a.address)
    setCity(a.city)
    setCoords(a.lat != null && a.lng != null ? { lat: a.lat, lng: a.lng } : null)
  }

  const cancelAddressEdit = () => setEditingAddressId(null)

  const handleSaveAddress = async () => {
    if (!address.trim()) { showToast('Please enter an address', 'error'); return }
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) { showToast('You are not authenticated. Please sign in again.', 'error'); return }
    const payload = { label: addrLabel.trim() || 'Address', address, city, latitude: coords?.lat, longitude: coords?.lng }
    try {
      if (editingAddressId === 'new') {
        const res  = await fetch(`${API}/addresses`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to add address', 'error'); return }
        setAddresses((prev) => [...prev, data.address ?? { id: crypto.randomUUID(), ...payload, lat: payload.latitude, lng: payload.longitude, isDefault: prev.length === 0 }])
        showToast('Address added')
      } else if (editingAddressId) {
        const id   = editingAddressId
        const res  = await fetch(`${API}/addresses/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update address', 'error'); return }
        setAddresses((prev) => prev.map((a) => a.id === id ? { ...a, label: payload.label, address: payload.address, city: payload.city, lat: payload.latitude, lng: payload.longitude } : a))
        showToast('Address updated')
      }
      setEditingAddressId(null)
    } catch {
      showToast('Network error — please check your connection', 'error')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    try {
      const res = await fetch(`${API}/addresses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) { const d = await res.json(); showToast(d.message ?? 'Failed to remove address', 'error'); return }
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      showToast('Address removed')
    } catch {
      showToast('Network error — please check your connection', 'error')
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    try {
      const res = await fetch(`${API}/addresses/${id}/default`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) { showToast('Failed to set default address', 'error'); return }
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
      showToast('Default address updated')
    } catch {
      showToast('Network error — please check your connection', 'error')
    }
  }

  const openSupportEmail = () => {
    const to = 'support@freshroute.lk'
    const subject = 'Support Request'
    const body = `\n\n---\nSent from: ${displayEmail || 'N/A'}\nRole: ${roleLabel}`
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(gmailUrl, '_blank')
  }

  // ── Notification preference toggle ──
  // Optimistically flips the toggle, then PATCHes just that one key —
  // mirrors NotificationsSection.toggle() in the mobile app.

  const toggleNotifPref = async (key: string) => {
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) { showToast('You are not authenticated. Please sign in again.', 'error'); return }

    const previous = notifPrefs
    const next     = { ...notifPrefs, [key]: !(notifPrefs[key] ?? true) }
    setNotifPrefs(next) // optimistic update

    try {
      const res = await fetch(`${API}/notification-prefs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prefs: { [key]: next[key] } }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setNotifPrefs(previous) // revert on failure
      showToast('Failed to update notification preference', 'error')
    }
  }

  // ── Save ──

  const handleSave = async () => {
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) { showToast('You are not authenticated. Please sign in again.', 'error'); return }

    // Validate before sending
    if (activeTab === 'profile') {
      const currentName = role === 'admin' ? adminName : name
      if (currentName.trim() && !isValidName(currentName)) {
        showToast('Name can only contain letters and spaces', 'error'); return
      }
      const currentPhone = role === 'admin' ? adminPhone : phoneLocal
      if (currentPhone && !isValidLocalPhone(currentPhone)) {
        showToast('Phone number must be exactly 9 digits', 'error'); return
      }
    }
    setSaved(true)
    try {
      if (activeTab === 'profile') {
        const phone = phoneLocal ? `+94${phoneLocal}` : undefined
        if (role === 'buyer') {
          const res  = await fetch(`${API}/personal`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, phone }) })
          const data = await res.json()
          if (!res.ok) { showToast(data.message ?? 'Failed to update', 'error'); setSaved(false); return }
          dispatch(updateBuyerProfile({ name, phone: phone ?? '' }))
          updateUser({ name: data.user?.name ?? name })
          showToast('Personal info updated successfully')
        } else if (role === 'seller') {
          const res  = await fetch(`${API}/personal`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, phone }) })
          const data = await res.json()
          if (!res.ok) { showToast(data.message ?? 'Failed to update', 'error'); setSaved(false); return }
          dispatch(updateSellerProfile({ ownerName: name, phone: phone ?? '' }))
          updateUser({ name: data.user?.name ?? name })
          showToast('Personal info updated successfully')
        } else {
          showToast('Profile updated successfully')
        }
      } else if (activeTab === 'business' && role === 'seller') {
        const res  = await fetch(`${API}/business`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ businessName }),
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update business info', 'error'); setSaved(false); return }
        dispatch(updateSellerProfile({ businessName }))
        showToast('Business info updated successfully')
      } else if (activeTab === 'password') {
        const currentPwd = (document.getElementById('current-password') as HTMLInputElement)?.value?.trim()
        const newPwd     = (document.getElementById('new-password')     as HTMLInputElement)?.value?.trim()
        const confirmPwd = (document.getElementById('confirm-password') as HTMLInputElement)?.value?.trim()
        if (!currentPwd || !newPwd || !confirmPwd) { showToast('Please fill in all password fields', 'error'); setSaved(false); return }
        if (newPwd !== confirmPwd) { showToast('New passwords do not match', 'error'); setSaved(false); return }
        if (newPwd.length < 8)    { showToast('Password must be at least 8 characters', 'error'); setSaved(false); return }
        const res  = await fetch(`${API}/password`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }) })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update password', 'error'); setSaved(false); return }
        showToast('Password changed successfully')
      }
    } catch {
      showToast('Network error — please check your connection', 'error')
    }
    setTimeout(() => setSaved(false), 2500)
  }

  // ── Delete ──

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
      const res   = await fetch(`${API}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) { const d = await res.json(); showToast(d.message ?? 'Failed to delete account', 'error'); setDeleteLoading(false); return }
      showToast('Account deleted successfully')
      navigate('/')
      setTimeout(() => logout(), 100)
    } catch {
      showToast('Something went wrong', 'error'); setDeleteLoading(false)
    }
  }

  const goToTab = (tab: Tab) => navigate(`?tab=${tab}`)

  // ── Derived display values ──

  const displayName =
    role === 'seller' ? (sellerProfile?.businessName || sellerProfile?.ownerName || 'Vendor') :
    role === 'admin'  ? adminName :
                        (buyerProfile?.name ?? user?.name ?? 'User')

  const displayEmail =
    role === 'seller' ? (sellerProfile?.email  ?? user?.email ?? '') :
    role === 'admin'  ? (user?.email ?? 'admin@freshroute.lk') :
                        (buyerProfile?.email ?? user?.email ?? '')

  const roleLabel    = role === 'admin' ? 'Admin' : role === 'seller' ? 'Seller' : 'Buyer'
  const roleGradient = role === 'admin' ? 'from-emerald-500 to-teal-600' : 'from-emerald-500 to-supply-teal'

  const statusStyles: Record<string, string> = {
    Delivered:        'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Cancelled:        'text-red-400    bg-red-400/10    border-red-400/20',
    Pending:          'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    APPROVED:         'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    PENDING_APPROVAL: 'text-yellow-400  bg-yellow-400/10  border-yellow-400/20',
  }

  const saveLabel =
    activeTab === 'password' ? (saved ? '✓ Password updated' : 'Update Password') :
                               (saved ? '✓ Changes saved'    : 'Save Changes')

  // ── Render ──

  const renderAddressManager = (addLabel: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Saved addresses</p>
        {editingAddressId === null && (
          <button
            onClick={openAddAddress}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >{addLabel}</button>
        )}
      </div>

      {addressesLoading ? (
        <p className="py-4 text-center text-sm text-slate-400">Loading addresses…</p>
      ) : addresses.length === 0 && editingAddressId === null ? (
        <p className="py-4 text-center text-sm text-slate-400">No addresses saved yet.</p>
      ) : (
        <ul className="space-y-2">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-50">{a.label}</p>
                    {a.isDefault && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Default</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400 truncate">{a.address}{a.city ? `, ${a.city}` : ''}</p>
                </div>
                <div className="flex flex-shrink-0 gap-1.5">
                  {!a.isDefault && (
                    <button onClick={() => handleSetDefaultAddress(a.id)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 transition-colors">Set default</button>
                  )}
                  <button onClick={() => openEditAddress(a)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 transition-colors">Edit</button>
                  <button onClick={() => handleDeleteAddress(a.id)} className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400 hover:bg-red-500/20 transition-colors">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingAddressId !== null && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-slate-200">{editingAddressId === 'new' ? 'New address' : 'Edit address'}</p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Label</label>
            <input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder="Home, Work, Store, etc." className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Full address</label>
            <MapAddressPicker
              address={address}
              initialLat={coords?.lat}
              initialLng={coords?.lng}
              onChange={({ address: a, city: c, lat, lng }) => {
                setAddress(a)
                if (c) setCity(c)
                setCoords({ lat, lng })
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveAddress}
              className={`rounded-xl bg-gradient-to-r ${roleGradient} px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            >{editingAddressId === 'new' ? 'Add address' : 'Save changes'}</button>
            <button onClick={cancelAddressEdit} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    /* ── PROFILE PAGE ROOT ──
       No h-screen / overflow-hidden here — this page lives INSIDE MainLayout's
       own <main class="flex-1 overflow-y-auto ..."> scroll container, so this
       page must NOT try to own scrolling itself. Only the sidebar is pinned
       via `sticky`, so it stays in view while MainLayout scrolls the page. */
    <div className="flex gap-0" aria-label="Profile page">

      {/* ── SIDEBAR ── */}
      <aside className="sticky top-0 flex h-fit max-h-screen w-64 flex-shrink-0 flex-col gap-4 self-start border-r border-white/10 px-3 py-6">

        {/* Avatar card */}
        <div className="rounded-3xl border border-white/10 bg-supply-teal/30 px-4 py-5 text-center space-y-3">
          <div className="relative mx-auto w-fit">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${roleGradient} text-2xl font-bold text-white ring-2 ring-white/10 overflow-hidden`}
              role="img" aria-label={`Profile picture for ${displayName}`}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            {role === 'admin' && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
            )} 
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-50">{displayName}</p>
            <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex flex-col gap-1 rounded-3xl border border-white/10 bg-slate-950/40 px-2 py-3" aria-label="Profile sections">
          {tabSections.map((section, si) => (
            <div key={section.section}>
              {si > 0 && <div className="my-2 border-t border-white/10" />}
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{section.section}</p>
              {section.items.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => goToTab(item.tab)}
                  aria-current={activeTab === item.tab ? 'page' : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    activeTab === item.tab
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <TabIcon type={item.icon} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          <div className="my-2 border-t border-white/10" />
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Sign out"
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
              <path d="M10 2h3a1 1 0 011 1v10a1 1 0 01-1 1h-3M7 11l3-3-3-3M10 8H3" />
            </svg>
            Sign out
          </button>
        </nav>
      </aside>

      {/* ── MAIN CONTENT ──
          No overflow-y-auto here anymore — MainLayout's <main> is the single
          scroll container for the whole page now. */}
      <div className="flex-1 px-6 py-6 space-y-6">

        {/* ── PERSONAL INFO TAB ── */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <header className="rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Account Details</p>
              <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Personal Information</h1>
              <p className="mt-1 text-sm text-slate-300">Update your name and phone number.</p>
            </header>

            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {role === 'admin' ? (
                  <NameInput value={adminName} onChange={setAdminName} label="Full name" placeholder="Super Admin" />
                ) : (
                  <NameInput value={name} onChange={setName} label={role === 'seller' ? 'Owner name' : 'Full name'} placeholder={role === 'seller' ? 'Kamal Perera' : 'John Perera'} />
                )}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Email</label>
                  <input value={displayEmail} disabled className={`${inputClass} cursor-not-allowed opacity-50`} autoComplete="email" />
                  <p className="text-[10px] text-slate-500">Email cannot be changed here.</p>
                </div>
                {role === 'admin' ? (
                  <PhoneInput value={adminPhone} onChange={setAdminPhone} />
                ) : (
                  <PhoneInput value={phoneLocal} onChange={setPhoneLocal} />
                )}
                {role === 'admin' && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Role</label>
                    <input value="Super Administrator" disabled className={`${inputClass} cursor-not-allowed opacity-50`} />
                  </div>
                )}
              </div>

              {role === 'admin' && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {['Manage Users', 'Approve Vendors', 'View Reports', 'Edit Platform Config', 'Manage Orders', 'Audit Logs'].map((p) => (
                      <span key={p} className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[11px] font-medium text-slate-400">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSave}
                className={`rounded-xl bg-gradient-to-r ${roleGradient} px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                {saved ? '✓ Changes saved' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── BUSINESS INFO TAB ── */}
        {activeTab === 'business' && role === 'seller' && (
          <div className="space-y-5">
            <header className="rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Store Details</p>
              <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Business Information</h1>
              <p className="mt-1 text-sm text-slate-300">Manage your store name, address, and products.</p>
            </header>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300">Business name</label>
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} placeholder="Green Market" />
                </div>
              </div>

              {renderAddressManager('+ Add location')}

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-300">Your Products</p>
                {productsLoading ? (
                  <p className="py-4 text-center text-sm text-slate-400">Loading products…</p>
                ) : products.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">No products listed yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {products.map((p) => (
                      <li key={p.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-50">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.price}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${statusStyles[p.status]}`}>
                          {p.status === 'PENDING_APPROVAL' ? 'Pending' : 'Approved'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-200">Earnings Summary</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'This month',     value: (statsData as any)?.thisMonth     ?? '—' },
                    { label: 'Last month',     value: (statsData as any)?.lastMonth     ?? '—' },
                    { label: 'Total orders',   value: statsData?.totalOrders != null ? String(statsData.totalOrders) : '—' },
                    { label: 'Pending payout', value: (statsData as any)?.pendingPayout ?? '—' },
                  ].map((e) => (
                    <div key={e.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <p className="text-sm font-semibold text-slate-50">{e.value}</p>
                      <p className="text-xs text-slate-400">{e.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} className={`rounded-xl bg-gradient-to-r ${roleGradient} px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500`}>
                {saved ? '✓ Changes saved' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── DELIVERY ADDRESS TAB ── */}
        {activeTab === 'address' && role === 'buyer' && (
          <div className="space-y-5">
            <header className="rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Delivery</p>
              <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Delivery Address</h1>
              <p className="mt-1 text-sm text-slate-300">Where should your orders be delivered?</p>
            </header>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
              {renderAddressManager('+ Add address')}
            </div>
          </div>
        )}

        {/* ── PASSWORD TAB ── */}
        {activeTab === 'password' && (
          <div className="space-y-5">
            <header className="rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Security</p>
              <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Change Password</h1>
              <p className="mt-1 text-sm text-slate-300">Use a strong password with at least 8 characters.</p>
            </header>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 space-y-4">
              {[
                { id: 'current-password', label: 'Current password',     placeholder: 'Enter current password', auto: 'current-password' },
                { id: 'new-password',     label: 'New password',         placeholder: 'At least 8 characters',  auto: 'new-password'     },
                { id: 'confirm-password', label: 'Confirm new password', placeholder: 'Repeat new password',    auto: 'new-password'     },
              ].map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <label htmlFor={f.id} className="block text-sm font-medium text-slate-300">{f.label}</label>
                  <div className="relative">
                    <input
                      id={f.id}
                      type={showPwdFields[f.id] ? 'text' : 'password'}
                      placeholder={f.placeholder}
                      className={inputClass}
                      autoComplete={f.auto}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwdFields((p) => ({ ...p, [f.id]: !p[f.id] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showPwdFields[f.id] ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handleSave} className={`rounded-xl bg-gradient-to-r ${roleGradient} px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500`}>
                {saveLabel}
              </button>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            <header className="rounded-3xl border border-white/10 bg-supply-teal/50 px-5 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-supply-peach">Preferences</p>
              <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Settings</h1>
              <p className="mt-1 text-sm text-slate-300">Manage your notifications, privacy, and account.</p>
            </header>

            {/* Notifications */}
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="mb-4 text-sm font-semibold text-slate-200">Notifications</p>
              {notifPrefsLoading ? (
                <p className="py-4 text-center text-sm text-slate-400">Loading preferences…</p>
              ) : (
                <div className="space-y-3">
                  {role === 'buyer' && [
                    { key: 'orderUpdates', label: 'Order updates',    sub: 'Confirmed, picked up, delivered'   },
                    { key: 'lowStock',     label: 'Low stock alerts', sub: 'When your favourite items run low' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <div><p className="text-sm text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                      <Toggle value={notifPrefs[item.key] ?? true} onChange={() => toggleNotifPref(item.key)} label={item.label} />
                    </div>
                  ))}
                  {role === 'seller' && [
                    { key: 'payouts',   label: 'Payout alerts',    sub: 'When earnings are transferred to you' },
                    { key: 'lowStock',  label: 'Low stock alerts', sub: 'When your product stock runs low'     },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <div><p className="text-sm text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                      <Toggle value={notifPrefs[item.key] ?? true} onChange={() => toggleNotifPref(item.key)} label={item.label} />
                    </div>
                  ))}
                  {role === 'admin' && [
                    { key: 'vendorApprovals',  label: 'Vendor approval requests',  sub: 'When a new vendor applies to join'    },
                    { key: 'productApprovals', label: 'Product approval requests', sub: 'When a seller submits a new product' },
                    // NOTE: 'disputes' and 'systemAlerts' don't yet have a
                    // matching notifyAdmins... function in
                    // notification.service.ts — wire those up (checking
                    // isPrefEnabled(admin.id, 'disputes' / 'systemAlerts')
                    // before sending) or these toggles won't do anything yet.
                    { key: 'disputes',     label: 'Disputes & escalations', sub: 'When a buyer or seller raises an issue' },
                    { key: 'systemAlerts', label: 'System alerts',          sub: 'Server errors, downtime warnings'       },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <div><p className="text-sm text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                      <Toggle value={notifPrefs[item.key] ?? true} onChange={() => toggleNotifPref(item.key)} label={item.label} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms / info */}
            {(role === 'buyer' || role === 'seller') && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 space-y-4">
                <p className="mb-4 text-sm font-semibold text-slate-200">Terms & Privacy</p>
                <div className="space-y-3">
                  {[
                    { title: 'Privacy & terms', body: 'Your data is protected and used only to improve your FreshRoute experience.' },
                    { title: 'Data use',        body: 'We use your profile details to personalize products, delivery, and support — and never share them without your consent.' },
                    { title: 'Account rights',  body: 'You can edit your information, change your password, and request account deletion at any time from this profile section.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <p className="text-sm font-medium text-slate-100">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin-only: security + platform switches */}
            {role === 'admin' && (
              <>
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                  <p className="mb-4 text-sm font-semibold text-slate-200">Security</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Audit logging',             sub: 'Record all admin actions to audit log', value: auditLogging, onChange: () => setAuditLogging(!auditLogging) },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                        <div><p className="text-sm text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                        <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                  <p className="mb-4 text-sm font-semibold text-slate-200">Platform Switches</p>
                  <div className="space-y-3">
                    {[
                      { label: 'New registrations',    sub: 'Allow new buyers and vendors to sign up',        value: newRegistrations,   onChange: () => setNewRegistrations(!newRegistrations),     danger: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                        <div>
                          <p className={`text-sm ${item.danger && item.value ? 'text-red-400 font-medium' : 'text-slate-200'}`}>
                            {item.label}
                            {item.danger && item.value && (
                              <span className="ml-2 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] text-red-400">ACTIVE</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{item.sub}</p>
                        </div>
                        <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Help & Support */}
            {role !== 'admin' && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 space-y-3">
                <p className="text-sm font-semibold text-slate-200">Help & Support</p>
                <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                  <p className="text-sm font-medium text-slate-100">Need help?</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Our support team is available Mon–Fri, 9am–6pm.<br />
                    support@freshroute.lk
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openSupportEmail}
                  className="inline-block rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Contact support
                </button>
              </div>
            )}

            {/* Danger zone */}
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
              <p className="text-sm font-semibold text-red-400">Danger Zone</p>
              {role === 'admin' ? (
                <>
                  <p className="text-sm text-slate-400">Sign out of all active sessions across every device immediately.</p>
                  {!showSessionConfirm ? (
                    <button
                      onClick={() => setShowSessionConfirm(true)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >Sign out all sessions</button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-300">Are you sure? All devices will be signed out.</p>
                      <div className="flex gap-2">
                        <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors">Yes, sign out all</button>
                        <button onClick={() => setShowSessionConfirm(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-400">Once deleted, your account and all data will be permanently removed.</p>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >{role === 'seller' ? 'Delete My Store' : 'Delete My Account'}</button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-300">Are you sure? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button onClick={handleDeleteAccount} disabled={deleteLoading} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                          {deleteLoading ? 'Deleting...' : 'Yes, delete it'}
                        </button>
                        <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">Cancel</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProfilePage