import { useState, useEffect, useRef } from 'react'
import type { JSX } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { RootState } from '../store'
import { updateSellerProfile, updateBuyerProfile } from '../store/slices/userSlice'
import { useToast } from '../context/ToastContext'
import { useAuthContext } from '../context/AuthContext'

const API = 'http://localhost:5000/api/v1/profile'

// ─── Types ────────────────────────────────────────────────────────
type Role = 'buyer' | 'seller' | 'admin'
type BuyerTab  = 'profile' | 'orders' | 'address' | 'password' | 'settings'
type SellerTab = 'profile' | 'business' | 'password' | 'settings'
type AdminTab  = 'profile' | 'password' | 'settings'
type Tab = BuyerTab | SellerTab | AdminTab

// Shared Tailwind class for all text inputs
const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-base text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/40 transition-all'

// Reusable toggle switch component used across all settings panels
const Toggle = ({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange: () => void
  label: string
}) => (
  <button
    role="switch"
    aria-checked={value}
    aria-label={label}
    onClick={onChange}
    className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent ${
      value ? 'bg-emerald-500' : 'bg-white/20'
    }`}
  >
    <span
      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
        value ? 'left-4' : 'left-0.5'
      }`}
    />
  </button>
)

// ─── Sidebar tab configs per role ─────────────────────────────────
const buyerTabs = [
  {
    section: 'Account',
    items: [
      { tab: 'profile'  as Tab, label: 'Personal info',    icon: 'user'     },
      { tab: 'orders'   as Tab, label: 'Orders',           icon: 'orders'   },
      { tab: 'address'  as Tab, label: 'Delivery address', icon: 'location' },
    ],
  },
  {
    section: 'Security',
    items: [{ tab: 'password' as Tab, label: 'Password', icon: 'lock' }],
  },
  {
    section: 'Preferences',
    items: [{ tab: 'settings' as Tab, label: 'Settings', icon: 'settings' }],
  },
]

const sellerTabs = [
  {
    section: 'Account',
    items: [
      { tab: 'profile'  as Tab, label: 'Personal info', icon: 'user'     },
      { tab: 'business' as Tab, label: 'Business info', icon: 'business' },
    ],
  },
  {
    section: 'Security',
    items: [{ tab: 'password' as Tab, label: 'Password', icon: 'lock' }],
  },
  {
    section: 'Preferences',
    items: [{ tab: 'settings' as Tab, label: 'Settings', icon: 'settings' }],
  },
]

const adminTabs = [
  {
    section: 'Account',
    items: [{ tab: 'profile' as Tab, label: 'Personal info', icon: 'user' }],
  },
  {
    section: 'Security',
    items: [{ tab: 'password' as Tab, label: 'Password', icon: 'lock' }],
  },
  {
    section: 'Preferences',
    items: [{ tab: 'settings' as Tab, label: 'Settings', icon: 'settings' }],
  },
]

// Renders the correct SVG icon for each sidebar tab
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
  }
  return icons[type] ?? null
}

// ─── Mock data ────────────────────────────────────────────────────
const mockOrders = [
  { id: 'ORD-2024-042', date: 'Dec 1, 2024',  status: 'Delivered', total: 'Rs. 1,240', items: 4, sellerName: 'Green Market' },
  { id: 'ORD-2024-038', date: 'Nov 28, 2024', status: 'Delivered', total: 'Rs. 870',   items: 2, sellerName: 'Fresh Farms'  },
  { id: 'ORD-2024-031', date: 'Nov 20, 2024', status: 'Cancelled', total: 'Rs. 530',   items: 1, sellerName: 'City Veggies' },
]

const mockAuditLog = [
  { id: 1, action: 'Approved vendor',    target: 'Green Market (V-0421)',      time: '2 min ago',  type: 'approve' },
  { id: 2, action: 'Suspended user',     target: 'buyer@email.com (U-1093)',   time: '14 min ago', type: 'suspend' },
  { id: 3, action: 'Rejected product',   target: 'Spinach Bundle (P-0078)',    time: '1 hr ago',   type: 'reject'  },
  { id: 4, action: 'Updated platform fee', target: 'Commission → 8%',          time: '3 hrs ago',  type: 'config'  },
]

