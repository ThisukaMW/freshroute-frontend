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
  isVerifiedPurchase: boolean
  buyer: { user: { name: string } }
  order: { orderNumber: string; items?: { product: { name: string } }[] } | null
}

interface Stats {
  total: number
  average: number
  distribution: Record<number, number>
}

const Stars = ({ value }: { value: number }) => (
  <span className="text-emerald-400">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
)

const SellerRatingsPage = ({ driverId }: { driverId: string }): JSX.Element => {
  const { showToast } = useToast()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratingsRes, statsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/v1/rating/driver/${driverId}`),
          fetch(`http://localhost:5000/api/v1/rating/driver/${driverId}/stats`),
        ])
        if (ratingsRes.ok) setRatings(await ratingsRes.json())
        if (statsRes.ok) setStats(await statsRes.json())
      } catch {
        showToast('Failed to load ratings', 'error')
      } finally {
        setLoading(false)
      }
    }
    if (driverId) fetchData()
  }, [driverId])

  const handleFlag = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/v1/rating/${id}/flag`, { method: 'POST' })
      showToast('Rating flagged for review')
    } catch {
      showToast('Failed to flag rating', 'error')
    }
  }

  const filtered = filter ? ratings.filter(r => r.rating === filter) : ratings

  const timeAgo = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const avgDelivery = ratings.length
    ? Math.round(ratings.reduce((s, r) => s + r.deliveryRating, 0) / ratings.length * 10) / 10
    : 0
  const avgQuality = ratings.length
    ? Math.round(ratings.reduce((s, r) => s + r.productQualityRating, 0) / ratings.length * 10) / 10
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">Feedback</p>
        <h2 className="mt-0.5 text-2xl font-semibold text-slate-50">Ratings & Reviews</h2>
        <p className="mt-1 text-sm text-slate-400">See what customers are saying about this seller</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading reviews...</div>
      ) : (
        <>
          {/* Stats card */}
          {stats && stats.total > 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                {/* Big average */}
                <div className="text-center sm:border-r sm:border-white/10 sm:pr-6">
                  <p className="text-5xl font-bold text-slate-50">{stats.average.toFixed(1)}</p>
                  <Stars value={Math.round(stats.average)} />
                  <p className="text-xs text-slate-400 mt-1">{stats.total} reviews</p>
                </div>

                {/* Distribution bars */}
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map(s => (
                    <div key={s} className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 w-3 text-right">{s}</span>
                      <span className="text-emerald-400 text-[10px]">★</span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: stats.total ? `${((stats.distribution[s] || 0) / stats.total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-slate-400 w-4 text-right">{stats.distribution[s] || 0}</span>
                    </div>
                  ))}
                </div>

                {/* Sub ratings */}
                <div className="space-y-3 sm:border-l sm:border-white/10 sm:pl-6">
                  {[
                    { label: 'Delivery', value: avgDelivery },
                    { label: 'Quality', value: avgQuality },
                  ].map(item => (
                    <div key={item.label} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-emerald-400 font-medium">{item.value}</span>
                      </div>
                      <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(item.value / 5) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
              <p className="text-2xl mb-2">⭐</p>
              <p className="text-slate-300 font-medium">No reviews yet</p>
              <p className="text-slate-500 text-sm mt-1">Reviews will appear here once customers rate their orders</p>
            </div>
          )}

          {/* Filter */}
          {ratings.length > 0 && (
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
          )}

          {/* Reviews list */}
          {filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((r) => {
                const productName = r.order?.items?.[0]?.product?.name
                return (
                  <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">
                          {r.buyer?.user?.name?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-200">{r.buyer?.user?.name ?? 'Anonymous'}</span>
                            {r.isVerifiedPurchase && (
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                                ✓ Verified Purchase
                              </span>
                            )}
                            {productName && (
                              <span className="rounded-full bg-supply-teal/20 border border-supply-teal/30 px-3 py-1 text-xs font-medium text-white/80">
                                🛒 {productName}
                              </span>
                            )}
                            {r.order && (
                              <span className="text-[10px] text-slate-500">{r.order.orderNumber}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Stars value={r.rating} />
                            <span className="text-xs text-slate-500">{timeAgo(r.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFlag(r.id)}
                        className="text-[10px] text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 border border-white/10 rounded-full px-2 py-0.5"
                      >
                        ⚑ Flag
                      </button>
                    </div>

                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>Delivery: <Stars value={r.deliveryRating} /></span>
                      <span>Quality: <Stars value={r.productQualityRating} /></span>
                    </div>

                    {r.comment && (
                      <p className="text-sm text-slate-300 border-t border-white/10 pt-2 leading-relaxed">"{r.comment}"</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SellerRatingsPage