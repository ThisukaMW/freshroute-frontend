import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useToast } from '../../context/ToastContext'

interface Rating {
  id: string
  rating: number
  deliveryRating: number
  productQualityRating: number
  comment: string | null
  createdAt: string
  driver: { user: { name: string } }
  order: { orderNumber: string } | null
}

const Stars = ({ value }: { value: number }) => (
  <span className="text-emerald-400">
    {'★'.repeat(value)}{'☆'.repeat(5 - value)}
  </span>
)

const BuyerRatingsPage = (): JSX.Element => {
  const { showToast } = useToast()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<number | null>(null)

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('fr_token')
      const res = await fetch('http://localhost:5000/api/v1/rating/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setRatings(data)
      }
    } catch (err) {
      showToast('Failed to load ratings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('fr_token')
      const res = await fetch(`http://localhost:5000/api/v1/rating/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setRatings(prev => prev.filter(r => r.id !== id))
      showToast('Rating deleted successfully')
    } catch (err: any) {
      showToast(err.message ?? 'Failed to delete rating', 'error')
    }
  }

  useEffect(() => { fetchRatings() }, [])

  const filtered = filter ? ratings.filter(r => r.rating === filter) : ratings

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const canDelete = (dateStr: string) => {
    const hoursSince = (Date.now() - new Date(dateStr).getTime()) / 3600000
    return hoursSince <= 24
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">History</p>
        <h2 className="mt-0.5 text-xl font-semibold text-slate-50">My Reviews</h2>
      </div>

      {/* Filter by stars */}
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
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
          >
            {'★'.repeat(s)} ({ratings.filter(r => r.rating === s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-slate-400 text-sm">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Stars value={r.rating} />
                    <span className="text-xs text-slate-400">{timeAgo(r.createdAt)}</span>
                    {/* verified purchase badge */}
                    {r.order && (
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Driver: {r.driver?.user?.name ?? 'Unknown'}
                    {r.order && ` · Order #${r.order.orderNumber}`}
                  </p>
                </div>
                {canDelete(r.createdAt) && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* sub ratings */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <span>Delivery: <Stars value={r.deliveryRating} /></span>
                <span>Quality: <Stars value={r.productQualityRating} /></span>
              </div>

              {r.comment && (
                <p className="text-sm text-slate-300 border-t border-white/10 pt-2">"{r.comment}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BuyerRatingsPage