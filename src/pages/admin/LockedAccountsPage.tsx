import { useState, useEffect } from 'react'
import type { JSX } from 'react'

const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`

interface LockedUser {
  id: string
  name: string
  email: string
  role: string
  city: string | null
  updatedAt: string
}

// ── Review Modal ─────────────────────────────────────────────────
const ReviewModal = ({
  user,
  onGrant,
  onClose,
  granting,
  success,
}: {
  user: LockedUser
  onGrant: (userId: string, notes: string) => void
  onClose: () => void
  granting: boolean
  success: boolean
}) => {
  const [notes, setNotes] = useState('')
  const [verified, setVerified] = useState(false)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-50">Review Locked Account</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User details */}
        <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4 space-y-3">
          <p className="text-xs text-slate-400 uppercase font-medium tracking-wide">User Details</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Name</span>
              <span className="text-slate-100 font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-100">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role</span>
              <span className="capitalize text-slate-100">{user.role.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">City</span>
              <span className="text-slate-100">{user.city ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Locked at</span>
              <span className="text-slate-100 text-xs">{formatDate(user.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
          <p className="text-xs text-yellow-300 font-medium mb-1">⚠️ Before granting access</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Make sure you have verified this user's identity via email or phone before proceeding. Granting access without verification is a security risk.
          </p>
        </div>

        {/* Admin notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            Admin notes <span className="text-slate-500">(why are you granting access?)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. User called support and verified identity via phone. Confirmed it was an unauthorized change."
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition resize-none"
          />
        </div>

        {/* Verified checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-800 accent-emerald-500 cursor-pointer"
          />
          <span className="text-xs text-slate-300 leading-relaxed">
            I have verified this user's identity and confirm this was an unauthorized password change.
          </span>
        </label>

        {/* Actions */}
        {success ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-3">
            <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-emerald-400">Recovery email sent!</span>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onGrant(user.id, notes)}
              disabled={!verified || !notes.trim() || granting}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {granting ? 'Sending...' : '🔓 Grant Access'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
const LockedAccountsPage = (): JSX.Element => {
  const token = localStorage.getItem('fr_token')
  const [users, setUsers] = useState<LockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<LockedUser | null>(null)
  const [granting, setGranting] = useState(false)
  const [successId, setSuccessId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/admin/locked-accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch locked accounts')
        return res.json()
      })
      .then((data: LockedUser[]) => setUsers(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleGrantAccess = async (userId: string, notes: string) => {
    setGranting(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/admin/locked-accounts/${userId}/grant-access`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message ?? 'Failed to grant access')
      }
      setSuccessId(userId)
      setTimeout(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setSelectedUser(null)
        setSuccessId(null)
      }, 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error'
      setError(message)
    } finally {
      setGranting(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <>
      {selectedUser && (
        <ReviewModal
          user={selectedUser}
          onGrant={handleGrantAccess}
          onClose={() => { setSelectedUser(null); setGranting(false) }}
          granting={granting}
          success={successId === selectedUser.id}
        />
      )}

      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-50">Locked Accounts</h1>
              <p className="text-xs text-slate-400">Users who triggered "Secure My Account" after an unauthorized password change</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
              <p className="mt-3 text-sm text-slate-400">Loading locked accounts...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && users.length === 0 && !error && (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
                <svg className="h-7 w-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-300 font-medium">All clear!</p>
              <p className="text-sm text-slate-500 mt-1">No locked accounts at this time.</p>
            </div>
          )}

          {/* Table */}
          {!loading && users.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900">
              <table className="min-w-full text-sm text-white">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">Locked at</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 capitalize">
                          {user.role.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{user.city ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{formatDate(user.updatedAt)}</td>
                      <td className="px-4 py-3">
                        {successId === user.id ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recovery email sent!
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="flex items-center gap-1.5 rounded-lg bg-slate-700 border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-600 transition"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-3 text-xs text-slate-500 border-t border-white/5">
                {users.length} locked account{users.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Info box */}
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
            <p className="text-xs text-yellow-300 font-medium mb-1">ℹ️ How this works</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a user clicks <strong className="text-slate-300">"Secure My Account"</strong> in the password changed email, their account is immediately locked.
              Click <strong className="text-slate-300">"Review"</strong> to verify the user's identity, add notes, and grant access if confirmed.
            </p>
          </div>

        </div>
      </div>
    </>
  )
}

export default LockedAccountsPage