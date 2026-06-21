import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useToast } from '../../context/ToastContext'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hrs  = Math.floor(diff / 3600000)
  if (hrs < 24)  return `${hrs}h ago`
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const canEdit = (dateStr: string) =>
  (Date.now() - new Date(dateStr).getTime()) / 3600000 <= 24

const miniStars = (val: number) => '★'.repeat(val) + '☆'.repeat(5 - val)

const ratingColor = (val: number) =>
  val >= 4.5 ? 'text-emerald-400' : val >= 3.5 ? 'text-amber-400' : 'text-red-400'

// ─── Sub-components ───────────────────────────────────────────────────────────

const Stars = ({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) => (
  <span
    className={size === 'lg' ? 'text-xl tracking-tight' : 'text-sm tracking-tight'}
    style={{ color: '#f59e0b' }}
  >
    {'★'.repeat(value)}{'☆'.repeat(5 - value)}
  </span>
)

const SubcatChip = ({ label, val }: { label: string; val: number }) => (
  <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
    {label} <span style={{ color: '#f59e0b', fontSize: '10px' }}>{miniStars(val)}</span>
  </span>
)

const MetricPill = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center">
    <p className="text-2xl font-bold text-supply-paper">{value}</p>
    <p className="mt-0.5 text-xs text-slate-400">{label}</p>
  </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const BuyerRatingsPage = (): JSX.Element => {
  const { showToast } = useToast()

  const [ratings, setRatings]                 = useState<Rating[]>([])
  const [loading, setLoading]                 = useState(true)
  const [filter, setFilter]                   = useState<number | null>(null)
  const [editingId, setEditingId]             = useState<string | null>(null)
  const [editComment, setEditComment]         = useState('')
  const [editRatings, setEditRatings]         = useState({ overall: 0, delivery: 0, quality: 0 })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('fr_token')
      const res = await fetch('http://localhost:5000/api/v1/rating/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setRatings(await res.json())
    } catch {
      showToast('Failed to load ratings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('fr_token')
      const res   = await fetch(`http://localhost:5000/api/v1/rating/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setRatings(prev => prev.filter(r => r.id !== id))
      setConfirmDeleteId(null)
      showToast('Rating deleted successfully')
    } catch (err: any) {
      showToast(err.message ?? 'Failed to delete rating', 'error')
    }
  }

  const handleEditOpen = (r: Rating) => {
    setEditingId(r.id)
    setEditComment(r.comment ?? '')
    setEditRatings({ overall: r.rating, delivery: r.deliveryRating, quality: r.productQualityRating })
  }

  const handleEditSave = async (id: string) => {
    try {
      const token = localStorage.getItem('fr_token')
      const res   = await fetch(`http://localhost:5000/api/v1/rating/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ratings: editRatings,
          comment: editComment,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
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

  const filtered   = filter ? ratings.filter(r => r.rating === filter) : ratings
  const avgRating  = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : null

  return (
    <div className="space-y-8 text-slate-100">

      {/* Page header */}
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">History</p>
        <h1 className="mt-2 text-2xl font-semibold text-supply-paper">My Reviews</h1>
        <p className="mt-1 text-sm text-slate-300">
          Reviews can be edited or deleted within 24 hours of submission.
        </p>
      </header>

      {/* Metrics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricPill label="Reviews written"     value={ratings.length} />
        <MetricPill label="Your average rating" value={avgRating ? `${avgRating} ★` : '—'} />
        <MetricPill label="Verified purchases"  value={ratings.filter(r => r.isVerifiedPurchase).length} />
      </section>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !filter
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          All ({ratings.length})
        </button>
        {[5, 4, 3, 2, 1].map(s => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? null : s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {'★'.repeat(s)} ({ratings.filter(r => r.rating === s).length})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-14 text-center">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-semibold text-slate-300">No reviews yet</p>
          <p className="text-sm text-slate-500 mt-1">
            {filter ? 'Try a different star filter.' : 'Your submitted reviews will appear here.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(r => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 hover:border-white/20 transition-colors"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-supply-paper">
                      {r.productName ?? 'Product'}
                    </span>
                    {r.isVerifiedPurchase && (
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    {r.order ? `#${r.order.orderNumber}` : ''}
                    {r.sellerName ? ` · ${r.sellerName}` : ''}
                    {r.driver?.user?.name ? ` · Driver: ${r.driver.user.name}` : ''}
                  </p>
                </div>

                {/* Edit / Delete — only within 24h window */}
                {canEdit(r.createdAt) && editingId !== r.id && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditOpen(r)}
                      className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-slate-400 hover:border-white/30 hover:text-slate-200 transition-colors"
                    >
                      ✏ Edit
                    </button>
                    {confirmDeleteId === r.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-red-400">Sure?</span>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-[10px] text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 hover:text-red-300"
                        >Yes</button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] text-slate-400 border border-white/10 rounded-full px-2 py-0.5 hover:text-slate-200"
                        >No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(r.id)}
                        className="rounded-full border border-red-500/20 px-2.5 py-0.5 text-[10px] text-red-400 hover:border-red-500/40 hover:text-red-300 transition-colors"
                      >
                        ✕ Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Stars + time (view mode) */}
              {editingId !== r.id && (
                <>
                  <div className="flex items-center gap-3">
                    <Stars value={r.rating} size="lg" />
                    <span className={`text-xl font-bold ${ratingColor(r.rating)}`}>{r.rating}.0</span>
                    <span className="text-xs text-slate-500 ml-auto">{timeAgo(r.createdAt)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <SubcatChip label="Delivery" val={r.deliveryRating} />
                    <SubcatChip label="Quality"  val={r.productQualityRating} />
                  </div>

                  {r.comment && (
                    <p className="text-sm text-slate-300 border-t border-white/10 pt-3 leading-relaxed italic">
                      "{r.comment}"
                    </p>
                  )}

                  <p className={`text-[10px] ${canEdit(r.createdAt) ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {canEdit(r.createdAt) ? '✓ Editable — window closes soon' : '🔒 Edit window closed'}
                  </p>
                </>
              )}

              {/* Inline edit form */}
              {editingId === r.id && (
                <div className="space-y-4 border-t border-white/10 pt-4">
                  {(['overall', 'delivery', 'quality'] as const).map(key => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 capitalize">{key}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setEditRatings(prev => ({ ...prev, [key]: s }))}
                            className={`text-xl transition-all ${
                              s <= editRatings[key] ? 'text-amber-400' : 'text-slate-600'
                            } hover:text-amber-300`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <textarea
                    value={editComment}
                    onChange={e => setEditComment(e.target.value)}
                    rows={2}
                    placeholder="Update your comment..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 resize-none"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(r.id)}
                      className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
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