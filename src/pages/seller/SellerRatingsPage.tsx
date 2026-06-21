import { useState, useEffect } from 'react'
import type { JSX } from 'react'
// import { useToast } from '../../context/ToastContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductSummary {
  id: string
  name: string
  imageUrl: string | null
  category: string
  totalRatings: number
  averageRating: number
}

interface ProductStats {
  total: number
  averages: { overall: number; delivery: number; quality: number; packaging: number }
  distribution: Record<number, number>
}

interface IndividualRating {
  id: string
  rating: number
  deliveryRating: number | null
  productQualityRating: number | null
  packagingRating: number | null
  comment: string | null
  createdAt: string
  isVerifiedPurchase: boolean
  isFlagged: boolean
  buyer: { user: { name: string } }
  order: { orderNumber: string } | null
}

type View = 'products' | 'detail'

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_PRODUCTS: ProductSummary[] = [
  { id: 'prod-1', name: 'Heirloom Tomatoes', imageUrl: null, category: 'Vegetables', totalRatings: 12, averageRating: 4.5 },
  { id: 'prod-2', name: 'Organic Bananas',   imageUrl: null, category: 'Fruits',     totalRatings: 8,  averageRating: 3.8 },
  { id: 'prod-3', name: 'Kale Bunch',        imageUrl: null, category: 'Vegetables', totalRatings: 5,  averageRating: 4.9 },
  { id: 'prod-4', name: 'Red Apples',        imageUrl: null, category: 'Fruits',     totalRatings: 0,  averageRating: 0   },
]

const DUMMY_STATS: Record<string, ProductStats> = {
  'prod-1': { total: 12, averages: { overall: 4.5, delivery: 4.2, quality: 4.8, packaging: 4.0 }, distribution: { 5: 7, 4: 3, 3: 1, 2: 1, 1: 0 } },
  'prod-2': { total: 8,  averages: { overall: 3.8, delivery: 4.0, quality: 3.6, packaging: 3.5 }, distribution: { 5: 2, 4: 3, 3: 2, 2: 1, 1: 0 } },
  'prod-3': { total: 5,  averages: { overall: 4.9, delivery: 4.8, quality: 5.0, packaging: 4.6 }, distribution: { 5: 5, 4: 0, 3: 0, 2: 0, 1: 0 } },
}

