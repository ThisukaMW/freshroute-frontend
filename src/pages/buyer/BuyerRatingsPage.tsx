import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useToast } from '../../context/ToastContext'

// Shape of a single rating submitted by the buyer
interface Rating {
  id: string
  rating: number
  deliveryRating: number
  productQualityRating: number
  comment: string | null
  createdAt: string
  isVerifiedPurchase: boolean
  driver: { user: { name: string } }
  order: { orderNumber: string } | null
  sellerName?: string
  productName?: string
}

// Renders filled and empty stars based on the numeric rating value
const Stars = ({ value }: { value: number }) => (
  <span className="text-emerald-400">
    {'★'.repeat(value)}{'☆'.repeat(5 - value)}
  </span>
)

// Returns a human-readable relative time label for a given ISO date string
const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

// Returns true if the review was submitted within the 24-hour edit/delete window
const canEdit = (dateStr: string) => {
  const hoursSince = (Date.now() - new Date(dateStr).getTime()) / 3600000
  return hoursSince <= 24
}

const BuyerRatingsPage = (): JSX.Element => {
  const { showToast } = useToast()
  const [ratings, setRatings]   = useState<Rating[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<number | null>(null)
  // Tracks which review card is currently open for inline editing
  const [editingId, setEditingId]       = useState<string | null>(null)
  // Holds the live comment text while an edit is in progress
  const [editComment, setEditComment]   = useState('')
  // Holds the live star ratings while an edit is in progress
  const [editRatings, setEditRatings]   = useState({ overall: 0, delivery: 0, quality: 0 })
  // Tracks which review is awaiting delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Fetches all ratings submitted by the authenticated buyer from the API
  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('fr_token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/rating/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setRatings(data)
      }
    } catch {
      showToast('Failed to load ratings', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Deletes a rating by id after the two-step confirmation is accepted
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('fr_token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/rating/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      // Remove the deleted rating from local state immediately
      setRatings(prev => prev.filter(r => r.id !== id))
      setConfirmDeleteId(null)
      showToast('Rating deleted successfully')
    } catch (err: any) {
      showToast(err.message ?? 'Failed to delete rating', 'error')
    }
  }

  // Opens the inline edit form for a rating, seeding the fields with current values
  const handleEditOpen = (r: Rating) => {
    setEditingId(r.id)
    setEditComment(r.comment ?? '')
    setEditRatings({ overall: r.rating, delivery: r.deliveryRating, quality: r.productQualityRating })
  }

  // Submits the edited rating values to the API and updates local state on success
  const handleEditSave = async (id: string) => {
    try {
      const token = localStorage.getItem('fr_token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/rating/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ratings: { overall: editRatings.overall, delivery: editRatings.delivery, quality: editRatings.quality },
          comment: editComment,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      // Merge the updated fields into the existing rating in local state
      setRatings(prev => prev.map(r => r.id === id
        ? { ...r, rating: editRatings.overall, deliveryRating: editRatings.delivery, productQualityRating: editRatings.quality, comment: editComment }
        : r
      ))
      setEditingId(null)
      showToast('Review updated successfully')
    } catch (err: any) {
      showToast(err.message ?? 'Failed to update rating', 'error')
    }
  }

  useEffect(() => { fetchRatings() }, [])

  // Apply the active star filter — null means show all ratings
  const filtered = filter ? ratings.filter(r => r.rating === filter) : ratings

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">History</p>
        <h2 className="mt-0.5 text-xl font-semibold text-slate-50">My Reviews</h2>
        <p className="mt-1 text-xs text-slate-400">Reviews can be edited or deleted within 24 hours of submission.</p>
      </div>

      {/* Star filter pills — one per rating value plus an "All" option */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!filter ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
        >
          All ({ratings.length})
        </button>
        {[5, 4, 3, 2, 1].map(s => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? null : s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
          >
            {'★'.repeat(s)} ({ratings.filter(r => r.rating === s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-slate-400 text-sm">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">

              {/* Review header — stars, time, badges, edit/delete actions */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Stars value={r.rating} />
                    <span className="text-xs text-slate-400">{timeAgo(r.createdAt)}</span>
                    {/* Verified purchase badge — shown when the rating is linked to a real order */}
                    {r.isVerifiedPurchase && (
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {r.productName && <span>{r.productName} · </span>}
                    Driver: {r.driver?.user?.name ?? 'Unknown'}
                    {r.order && ` · Order #${r.order.orderNumber}`}
                  </p>
                </div>

                {/* Edit and delete actions — only available within the 24-hour window */}
                {canEdit(r.createdAt) && editingId !== r.id && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditOpen(r)}
                      className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors border border-white/10 rounded-full px-2 py-0.5"
                    >
                      ✎ Edit
                    </button>
                    {/* First click shows confirmation; second click calls the delete API */}
                    {confirmDeleteId === r.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-red-400">Sure?</span>
                        <button onClick={() => handleDelete(r.id)} className="text-[10px] text-red-400 hover:text-red-300 border border-red-500/30 rounded-full px-2 py-0.5">Yes</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] text-slate-400 hover:text-slate-200 border border-white/10 rounded-full px-2 py-0.5">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(r.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 transition-colors border border-red-500/20 rounded-full px-2 py-0.5"
                      >
                        ✕ Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sub-ratings row — delivery and quality stars */}
              {editingId !== r.id && (
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <span>Delivery: <Stars value={r.deliveryRating} /></span>
                  <span>Quality: <Stars value={r.productQualityRating} /></span>
                </div>
              )}

              {/* Review comment — only shown when present and not in edit mode */}
              {r.comment && editingId !== r.id && (
                <p className="text-sm text-slate-300 border-t border-white/10 pt-2">"{r.comment}"</p>
              )}

              {/* Inline edit form — replaces the review content when editing is active */}
              {editingId === r.id && (
                <div className="space-y-3 border-t border-white/10 pt-3">
                  {/* Editable star rows for each rating category */}
                  {[
                    { label: 'Overall',  key: 'overall'  as const },
                    { label: 'Delivery', key: 'delivery' as const },
                    { label: 'Quality',  key: 'quality'  as const },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{label}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setEditRatings(prev => ({ ...prev, [key]: s }))}
                            className={`text-lg transition-all ${s <= editRatings[key] ? 'text-emerald-400' : 'text-slate-600'} hover:text-emerald-300`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* Editable comment textarea */}
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={2}
                    placeholder="Update your comment..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 resize-none"
                  />
                  {/* Save and cancel buttons for the inline edit form */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(r.id)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                    >
                      Save changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BuyerRatingsPage