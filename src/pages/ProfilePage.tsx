/**
 * ProfilePage.tsx
 * The full profile settings page. Shows different tabs and info based on if you are a buyer, seller, or admin.
 */

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

/** Possible user roles in the app. */
type Role = 'buyer' | 'seller' | 'admin'

/** Tab names that a buyer can visit. */
type BuyerTab  = 'profile' | 'orders' | 'address' | 'password' | 'settings'

/** Tab names that a seller can visit. */
type SellerTab = 'profile' | 'business' | 'password' | 'settings'

/** Tab names that an admin can visit. */
type AdminTab  = 'profile' | 'password' | 'settings'

/** A Tab is any valid tab from any role. */
type Tab = BuyerTab | SellerTab | AdminTab

/** Shape of one order row returned by the API. */
type Order = {
  id: string
  date: string
  status: string
  total: string
  items: number
  sellerName: string
}

/** Shape of one audit log row returned by the API. */
type AuditEntry = {
  id: number
  action: string
  target: string
  time: string
  type: 'approve' | 'suspend' | 'reject' | 'config'
}

/** Shape of one product row returned by the API. */
type Product = {
  name: string
  price: string
  status: 'APPROVED' | 'PENDING_APPROVAL'
}

/**
 * Shape of the platform health cards returned by the API for admins.
 * good=true means it shows green, good=false means yellow.
 */
type HealthCard = {
  label: string
  value: string
  good: boolean
}

/** Shape of the sidebar stats returned by the API — different fields per role. */
type StatsData = {
  // Buyer stats
  totalOrders?:   number
  delivered?:     number
  memberSince?:   string
  // Seller stats
  totalProducts?: number
  // Admin stats
  totalUsers?:    number
  activeVendors?: number
  ordersToday?:   number
  adminSince?:    string
}

/** Shared CSS class string for all text input boxes in the page. */
const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-base text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/40 transition-all'

// ─── Toggle Component ─────────────────────────────────────────────