const mockProducts = [
  { name: 'Tomatoes',   price: 'Rs. 120/kg',   status: 'APPROVED'         },
  { name: 'Red Onions', price: 'Rs. 200/kg',   status: 'APPROVED'         },
  { name: 'Spinach',    price: 'Rs. 80/bunch', status: 'PENDING_APPROVAL' },
]

// ─── ProfilePage ──────────────────────────────────────────────────
const ProfilePage = (): JSX.Element => {
  const dispatch    = useDispatch()
  const navigate    = useNavigate()
  const { showToast }              = useToast()
  const { user, logout, updateUser } = useAuthContext()
  const buyerProfile  = useSelector((state: RootState) => state.user.buyerProfile)
  const sellerProfile = useSelector((state: RootState) => state.user.sellerProfile)
  const [searchParams] = useSearchParams()

  const role = (user?.role?.toLowerCase() ?? 'buyer') as Role

  // Valid tabs for each role — prevents invalid tab params from the URL
  const validTabs: Tab[] =
    role === 'admin'
      ? ['profile', 'password', 'settings']
      : role === 'seller'
      ? ['profile', 'business', 'password', 'settings']
      : ['profile', 'orders', 'address', 'password', 'settings']

  const tabParam  = searchParams.get('tab') as Tab | null
  const activeTab: Tab = tabParam && validTabs.includes(tabParam) ? tabParam : 'profile'
  const tabSections = role === 'admin' ? adminTabs : role === 'seller' ? sellerTabs : buyerTabs

  // ── UI state ──
  const [saved, setSaved]         = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    localStorage.getItem(`${role}AvatarUrl`)
  )

  // ── Form fields — seeded from Redux store ──
  const [name, setName]     = useState(
    role === 'seller' ? (sellerProfile?.ownerName ?? '') : (buyerProfile?.name ?? '')
  )
  const [phone, setPhone]   = useState(
    role === 'seller' ? (sellerProfile?.phone ?? '') : (buyerProfile?.phone ?? '')
  )
  const [city, setCity]     = useState(
    role === 'seller' ? (sellerProfile?.city ?? 'Colombo') : (buyerProfile?.city ?? 'Colombo')
  )
  const [address, setAddress]                 = useState(buyerProfile?.address         ?? '')
  const [businessName, setBusinessName]       = useState(sellerProfile?.businessName   ?? '')
  const [businessAddress, setBusinessAddress] = useState(sellerProfile?.businessAddress ?? '')

  // ── Admin-specific fields ──
  const [adminName, setAdminName]   = useState(user?.name ?? 'Super Admin')
  const [adminPhone, setAdminPhone] = useState('+94 77 000 0001')

  // ── Seller approval status fetched from API ──
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [userStatus, setUserStatus] = useState<string>('ACTIVE')

  // ── Notification toggles ──
  const [notifOrders,          setNotifOrders]          = useState(true)
  const [notifPromos,          setNotifPromos]          = useState(false)
  const [notifStock,           setNotifStock]           = useState(true)
  const [notifPayouts,         setNotifPayouts]         = useState(true)
  const [notifVendorApprovals, setNotifVendorApprovals] = useState(true)
  const [notifDisputes,        setNotifDisputes]        = useState(true)
  const [notifSystem,          setNotifSystem]          = useState(false)

  // ── Privacy / platform toggles ──
  const [storeVisible,       setStoreVisible]       = useState(true)
  const [profileVisible,     setProfileVisible]     = useState(true)
  const [dataSharing,        setDataSharing]        = useState(false)
  const [twoFactor,          setTwoFactor]          = useState(true)
  const [auditLogging,       setAuditLogging]       = useState(true)
  const [maintenanceMode,    setMaintenanceMode]    = useState(false)
  const [newRegistrations,   setNewRegistrations]   = useState(true)
  const [autoApproveVendors, setAutoApproveVendors] = useState(false)

  // ── Danger zone confirmation states ──
  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false)
  const [showSessionConfirm, setShowSessionConfirm] = useState(false)
  const [deleteLoading,      setDeleteLoading]      = useState(false)

  // Fetches seller approval status once on mount — silent, never toasts on error
  const hasFetchedStatus = useRef(false)
  useEffect(() => {
    if (role !== 'seller' || hasFetchedStatus.current) return
    hasFetchedStatus.current = true

    const token = localStorage.getItem('fr_token')
    if (!token) return

    fetch(`${API}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setIsApproved(data.isApproved)
          setUserStatus(data.status)
        }
      })
      .catch(() => {
        // Silent — background fetch, no toast
      })
  }, [role])

  // Converts uploaded image to base64 and persists it in localStorage
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setAvatarUrl(base64)
      localStorage.setItem(`${role}AvatarUrl`, base64)
    }
    reader.readAsDataURL(file)
  }

  // Handles all save actions — routes to the correct API endpoint based on activeTab + role
  const handleSave = async () => {
    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')

    if (!token) {
      showToast('You are not authenticated. Please sign in again.', 'error')
      return
    }

    setSaved(true)

    try {
      if (activeTab === 'profile') {
        if (role === 'buyer') {
          const res  = await fetch(`${API}/personal`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body:    JSON.stringify({ name, phone, city }),
          })
          const data = await res.json()
          if (!res.ok) { showToast(data.message ?? 'Failed to update', 'error'); setSaved(false); return }
          dispatch(updateBuyerProfile({ name, phone, city }))
          updateUser({ name: data.user?.name ?? name })
          showToast('Personal info updated successfully')

        } else if (role === 'seller') {
          const res  = await fetch(`${API}/personal`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body:    JSON.stringify({ name, phone, city }),
          })
          const data = await res.json()
          if (!res.ok) { showToast(data.message ?? 'Failed to update', 'error'); setSaved(false); return }
          dispatch(updateSellerProfile({ ownerName: name, phone, city }))
          updateUser({ name: data.user?.name ?? name })
          showToast('Personal info updated successfully')

        } else if (role === 'admin') {
          // TODO: wire to PATCH /api/v1/admin/profile/personal
          showToast('Profile updated successfully')
        }

      } else if (activeTab === 'business' && role === 'seller') {
        const res  = await fetch(`${API}/business`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ businessName, businessAddress, city }),
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update business info', 'error'); setSaved(false); return }
        dispatch(updateSellerProfile({ businessName, businessAddress }))
        showToast('Business info updated successfully')

      } else if (activeTab === 'address' && role === 'buyer') {
        const res  = await fetch(`${API}/address`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ address, city }),
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update address', 'error'); setSaved(false); return }
        dispatch(updateBuyerProfile({ address, city }))
        showToast('Delivery address updated successfully')

      } else if (activeTab === 'password') {
        // Read password values directly from DOM inputs
        const currentPwd = (document.getElementById('current-password') as HTMLInputElement)?.value?.trim()
        const newPwd     = (document.getElementById('new-password')     as HTMLInputElement)?.value?.trim()
        const confirmPwd = (document.getElementById('confirm-password') as HTMLInputElement)?.value?.trim()

        if (!currentPwd || !newPwd || !confirmPwd) {
          showToast('Please fill in all password fields', 'error'); setSaved(false); return
        }
        if (newPwd !== confirmPwd) {
          showToast('New passwords do not match', 'error'); setSaved(false); return
        }
        if (newPwd.length < 8) {
          showToast('Password must be at least 8 characters', 'error'); setSaved(false); return
        }

        const res  = await fetch(`${API}/password`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.message ?? 'Failed to update password', 'error'); setSaved(false); return }
        showToast('Password changed successfully')
      }

    } catch {
      showToast('Network error — please check your connection', 'error')
    }

    setTimeout(() => setSaved(false), 2500)
  }

  // Deletes the account via API, clears local storage, and redirects to sign in
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
      const res   = await fetch(`${API}/`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        showToast(data.message ?? 'Failed to delete account', 'error')
        setDeleteLoading(false)
        return
      }
      localStorage.clear()
      showToast('Account deleted successfully')
      navigate('/signin')
    } catch {
      showToast('Something went wrong', 'error')
      setDeleteLoading(false)
    }
  }

  // Navigates to a tab by updating the URL search param
  const goToTab = (tab: Tab) => navigate(`?tab=${tab}`)

  // ── Derived display values ──
  const displayName =
    role === 'seller'
      ? (sellerProfile?.businessName || sellerProfile?.ownerName || 'Vendor')
      : role === 'admin'
      ? adminName
      : (buyerProfile?.name ?? user?.name ?? 'User')

  const displayEmail =
    role === 'seller'
      ? (sellerProfile?.email ?? user?.email ?? '')
      : role === 'admin'
      ? (user?.email ?? 'admin@freshroute.lk')
      : (buyerProfile?.email ?? user?.email ?? '')

  // Role label + gradient + accent color — changes per role
  const roleLabel    = role === 'admin' ? 'Admin'  : role === 'seller' ? 'Seller' : 'Buyer'
  const roleGradient = role === 'admin' ? 'from-emerald-500 to-teal-600' : 'from-emerald-500 to-supply-teal'
  const accentColor  = 'text-emerald-400'

  // Status badge colors for orders and products
  const statusStyles: Record<string, string> = {
    Delivered:        'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Cancelled:        'text-red-400    bg-red-400/10    border-red-400/20',
    Pending:          'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    APPROVED:         'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    PENDING_APPROVAL: 'text-yellow-400  bg-yellow-400/10  border-yellow-400/20',
  }

  // Badge colors for the admin audit log entries
  const auditStyles: Record<string, string> = {
    approve: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    suspend: 'text-yellow-400  bg-yellow-400/10  border-yellow-400/20',
    reject:  'text-red-400    bg-red-400/10    border-red-400/20',
    config:  'text-sky-400    bg-sky-400/10    border-sky-400/20',
  }

  // Sidebar stat cards — different values per role
  const stats =
    role === 'admin'
      ? [
          { label: 'Total users',    value: '1,284' },
          { label: 'Active vendors', value: '94'    },
          { label: 'Orders today',   value: '217'   },
          { label: 'Admin since',    value: '2023'  },
        ]
      : role === 'seller'
      ? [
          { label: 'Products',     value: '3'    },
          { label: 'Orders',       value: '18'   },
          { label: 'Member since', value: '2024' },
        ]
      : [
          { label: 'Orders',       value: '3'    },
          { label: 'Delivered',    value: '2'    },
          { label: 'Member since', value: '2024' },
        ]

  // Save button label changes based on active tab and saved state
  const saveLabel =
    activeTab === 'password' ? (saved ? '✓ Password updated' : 'Update Password')
    : activeTab === 'address' ? (saved ? '✓ Address saved'   : 'Save Address')
    : (saved ? '✓ Changes saved' : 'Save Changes')

  return (
    <main className="flex min-h-screen gap-0" aria-label="Profile page">

      {/* ── SIDEBAR ── */}
      <aside className="flex w-64 flex-shrink-0 flex-col gap-4 border-r border-white/10 px-3 py-6">

        {/* Avatar, display name, email, role badges */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center">
          <div className="relative">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${roleGradient} text-2xl font-bold text-white ring-2 ring-white/10 overflow-hidden`}
              role="img"
              aria-label={`Profile picture for ${displayName}`}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                : displayName.charAt(0).toUpperCase()
              }
            </div>
            {/* Avatar upload button — hidden for admin */}
            {role !== 'admin' && (
              <label
                className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-900 text-[9px] text-slate-300 hover:bg-slate-700 transition-colors"
                title="Change profile picture"
                aria-label="Change profile picture"
              >
                ✎
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
            {/* Online indicator dot — admin only */}
            {role === 'admin' && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-50">{displayName}</p>
            <p className="text-[11px] text-slate-400">{displayEmail}</p>
          </div>

          {/* Role + approval status badges */}
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              {roleLabel}
            </span>
            {role === 'admin' && (
              <span className="rounded-full bg-sky-500/10 px-3 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-500/20">
                Super
              </span>
            )}
            {role === 'seller' && isApproved === true && (
              <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                ✓ Approved
              </span>
            )}
            {role === 'seller' && isApproved === false && userStatus !== 'SUSPENDED' && (
              <span className="rounded-full bg-yellow-500/10 px-3 py-0.5 text-[10px] font-semibold text-yellow-400 border border-yellow-500/20">
                ⏳ Pending
              </span>
            )}
            {role === 'seller' && userStatus === 'SUSPENDED' && (
              <span className="rounded-full bg-red-500/10 px-3 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                🚫 Suspended
              </span>
            )}
          </div>
        </div>

        {/* Sidebar nav — tabs grouped by section */}
        <nav className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-3" aria-label="Profile sections">
          {tabSections.map((section, si) => (
            <div key={section.section}>
              {si > 0 && <div className="my-2 border-t border-white/10" />}
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {section.section}
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
                  <TabIcon type={item.icon} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          <div className="my-2 border-t border-white/10" />
          {/* Sign out button */}
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Sign out"
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
              <path d="M10 2h3a1 1 0 011 1v10a1 1 0 01-1 1h-3M7 11l3-3-3-3M10 8H3" />
            </svg>
            Sign out
          </button>
        </nav>

        {/* Sidebar stats */}
        <div className="flex flex-col gap-2">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <span className="text-xs text-slate-400">{s.label}</span>
              <span className="text-sm font-semibold text-slate-50">{s.value}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* ── PERSONAL INFO (all roles) ── */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Account Details</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Personal Information</h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    {role === 'seller' ? 'Owner name' : 'Full name'}
                  </label>
                  <input
                    value={role === 'admin' ? adminName : name}
                    onChange={(e) => role === 'admin' ? setAdminName(e.target.value) : setName(e.target.value)}
                    className={inputClass}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Email</label>
                  {/* Email is read-only — cannot be changed from the profile page */}
                  <input value={displayEmail} disabled className={`${inputClass} cursor-not-allowed opacity-50`} autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Phone number</label>
                  <input
                    value={role === 'admin' ? adminPhone : phone}
                    onChange={(e) => role === 'admin' ? setAdminPhone(e.target.value) : setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+94 77 123 4567"
                    type="tel"
                    autoComplete="tel"
                  />
                </div>
                {role !== 'admin' ? (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">City</label>
                    <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }}>
                      {['Colombo', 'Kandy', 'Galle', 'Jaffna'].map((c) => (
                        <option key={c} style={{ backgroundColor: '#0f2d2d', color: '#f8fafc' }}>{c}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  // Admin sees a read-only Role field instead of City
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Role</label>
                    <input value="Super Administrator" disabled className={`${inputClass} cursor-not-allowed opacity-50`} />
                  </div>
                )}
              </div>

              {/* Admin permissions list */}
              {role === 'admin' && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {['Manage Users', 'Approve Vendors', 'View Reports', 'Edit Platform Config', 'Manage Orders', 'Audit Logs'].map((p) => (
                      <span key={p} className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[11px] font-medium text-slate-400">
                        {p}
                      </span>
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

            {/* Admin-only extras: platform health cards + recent audit log */}
            {role === 'admin' && (
              <>
                <div>
                  <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Platform Health</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Uptime',             value: '99.8%',    good: true  },
                      { label: 'Pending approvals',  value: '7',        good: false },
                      { label: 'Open disputes',      value: '2',        good: false },
                      { label: 'Revenue (MTD)',       value: 'Rs. 1.2M', good: true  },
                    ].map((c) => (
                      <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                        <p className={`text-lg font-bold ${c.good ? 'text-emerald-400' : 'text-yellow-400'}`}>{c.value}</p>
                        <p className="text-sm font-medium text-slate-200">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Recent Activity</p>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <ul className="space-y-2">
                      {mockAuditLog.map((entry) => (
                        <li key={entry.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors">
                          <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${auditStyles[entry.type]}`}>
                            {entry.type === 'approve' ? '✓' : entry.type === 'reject' ? '✕' : entry.type === 'suspend' ? '!' : '⚙'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-100">{entry.action}</p>
                            <p className="text-xs text-slate-400 truncate">{entry.target}</p>
                          </div>
                          <span className="text-xs text-slate-500">{entry.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BUSINESS INFO (seller only) ── */}
        {activeTab === 'business' && role === 'seller' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Store Details</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Business Information</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300">Business name</label>
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} placeholder="Green Market" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300">Business address</label>
                  <input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className={inputClass} placeholder="No. 45, Market Street, Colombo" autoComplete="street-address" />
                </div>
              </div>

              {/* Seller's listed products with approval status */}
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
                        {p.status === 'PENDING_APPROVAL' ? 'Pending' : 'Approved'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Earnings summary cards */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-200">Earnings Summary</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'This month',     value: 'Rs. 32,500' },
                    { label: 'Last month',     value: 'Rs. 28,100' },
                    { label: 'Total orders',   value: '18'         },
                    { label: 'Pending payout', value: 'Rs. 8,400'  },
                  ].map((e) => (
                    <div key={e.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <p className="text-base font-semibold text-slate-50">{e.value}</p>
                      <p className="text-xs text-slate-400">{e.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className={`rounded-xl bg-gradient-to-r ${roleGradient} px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                {saved ? '✓ Changes saved' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── ORDERS (buyer only) ── */}
        {activeTab === 'orders' && role === 'buyer' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>History</p>
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
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── DELIVERY ADDRESS (buyer only) ── */}
        {activeTab === 'address' && role === 'buyer' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Delivery</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Delivery Address</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Full address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="No. 12, Flower Road" autoComplete="street-address" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">City</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }}>
                  {['Colombo', 'Kandy', 'Galle', 'Jaffna'].map((c) => (
                    <option key={c} style={{ backgroundColor: '#0f2d2d', color: '#f8fafc' }}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSave}
                className={`rounded-xl bg-gradient-to-r ${roleGradient} px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                {saveLabel}
              </button>
            </div>
          </div>
        )}

        {/* ── PASSWORD (all roles) ── */}
        {activeTab === 'password' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Security</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Change Password</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
              {[
                { id: 'current-password', label: 'Current password',     placeholder: 'Enter current password', auto: 'current-password' },
                { id: 'new-password',     label: 'New password',         placeholder: 'At least 8 characters',  auto: 'new-password'     },
                { id: 'confirm-password', label: 'Confirm new password', placeholder: 'Repeat new password',    auto: 'new-password'     },
              ].map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <label htmlFor={f.id} className="block text-sm font-medium text-slate-300">{f.label}</label>
                  <input id={f.id} type="password" placeholder={f.placeholder} className={inputClass} autoComplete={f.auto} />
                </div>
              ))}

              {/* Admin 2FA notice */}
              {role === 'admin' && (
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" /><path d="M8 5v3" /><circle cx="8" cy="11" r=".6" fill="currentColor" />
                  </svg>
                  <p className="text-xs text-emerald-300">
                    Two-factor authentication is <strong>enabled</strong>. You'll be prompted to verify after saving.
                  </p>
                </div>
              )}

              <button
                onClick={handleSave}
                className={`rounded-xl bg-gradient-to-r ${roleGradient} px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                {saveLabel}
              </button>
            </div>
          </div>
        )}

        {/* ── SETTINGS (all roles) ── */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Preferences</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Settings</h2>
            </div>

            {/* Notification toggles — different options per role */}
            <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-base font-semibold text-slate-200">Notifications</p>
              {role === 'buyer' && [
                { label: 'Order updates',       sub: 'Confirmed, picked up, delivered',     value: notifOrders, onChange: () => setNotifOrders(!notifOrders)   },
                { label: 'Promotions & offers', sub: 'Deals and discounts from vendors',    value: notifPromos, onChange: () => setNotifPromos(!notifPromos)   },
                { label: 'Low stock alerts',    sub: 'When your favourite items run low',   value: notifStock,  onChange: () => setNotifStock(!notifStock)     },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div><p className="text-sm text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                  <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                </div>
              ))}
              {role === 'seller' && [
                { label: 'New orders',       sub: 'When a customer places an order',      value: notifOrders,  onChange: () => setNotifOrders(!notifOrders)   },
                { label: 'Payout alerts',    sub: 'When earnings are transferred to you', value: notifPayouts, onChange: () => setNotifPayouts(!notifPayouts) },
                { label: 'Low stock alerts', sub: 'When your product stock runs low',     value: notifStock,   onChange: () => setNotifStock(!notifStock)     },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div><p className="text-sm text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                  <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                </div>
              ))}
              {role === 'admin' && [
                { label: 'Vendor approval requests', sub: 'When a new vendor applies to join',      value: notifVendorApprovals, onChange: () => setNotifVendorApprovals(!notifVendorApprovals) },
                { label: 'New orders',               sub: 'Platform-wide order activity',           value: notifOrders,          onChange: () => setNotifOrders(!notifOrders)                   },
                { label: 'Disputes & escalations',   sub: 'When a buyer or seller raises an issue', value: notifDisputes,        onChange: () => setNotifDisputes(!notifDisputes)               },
                { label: 'System alerts',            sub: 'Server errors, downtime warnings',       value: notifSystem,          onChange: () => setNotifSystem(!notifSystem)                   },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div><p className="text-sm text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                  <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                </div>
              ))}
            </fieldset>

            {/* Privacy toggles — buyer and seller only */}
            {(role === 'buyer' || role === 'seller') && (
              <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-base font-semibold text-slate-200">Privacy</p>
                {[
                  role === 'buyer'
                    ? { label: 'Profile visibility',            sub: 'Allow vendors to see your profile',  value: profileVisible, onChange: () => setProfileVisible(!profileVisible) }
                    : { label: 'Store visibility',              sub: 'Allow customers to find your store', value: storeVisible,   onChange: () => setStoreVisible(!storeVisible)     },
                  { label: 'Share data for recommendations',    sub: 'Help us improve your experience',    value: dataSharing,    onChange: () => setDataSharing(!dataSharing)       },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <div><p className="text-sm text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                    <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                  </div>
                ))}
              </fieldset>
            )}

            {/* Security + platform switches — admin only */}
            {role === 'admin' && (
              <>
                <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-base font-semibold text-slate-200">Security</p>
                  {[
                    { label: 'Two-factor authentication', sub: 'Required on every admin sign-in',       value: twoFactor,    onChange: () => setTwoFactor(!twoFactor)       },
                    { label: 'Audit logging',             sub: 'Record all admin actions to audit log', value: auditLogging, onChange: () => setAuditLogging(!auditLogging) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4">
                      <div><p className="text-sm text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                      <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                    </div>
                  ))}
                </fieldset>

                <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-base font-semibold text-slate-200">Platform Switches</p>
                  {[
                    { label: 'Maintenance mode',     sub: 'Take the platform offline for all users',        value: maintenanceMode,    onChange: () => setMaintenanceMode(!maintenanceMode),       danger: true  },
                    { label: 'New registrations',    sub: 'Allow new buyers and vendors to sign up',        value: newRegistrations,   onChange: () => setNewRegistrations(!newRegistrations),     danger: false },
                    { label: 'Auto-approve vendors', sub: 'Skip manual review for new vendor applications', value: autoApproveVendors, onChange: () => setAutoApproveVendors(!autoApproveVendors), danger: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-sm ${item.danger && item.value ? 'text-red-400 font-medium' : 'text-slate-200'}`}>
                          {item.label}
                          {/* Active warning badge — only shown when a dangerous switch is ON */}
                          {item.danger && item.value && (
                            <span className="ml-2 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] text-red-400">
                              ACTIVE
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">{item.sub}</p>
                      </div>
                      <Toggle value={item.value} onChange={item.onChange} label={item.label} />
                    </div>
                  ))}
                </fieldset>
              </>
            )}

            {/* Danger zone — delete account (buyer/seller) or sign out all sessions (admin) */}
            <div className="space-y-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-semibold text-red-400">Danger Zone</p>
              {role === 'admin' ? (
                <>
                  <p className="text-sm text-slate-400">Sign out of all active sessions across every device immediately.</p>
                  {!showSessionConfirm ? (
                    <button
                      onClick={() => setShowSessionConfirm(true)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Sign out all sessions
                    </button>
                  ) : (
                    // Two-step confirmation to prevent accidental sign-out
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-300">Are you sure? All devices will be signed out.</p>
                      <div className="flex gap-2">
                        <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors">
                          Yes, sign out all
                        </button>
                        <button onClick={() => setShowSessionConfirm(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
                          Cancel
                        </button>
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
                    >
                      {role === 'seller' ? 'Delete My Store' : 'Delete My Account'}
                    </button>
                  ) : (
                    // Two-step confirmation to prevent accidental deletion
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-300">Are you sure? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading}
                          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deleteLoading ? 'Deleting...' : 'Yes, delete it'}
                        </button>
                        <button onClick={() => setShowDeleteConfirm(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

export default ProfilePage