const DUMMY_REVIEWS: Record<string, IndividualRating[]> = {
  'prod-1': [
    { id: 'r1', rating: 5, deliveryRating: 5, productQualityRating: 5, packagingRating: 4, comment: 'Super fresh! Arrived in perfect condition. Will definitely order again.', createdAt: new Date().toISOString(),                       isVerifiedPurchase: true,  isFlagged: false, buyer: { user: { name: 'Isuru Perera'  } }, order: { orderNumber: 'FR-1042' } },
    { id: 'r2', rating: 4, deliveryRating: 4, productQualityRating: 4, packagingRating: 3, comment: 'Good quality but packaging could be better.',                          createdAt: new Date(Date.now() - 86400000).toISOString(),  isVerifiedPurchase: true,  isFlagged: false, buyer: { user: { name: 'Aruni Jayasena' } }, order: { orderNumber: 'FR-1038' } },
    { id: 'r3', rating: 3, deliveryRating: 3, productQualityRating: 4, packagingRating: 3, comment: null,                                                                    createdAt: new Date(Date.now() - 172800000).toISOString(), isVerifiedPurchase: false, isFlagged: false, buyer: { user: { name: 'Demo Cafe'     } }, order: { orderNumber: 'FR-1035' } },
    { id: 'r4', rating: 5, deliveryRating: 5, productQualityRating: 5, packagingRating: 5, comment: 'Best produce on FreshRoute! Highly recommend.',                         createdAt: new Date(Date.now() - 259200000).toISOString(), isVerifiedPurchase: true,  isFlagged: false, buyer: { user: { name: 'Kamal Silva'   } }, order: { orderNumber: 'FR-1030' } },
  ],
  'prod-2': [
    { id: 'r5', rating: 4, deliveryRating: 4, productQualityRating: 4, packagingRating: 4, comment: 'Nice and ripe, good value for money.',   createdAt: new Date(Date.now() - 86400000).toISOString(),  isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Nimal Fernando'  } }, order: { orderNumber: 'FR-1020' } },
    { id: 'r6', rating: 3, deliveryRating: 4, productQualityRating: 3, packagingRating: 3, comment: 'A few were overripe on arrival.',         createdAt: new Date(Date.now() - 172800000).toISOString(), isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Shalini De Silva' } }, order: { orderNumber: 'FR-1018' } },
    { id: 'r7', rating: 5, deliveryRating: 5, productQualityRating: 5, packagingRating: 4, comment: 'Perfect bananas every time!',             createdAt: new Date(Date.now() - 345600000).toISOString(), isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Rohan Mendis'    } }, order: { orderNumber: 'FR-1015' } },
  ],
  'prod-3': [
    { id: 'r8', rating: 5, deliveryRating: 5, productQualityRating: 5, packagingRating: 5, comment: 'Absolutely fresh and crisp. Love it!',      createdAt: new Date().toISOString(),                       isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Ayesha Rizvi' } }, order: { orderNumber: 'FR-1050' } },
    { id: 'r9', rating: 5, deliveryRating: 5, productQualityRating: 5, packagingRating: 4, comment: "Best kale I've had. Super green and fresh.", createdAt: new Date(Date.now() - 86400000).toISOString(),  isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Priya Nair'   } }, order: { orderNumber: 'FR-1048' } },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string) => {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

const ratingColor = (val: number) => {
  if (val >= 4.5) return 'text-emerald-400'
  if (val >= 3.5) return 'text-amber-400'
  return 'text-red-400'
}

const ratingLabel = (val: number) => {
  if (val >= 4.5) return 'Excellent'
  if (val >= 4.0) return 'Very Good'
  if (val >= 3.5) return 'Good'
  if (val >= 3.0) return 'Average'
  return 'Poor'
}

// Inline star renderer — dots for sub-rating chips to keep them compact
const Stars = ({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) => (
  <span className={size === 'lg' ? 'text-xl tracking-tight' : 'text-xs tracking-tight'} style={{ color: '#fbbf24' }}>
    {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
  </span>
)

// Metric pill used in the store overview header
const MetricPill = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center">
    <p className="text-2xl font-bold text-supply-paper">{value}</p>
    <p className="mt-0.5 text-xs text-slate-400">{label}</p>
  </div>
)

// Horizontal bar for star distribution
const DistBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-2 text-right text-slate-400 font-medium">{star}</span>
      <span style={{ color: '#34d399', fontSize: '10px' }}>★</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct >= 60 ? '#34d399' : pct >= 30 ? '#fbbf24' : '#f87171',
          }}
        />
      </div>
      <span className="w-4 text-right text-slate-500">{count}</span>
    </div>
  )
}

// Dimension stat row (delivery / quality / packaging)
const DimensionRow = ({ label, value }: { label: string; value: number }) => {
  let barColor = '#34d399' // green
  if (value < 4.5) barColor = '#fbbf24' // yellow
  if (value < 3.5) barColor = '#f87171' // red
  
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-400 min-w-[90px]">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(value / 5) * 100}%`, background: barColor }}
        />
      </div>
      <span className={`text-xs font-bold min-w-[28px] text-right ${ratingColor(value)}`}>{value.toFixed(1)}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SellerRatingsPage = (): JSX.Element => {
  // const { showToast } = useToast()
  const showToast = (msg: string) => console.log(msg) // stub

  const [view, setView]                       = useState<View>('products')
  const [products, setProducts]               = useState<ProductSummary[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null)
  const [productStats, setProductStats]       = useState<ProductStats | null>(null)
  const [reviews, setReviews]                 = useState<IndividualRating[]>([])
  const [loading, setLoading]                 = useState(true)
  const [reviewsLoading, setReviewsLoading]   = useState(false)
  const [filter, setFilter]                   = useState<number | null>(null)

  useEffect(() => {
    setTimeout(() => { setProducts(DUMMY_PRODUCTS); setLoading(false) }, 500)
  }, [])

  const handleProductClick = (product: ProductSummary) => {
    setSelectedProduct(product)
    setView('detail')
    setReviewsLoading(true)
    setFilter(null)
    setTimeout(() => {
      setProductStats(DUMMY_STATS[product.id] ?? null)
      setReviews(DUMMY_REVIEWS[product.id] ?? [])
      setReviewsLoading(false)
    }, 400)
  }

  const handleFlag = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isFlagged: true } : r))
    showToast('Review flagged for admin review')
  }

  const filteredReviews  = filter ? reviews.filter(r => r.rating === filter) : reviews
  const ratedProducts    = products.filter(p => p.totalRatings > 0)
  const storeAverage     = ratedProducts.length
    ? ratedProducts.reduce((sum, p) => sum + p.averageRating, 0) / ratedProducts.length : 0
  const totalStoreRatings = products.reduce((sum, p) => sum + p.totalRatings, 0)

  // ── PRODUCTS LIST ─────────────────────────────────────────────────────────
  if (view === 'products') return (
    <div className="space-y-8 text-slate-100">

      {/* Page header — mirrors dashboard header style */}
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">Feedback</p>
          <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Ratings & Reviews</h1>
          <p className="mt-1 text-sm text-slate-300">Monitor what customers are saying across your entire catalog.</p>
        </div>
        {totalStoreRatings > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-4xl font-bold ${ratingColor(storeAverage)}`}>{storeAverage.toFixed(1)}</span>
            <div>
              <Stars value={storeAverage} size="lg" />
              <p className="text-xs text-slate-400 mt-0.5">Store average</p>
            </div>
          </div>
        )}
      </header>

      {/* Store overview metrics row — matches dashboard metric cards */}
      {totalStoreRatings > 0 && (
        <section className="grid gap-4 sm:grid-cols-3">
          <MetricPill label="Total reviews"   value={totalStoreRatings} />
          <MetricPill label="Products rated"  value={ratedProducts.length} />
          <MetricPill label="Sentiment"       value={ratingLabel(storeAverage)} />
        </section>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {products.map(product => {
            const hasRatings = product.totalRatings > 0
            return (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-left transition-all hover:border-emerald-500/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-lg">
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover rounded-2xl" />
                        : '🛒'}
                    </div>
                    <div>
                      <p className="font-semibold text-supply-paper group-hover:text-emerald-300 transition-colors">{product.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">{product.category}</p>
                    </div>
                  </div>
                  <svg className="mt-1 h-4 w-4 flex-shrink-0 text-slate-600 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Rating row or empty state */}
                <div className="mt-4 flex items-center justify-between">
                  {!hasRatings ? (
                    <p className="text-xs text-slate-500 italic">No reviews yet</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${ratingColor(product.averageRating)}`}>{product.averageRating.toFixed(1)}</span>
                        <div>
                          <Stars value={product.averageRating} />
                          <p className="text-[10px] text-slate-500 mt-0.5">{product.totalRatings} review{product.totalRatings !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      {/* Sentiment pill */}
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        product.averageRating >= 4.5
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : product.averageRating >= 3.5
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                      }`}>
                        {ratingLabel(product.averageRating)}
                      </span>
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </section>
      )}
    </div>
  )

  // ── DETAIL VIEW ───────────────────────────────────────────────────────────
  if (view === 'detail' && selectedProduct) return (
    <div className="space-y-6 text-slate-100">

      {/* Back */}
      <button
        onClick={() => { setView('products'); setSelectedProduct(null); setProductStats(null) }}
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to products
      </button>

      {/* Product header — mirrors dashboard header */}
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xl">
            {selectedProduct.imageUrl
              ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover rounded-2xl" />
              : '🛒'}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-teal">{selectedProduct.category}</p>
            <h1 className="mt-1 text-2xl font-semibold text-supply-paper">{selectedProduct.name}</h1>
          </div>
        </div>
        {productStats && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-4xl font-bold ${ratingColor(productStats.averages.overall)}`}>
              {productStats.averages.overall.toFixed(1)}
            </span>
            <div>
              <Stars value={productStats.averages.overall} size="lg" />
              <p className="text-xs text-slate-400 mt-0.5">{productStats.total} reviews</p>
            </div>
          </div>
        )}
      </header>

      {reviewsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : !productStats || productStats.total === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-14 text-center">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-semibold text-slate-300">No reviews for this product yet</p>
          <p className="text-sm text-slate-500 mt-1">Reviews will appear here once customers rate this item.</p>
        </div>
      ) : (
        /* Two-column layout — mirrors dashboard telemetry+low-stock grid */
        <section className="grid gap-6 xl:grid-cols-[1fr,1.6fr]">

          {/* LEFT — Stats panel */}
          <div className="space-y-5">

            {/* Distribution card */}
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Rating breakdown</h2>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(s => (
                  <DistBar key={s} star={s} count={productStats.distribution[s] ?? 0} total={productStats.total} />
                ))}
              </div>
            </div>

            {/* Dimension averages card */}
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Category scores</h2>
              <div className="space-y-4">
                <DimensionRow label="Delivery Speed"  value={productStats.averages.delivery} />
                <DimensionRow label="Product Quality" value={productStats.averages.quality} />
                <DimensionRow label="Packaging"       value={productStats.averages.packaging} />
              </div>
            </div>

            {/* Sentiment summary */}
            <div className={`rounded-3xl border px-5 py-4 ${
              productStats.averages.overall >= 4.5
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : productStats.averages.overall >= 3.5
                ? 'border-amber-500/20 bg-amber-500/5'
                : 'border-red-500/20 bg-red-500/5'
            }`}>
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Overall sentiment</p>
              <p className={`text-xl font-bold ${ratingColor(productStats.averages.overall)}`}>
                {ratingLabel(productStats.averages.overall)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Based on {productStats.total} verified customer review{productStats.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* RIGHT — Reviews list */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-sm font-semibold text-white">
                {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
              </h2>
              {/* Filter pills */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!filter
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilter(filter === s ? null : s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === s
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
                  >
                    {'★'.repeat(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* Review cards */}
            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {filteredReviews.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-10 text-center">
                  <p className="text-sm text-slate-400">No reviews match this filter.</p>
                </div>
              ) : filteredReviews.map(r => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 transition-colors hover:border-white/20">

                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">
                        {r.buyer?.user?.name?.charAt(0).toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-200">{r.buyer?.user?.name ?? 'Anonymous'}</span>
                          {r.isVerifiedPurchase && (
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              ✓ Verified
                            </span>
                          )}
                          {r.order && (
                            <span className="text-[10px] text-slate-500 font-mono">{r.order.orderNumber}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Stars value={r.rating} />
                          <span className="text-[10px] text-slate-500">{timeAgo(r.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Flag */}
                    {!r.isFlagged
                      ? <button onClick={() => handleFlag(r.id)} className="flex-shrink-0 rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-slate-500 hover:border-red-500/40 hover:text-red-400 transition-colors">
                          ⚑ Flag
                        </button>
                      : <span className="flex-shrink-0 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] text-orange-400">
                          ⚑ Flagged
                        </span>
                    }
                  </div>

                  {/* Sub-rating chips */}
                  <div className="flex flex-wrap gap-2">
                    {r.deliveryRating       != null && (
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                        Delivery <Stars value={r.deliveryRating} />
                      </span>
                    )}
                    {r.productQualityRating != null && (
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                        Quality <Stars value={r.productQualityRating} />
                      </span>
                    )}
                    {r.packagingRating      != null && (
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                        Packaging <Stars value={r.packagingRating} />
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  {r.comment && (
                    <p className="text-sm text-slate-300 border-t border-white/10 pt-2 leading-relaxed">
                      "{r.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )

  return <></>
}

export default SellerRatingsPage