/**
 * A simple ON/OFF switch button.
 * When you click it, it flips between green (ON) and grey (OFF).
 */
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
    {/* The white dot that slides left or right */}
    <span
      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
        value ? 'left-4' : 'left-0.5'
      }`}
    />
  </button>
)

// ─── Sidebar tab configs per role ─────────────────────────────────

/**
 * List of sidebar sections and tabs shown to a BUYER.
 * Groups tabs under Account, Security, and Preferences headings.
 */
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

/**
 * List of sidebar sections and tabs shown to a SELLER.
 * Includes a Business Info tab instead of Orders and Address.
 */
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

/**
 * List of sidebar sections and tabs shown to an ADMIN.
 * Fewer tabs — no orders, address, or business info.
 */
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

// ─── TabIcon Component ────────────────────────────────────────────

/**
 * Shows a tiny SVG icon for each sidebar tab.
 * Picks the right icon shape based on the 'type' name passed in.
 */
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

// ─── ProfilePage ──────────────────────────────────────────────────

/**
 * The main ProfilePage component.
 * It shows a sidebar with tabs and a content area that changes based on which tab is open.
 */
const ProfilePage = (): JSX.Element => {

  // dispatch lets us save things into the global Redux store (shared memory for the app).
  const dispatch    = useDispatch()

  // navigate lets us change the URL to go to different pages or tabs.
  const navigate    = useNavigate()

  // showToast pops up a small notification message at the top of the screen.
  const { showToast }              = useToast()

  // user = the logged-in person. logout = signs them out. updateUser = updates their name etc.
  const { user, logout, updateUser } = useAuthContext()

  // Gets buyer and seller profile data that was already saved in the global store.
  const buyerProfile  = useSelector((state: RootState) => state.user.buyerProfile)
  const sellerProfile = useSelector((state: RootState) => state.user.sellerProfile)

  // searchParams reads the URL — e.g. ?tab=orders — so we know which tab to show.
  const [searchParams] = useSearchParams()

  // Figures out the role from the logged-in user. Defaults to 'buyer' if unknown.
  const role = (user?.role?.toLowerCase() ?? 'buyer') as Role

  /**
   * Only allows tabs that exist for the current role.
   * Stops someone from typing ?tab=orders in the URL as a seller.
   */
  const validTabs: Tab[] =
    role === 'admin'
      ? ['profile', 'password', 'settings']
      : role === 'seller'
      ? ['profile', 'business', 'password', 'settings']
      : ['profile', 'orders', 'address', 'password', 'settings']

  // Reads the 'tab' value from the URL. If it's not valid, defaults to 'profile'.
  const tabParam  = searchParams.get('tab') as Tab | null
  const activeTab: Tab = tabParam && validTabs.includes(tabParam) ? tabParam : 'profile'

  // Picks the right sidebar tab list based on the role.
  const tabSections = role === 'admin' ? adminTabs : role === 'seller' ? sellerTabs : buyerTabs

  // ── UI state ──

  // 'saved' turns true briefly after saving, to show a "✓ saved" message on the button.
  const [saved, setSaved]         = useState(false)

  // Stores the profile picture. Tries to load one saved earlier from localStorage.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    localStorage.getItem(`${role}AvatarUrl`)
  )

  // ── Form field states — pre-filled from the Redux store ──

  // The user's display name — seller uses ownerName, buyer uses name.
  const [name, setName]     = useState(
    role === 'seller' ? (sellerProfile?.ownerName ?? '') : (buyerProfile?.name ?? '')
  )

  // Phone number for buyer or seller.
  const [phone, setPhone]   = useState(
    role === 'seller' ? (sellerProfile?.phone ?? '') : (buyerProfile?.phone ?? '')
  )

  // City — defaults to 'Colombo' if nothing is saved yet.
  const [city, setCity]     = useState(
    role === 'seller' ? (sellerProfile?.city ?? 'Colombo') : (buyerProfile?.city ?? 'Colombo')
  )

  // Buyer-only: delivery street address.
  const [address, setAddress]                 = useState(buyerProfile?.address          ?? '')

  // Seller-only: their shop/business name.
  const [businessName, setBusinessName]       = useState(sellerProfile?.businessName    ?? '')

  // Seller-only: their business street address.
  const [businessAddress, setBusinessAddress] = useState(sellerProfile?.businessAddress ?? '')

  // ── Admin-specific field states ──

  // Admin's full name (loaded from the logged-in user, defaults to 'Super Admin').
  const [adminName, setAdminName]   = useState(user?.name ?? 'Super Admin')

  // Admin's phone number (hardcoded placeholder — wire to API when ready).
  const [adminPhone, setAdminPhone] = useState('+94 77 000 0001')

  // ── Seller approval status ──

  // null = not fetched yet, true = approved, false = not approved.
  const [isApproved, setIsApproved] = useState<boolean | null>(null)

  // The seller's account status — can be 'ACTIVE', 'SUSPENDED', etc.
  const [userStatus, setUserStatus] = useState<string>('ACTIVE')

  // ── Notification toggle states ──

  // Each toggle below is a true/false for whether that notification type is turned on.
  const [notifOrders,          setNotifOrders]          = useState(true)
  const [notifPromos,          setNotifPromos]          = useState(false)
  const [notifStock,           setNotifStock]           = useState(true)
  const [notifPayouts,         setNotifPayouts]         = useState(true)
  const [notifVendorApprovals, setNotifVendorApprovals] = useState(true)
  const [notifDisputes,        setNotifDisputes]        = useState(true)
  const [notifSystem,          setNotifSystem]          = useState(false)

  // ── Privacy / platform toggle states ──

  // Whether the seller's store shows up to customers.
  const [storeVisible,       setStoreVisible]       = useState(true)

  // Whether the buyer's profile is visible to vendors.
  const [profileVisible,     setProfileVisible]     = useState(true)

  // Whether user data is shared to improve recommendations.
  const [dataSharing,        setDataSharing]        = useState(false)

  // Admin: two-factor login requirement.
  const [twoFactor,          setTwoFactor]          = useState(true)

  // Admin: whether all admin actions are recorded in a log.
  const [auditLogging,       setAuditLogging]       = useState(true)

  // Admin: puts the whole site offline for maintenance.
  const [maintenanceMode,    setMaintenanceMode]    = useState(false)

  // Admin: whether new buyers and sellers can sign up.
  const [newRegistrations,   setNewRegistrations]   = useState(true)

  // Admin: skips manual review for new vendor applications if true.
  const [autoApproveVendors, setAutoApproveVendors] = useState(false)

  // ── Danger zone confirmation states ──

  // Shows the "are you sure?" message before deleting the account.
  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false)

  // Shows the "are you sure?" message before signing out all sessions (admin only).
  const [showSessionConfirm, setShowSessionConfirm] = useState(false)

  // True while the delete account API call is in progress.
  const [deleteLoading,      setDeleteLoading]      = useState(false)

  // ── Real data state ──

  /** Buyer's real orders from the API. Empty until loaded. */
  const [orders,         setOrders]         = useState<Order[]>([])

  /** True while the orders API call is running — shows a loading message in the UI. */
  const [ordersLoading,  setOrdersLoading]  = useState(false)

  /** Seller's real products from the API. Empty until loaded. */
  const [products,         setProducts]         = useState<Product[]>([])

  /** True while the products API call is running — shows a loading message in the UI. */
  const [productsLoading,  setProductsLoading]  = useState(false)

  /** Admin's real audit log from the API. Empty until loaded. */
  const [auditLog,         setAuditLog]         = useState<AuditEntry[]>([])

  /** True while the audit log API call is running — shows a loading message in the UI. */
  const [auditLoading,     setAuditLoading]     = useState(false)

  /** Admin's platform health cards from the API. Empty until loaded. */
  const [healthCards,      setHealthCards]      = useState<HealthCard[]>([])

  /** True while the health cards API call is running — shows a loading message in the UI. */
  const [healthLoading,    setHealthLoading]    = useState(false)

  /** Sidebar stats from the API — different fields depending on role. Null until loaded. */
  const [statsData,        setStatsData]        = useState<StatsData | null>(null)

  // ── Seller status fetch ──

  /**
   * Runs once when the page loads (if the user is a seller).
   * Calls the API to check if the seller is approved or suspended.
   * Uses a ref so it only runs once — not every re-render. Silent on error.
   */
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
      .catch(() => { /* Silent — background fetch, no toast on error */ })
  }, [role])

  // ── Buyer orders fetch ──

  /**
   * Runs once on mount for BUYERS only.
   * Fetches real order history from the API.
   * API must return: { orders: [ { id, date, status, total, items, sellerName } ] }
   */
  const hasFetchedOrders = useRef(false)
  useEffect(() => {
    if (role !== 'buyer' || hasFetchedOrders.current) return
    hasFetchedOrders.current = true

    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) return

    setOrdersLoading(true)
    fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.orders) setOrders(data.orders) })
      .catch(() => { /* Silent — leaves the list empty on error */ })
      .finally(() => setOrdersLoading(false))
  }, [role])

  // ── Seller products fetch ──

  /**
   * Runs once on mount for SELLERS only.
   * Fetches the seller's real product list from the API.
   * API must return: { products: [ { name, price, status } ] }
   */
  const hasFetchedProducts = useRef(false)
  useEffect(() => {
    if (role !== 'seller' || hasFetchedProducts.current) return
    hasFetchedProducts.current = true

    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) return

    setProductsLoading(true)
    fetch(`${API}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.products) setProducts(data.products) })
      .catch(() => { /* Silent — leaves the list empty on error */ })
      .finally(() => setProductsLoading(false))
  }, [role])

  // ── Admin audit log fetch ──

  /**
   * Runs once on mount for ADMINS only.
   * Fetches the recent admin activity log from the API.
   * API must return: { auditLog: [ { id, action, target, time, type } ] }
   */
  const hasFetchedAuditLog = useRef(false)
  useEffect(() => {
    if (role !== 'admin' || hasFetchedAuditLog.current) return
    hasFetchedAuditLog.current = true

    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) return

    setAuditLoading(true)
    fetch(`${API}/audit-log`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.auditLog) setAuditLog(data.auditLog) })
      .catch(() => { /* Silent — leaves the list empty on error */ })
      .finally(() => setAuditLoading(false))
  }, [role])

  // ── Admin platform health fetch ──

  /**
   * Runs once on mount for ADMINS only.
   * Fetches the platform health summary cards from the API.
   * API must return: { healthCards: [ { label, value, good } ] }
   */
  const hasFetchedHealth = useRef(false)
  useEffect(() => {
    if (role !== 'admin' || hasFetchedHealth.current) return
    hasFetchedHealth.current = true

    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) return

    setHealthLoading(true)
    fetch(`${API}/health`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.healthCards) setHealthCards(data.healthCards) })
      .catch(() => { /* Silent — leaves the cards empty on error */ })
      .finally(() => setHealthLoading(false))
  }, [role])

  // ── Sidebar stats fetch ──

  /**
   * Runs once on mount for ALL roles.
   * Fetches the sidebar stat numbers from the API. The server returns different
   * fields depending on the role attached to the token.
   * API must return: { stats: { ... } } — see StatsData type for fields per role.
   */
  const hasFetchedStats = useRef(false)
  useEffect(() => {
    if (hasFetchedStats.current) return
    hasFetchedStats.current = true

    const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
    if (!token) return

    fetch(`${API}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.stats) setStatsData(data.stats) })
      .catch(() => { /* Silent — shows "—" for every stat on error */ })
  }, [])

  // ── Avatar upload handler ──

  /**
   * Runs when the user picks a new profile picture file.
   * Reads the image, converts it to base64, saves to state and localStorage.
   * This way the avatar stays even after the page refreshes.
   */
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

  // ── Save handler ──

  /**
   * Runs when the user clicks any "Save Changes" button.
   * Looks at which tab is open and which role the user is, then sends the right data to the right API endpoint.
   * Shows a toast message telling the user if it worked or failed.
   */
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
          // Buyer saving their name, phone, and city.
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
          // Seller saving their owner name, phone, and city.
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
        // Seller saving their business name and business address.
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
        // Buyer saving their delivery address and city.
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
        // Reads password values directly from the DOM input fields (never stored in state).
        const currentPwd = (document.getElementById('current-password') as HTMLInputElement)?.value?.trim()
        const newPwd     = (document.getElementById('new-password')     as HTMLInputElement)?.value?.trim()
        const confirmPwd = (document.getElementById('confirm-password') as HTMLInputElement)?.value?.trim()

        // Checks that all fields are filled in.
        if (!currentPwd || !newPwd || !confirmPwd) {
          showToast('Please fill in all password fields', 'error'); setSaved(false); return
        }
        // Checks that the new password and confirm password match.
        if (newPwd !== confirmPwd) {
          showToast('New passwords do not match', 'error'); setSaved(false); return
        }
        // Checks that the new password is long enough.
        if (newPwd.length < 8) {
          showToast('Password must be at least 8 characters', 'error'); setSaved(false); return
        }

        // Sends the old and new passwords to the API.
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

    // After 2.5 seconds, resets the save button back to normal text.
    setTimeout(() => setSaved(false), 2500)
  }

  // ── Delete account handler ──

  /**
   * Runs when the user confirms they want to delete their account.
   * Calls the DELETE API, navigates to home first, then logs out.
   * Navigating before logout avoids a visual glitch from the page resetting.
   */
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      const token = localStorage.getItem('fr_token')?.replace(/"/g, '')
      const res = await fetch(`${API}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        showToast(data.message ?? 'Failed to delete account', 'error')
        setDeleteLoading(false)
        return
      }
      showToast('Account deleted successfully')
      // Go to home page first, then log out after a tiny delay to avoid a visual glitch.
      navigate('/')
      setTimeout(() => logout(), 100)
    } catch {
      showToast('Something went wrong', 'error')
      setDeleteLoading(false)
    }
  }

  // ── Tab navigation helper ──

  /**
   * Changes the active tab by updating the URL with ?tab=tabName.
   * React Router picks up the URL change and the page re-renders to show the right tab.
   */
  const goToTab = (tab: Tab) => navigate(`?tab=${tab}`)

  // ── Derived display values ──

  /**
   * The name shown at the top of the sidebar.
   * Seller shows business name or owner name. Admin shows adminName. Buyer shows their name.
   */
  const displayName =
    role === 'seller'
      ? (sellerProfile?.businessName || sellerProfile?.ownerName || 'Vendor')
      : role === 'admin'
      ? adminName
      : (buyerProfile?.name ?? user?.name ?? 'User')

  /**
   * The email shown under the name in the sidebar.
   * Each role reads from a slightly different place.
   */
  const displayEmail =
    role === 'seller'
      ? (sellerProfile?.email ?? user?.email ?? '')
      : role === 'admin'
      ? (user?.email ?? 'admin@freshroute.lk')
      : (buyerProfile?.email ?? user?.email ?? '')

  // The text label shown in the role badge — "Admin", "Seller", or "Buyer".
  const roleLabel    = role === 'admin' ? 'Admin' : role === 'seller' ? 'Seller' : 'Buyer'

  // The gradient color used for buttons and the avatar background.
  const roleGradient = role === 'admin' ? 'from-emerald-500 to-teal-600' : 'from-emerald-500 to-supply-teal'

  // The accent text color used for section labels.
  const accentColor  = 'text-emerald-400'

  /**
   * Maps order/product status strings to Tailwind color classes.
   * Used to color status badges like "Delivered" (green) or "Cancelled" (red).
   */
  const statusStyles: Record<string, string> = {
    Delivered:        'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Cancelled:        'text-red-400    bg-red-400/10    border-red-400/20',
    Pending:          'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    APPROVED:         'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    PENDING_APPROVAL: 'text-yellow-400  bg-yellow-400/10  border-yellow-400/20',
  }

  /**
   * Maps audit log entry types to Tailwind color classes.
   * Used to color the little icon badge next to each admin action.
   */
  const auditStyles: Record<string, string> = {
    approve: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    suspend: 'text-yellow-400  bg-yellow-400/10  border-yellow-400/20',
    reject:  'text-red-400    bg-red-400/10    border-red-400/20',
    config:  'text-sky-400    bg-sky-400/10    border-sky-400/20',
  }

  /**
   * Sidebar stat cards built from real API data.
   * Shows "—" for each value while the data is still loading.
   */
  const stats =
    role === 'admin'
      ? [
          { label: 'Total users',    value: statsData?.totalUsers    != null ? String(statsData.totalUsers)    : '—' },
          { label: 'Active vendors', value: statsData?.activeVendors != null ? String(statsData.activeVendors) : '—' },
          { label: 'Orders today',   value: statsData?.ordersToday   != null ? String(statsData.ordersToday)   : '—' },
          { label: 'Admin since',    value: statsData?.adminSince                                               ?? '—' },
        ]
      : role === 'seller'
      ? [
          { label: 'Products',     value: statsData?.totalProducts != null ? String(statsData.totalProducts) : '—' },
          { label: 'Orders',       value: statsData?.totalOrders   != null ? String(statsData.totalOrders)   : '—' },
          { label: 'Member since', value: statsData?.memberSince                                              ?? '—' },
        ]
      : [
          { label: 'Orders',       value: statsData?.totalOrders != null ? String(statsData.totalOrders) : '—' },
          { label: 'Delivered',    value: statsData?.delivered   != null ? String(statsData.delivered)   : '—' },
          { label: 'Member since', value: statsData?.memberSince                                         ?? '—' },
        ]

  /**
   * The text shown on the save button.
   * Changes based on which tab is open and whether saving just happened.
   */
  const saveLabel =
    activeTab === 'password' ? (saved ? '✓ Password updated' : 'Update Password')
    : activeTab === 'address' ? (saved ? '✓ Address saved'   : 'Save Address')
    : (saved ? '✓ Changes saved' : 'Save Changes')

  // ── Render ──

  return (
    <main className="flex min-h-screen gap-0" aria-label="Profile page">

      {/* ── SIDEBAR ── */}
      <aside className="flex w-64 flex-shrink-0 flex-col gap-4 border-r border-white/10 px-3 py-6">

        {/* Avatar card: profile picture, name, email, role badges */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center">
          <div className="relative">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${roleGradient} text-2xl font-bold text-white ring-2 ring-white/10 overflow-hidden`}
              role="img"
              aria-label={`Profile picture for ${displayName}`}
            >
              {/* Shows the uploaded avatar image, or the first letter of the name if no image */}
              {avatarUrl
                ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                : displayName.charAt(0).toUpperCase()
              }
            </div>

            {/* Camera / edit button to upload a new profile picture — hidden for admins */}
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

            {/* Green dot shown only for admins to indicate they are online */}
            {role === 'admin' && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-50">{displayName}</p>
            <p className="text-[11px] text-slate-400">{displayEmail}</p>
          </div>

          {/* Role + approval/suspension badges */}
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

        {/* Sidebar navigation tabs grouped by section */}
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

          {/* Sign out button at the bottom of the sidebar nav */}
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

        {/* Sidebar stats — real numbers from API, shows "—" while loading */}
        <div className="flex flex-col gap-2">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <span className="text-xs text-slate-400">{s.label}</span>
              <span className="text-sm font-semibold text-slate-50">{s.value}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* ── PERSONAL INFO TAB (all roles) ── */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Account Details</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Personal Information</h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
              <div className="grid gap-4 md:grid-cols-2">

                {/* Name field — label changes based on role */}
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

                {/* Email field — always read-only, cannot be changed here */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Email</label>
                  <input value={displayEmail} disabled className={`${inputClass} cursor-not-allowed opacity-50`} autoComplete="email" />
                </div>

                {/* Phone field */}
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

                {/* City dropdown for buyer/seller. Admin sees a read-only Role field instead. */}
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
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300">Role</label>
                    <input value="Super Administrator" disabled className={`${inputClass} cursor-not-allowed opacity-50`} />
                  </div>
                )}
              </div>

              {/* Admin-only: shows all the permissions this admin account has */}
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
                {/* Platform health cards — real data from API */}
                <div>
                  <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Platform Health</p>
                  {healthLoading ? (
                    <p className="py-4 text-center text-sm text-slate-400">Loading platform health…</p>
                  ) : healthCards.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">No health data available.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {healthCards.map((c) => (
                        <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                          <p className={`text-lg font-bold ${c.good ? 'text-emerald-400' : 'text-yellow-400'}`}>{c.value}</p>
                          <p className="text-sm font-medium text-slate-200">{c.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent admin activity — real audit log from API */}
                <div>
                  <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Recent Activity</p>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    {auditLoading ? (
                      <p className="py-4 text-center text-sm text-slate-400">Loading activity…</p>
                    ) : auditLog.length === 0 ? (
                      <p className="py-4 text-center text-sm text-slate-400">No recent activity.</p>
                    ) : (
                      <ul className="space-y-2">
                        {auditLog.map((entry) => (
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
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BUSINESS INFO TAB (seller only) ── */}
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

              {/* Seller's product list — real data from API */}
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
                          <p className="text-base font-medium text-slate-50">{p.name}</p>
                          <p className="text-sm text-slate-400">{p.price}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-0.5 text-sm font-medium ${statusStyles[p.status]}`}>
                          {p.status === 'PENDING_APPROVAL' ? 'Pending' : 'Approved'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Earnings summary — real numbers from the stats API */}
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

        {/* ── ORDERS TAB (buyer only) ── */}
        {activeTab === 'orders' && role === 'buyer' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>History</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Your Orders</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              {ordersLoading ? (
                <p className="py-6 text-center text-sm text-slate-400">Loading your orders…</p>
              ) : orders.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No orders yet.</p>
              ) : (
                <ul className="space-y-2">
                  {orders.map((order) => (
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
              )}
            </div>
          </div>
        )}

        {/* ── DELIVERY ADDRESS TAB (buyer only) ── */}
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

        {/* ── PASSWORD TAB (all roles) ── */}
        {activeTab === 'password' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Security</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Change Password</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4">
              {/* Three password fields: current, new, confirm */}
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

              {/* Blue info box shown only to admins reminding them 2FA is on */}
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

        {/* ── SETTINGS TAB (all roles) ── */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentColor}`}>Preferences</p>
              <h2 className="mt-0.5 text-xl font-semibold text-slate-50">Settings</h2>
            </div>

            {/* Notification toggle section — different options per role */}
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

            {/* Privacy toggles — only shown to buyer and seller */}
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

            {/* Admin-only: security toggles + platform on/off switches */}
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
                          {/* "ACTIVE" badge shown only when a dangerous switch is turned ON */}
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

            {/* Danger zone at the bottom — delete account or sign out all sessions */}
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
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-300">Are you sure? All devices will be signed out.</p>
                      <div className="flex gap-2">
                        <button className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors">
                          Yes, sign out all
                        </button>
                        <button
                          onClick={() => setShowSessionConfirm(false)}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
                        >
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
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleteLoading}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
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