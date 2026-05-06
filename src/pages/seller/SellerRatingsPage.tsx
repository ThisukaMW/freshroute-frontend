import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useToast } from '../../context/ToastContext'

// Summary data shown on the product list card
interface ProductSummary {
  id: string
  name: string
  imageUrl: string | null
  category: string
  totalRatings: number
  averageRating: number
}

// Aggregated stats for a specific product — shown on the breakdown view
interface ProductStats {
  total: number
  averages: { overall: number; delivery: number; quality: number; packaging: number }
  // Star value (1–5) mapped to how many reviews gave that rating
  distribution: Record<number, number>
}

// Shape of a single customer review on a product
interface IndividualRating {
  id: string
  rating: number
  deliveryRating: number | null
  productQualityRating: number | null
  packagingRating: number | null
  comment: string | null
  createdAt: string
  // True when the reviewer made a verified purchase of this product
  isVerifiedPurchase: boolean
  // True when the seller has flagged this review for admin attention
  isFlagged: boolean
  buyer: { user: { name: string } }
  order: { orderNumber: string } | null
}

// Controls which of the two sub-pages is currently rendered
type View = 'products' | 'detail'

// ─── Dummy data (replace with real API calls) ────────────────────────────────

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
    { id: 'r5', rating: 4, deliveryRating: 4, productQualityRating: 4, packagingRating: 4, comment: 'Nice and ripe, good value for money.',     createdAt: new Date(Date.now() - 86400000).toISOString(),  isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Nimal Fernando'  } }, order: { orderNumber: 'FR-1020' } },
    { id: 'r6', rating: 3, deliveryRating: 4, productQualityRating: 3, packagingRating: 3, comment: 'A few were overripe on arrival.',           createdAt: new Date(Date.now() - 172800000).toISOString(), isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Shalini De Silva' } }, order: { orderNumber: 'FR-1018' } },
    { id: 'r7', rating: 5, deliveryRating: 5, productQualityRating: 5, packagingRating: 4, comment: 'Perfect bananas every time!',               createdAt: new Date(Date.now() - 345600000).toISOString(), isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Rohan Mendis'    } }, order: { orderNumber: 'FR-1015' } },
  ],
  'prod-3': [
    { id: 'r8', rating: 5, deliveryRating: 5, productQualityRating: 5, packagingRating: 5, comment: 'Absolutely fresh and crisp. Love it!',       createdAt: new Date().toISOString(),                       isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Ayesha Rizvi' } }, order: { orderNumber: 'FR-1050' } },
    { id: 'r9', rating: 5, deliveryRating: 5, productQualityRating: 5, packagingRating: 4, comment: "Best kale I've had. Super green and fresh.", createdAt: new Date(Date.now() - 86400000).toISOString(),  isVerifiedPurchase: true, isFlagged: false, buyer: { user: { name: 'Priya Nair'   } }, order: { orderNumber: 'FR-1048' } },
  ],
}

// ─── Shared sub-components ────────────────────────────────────────────────────

// Renders filled and empty stars; size='lg' is used for the large summary score
const Stars = ({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) => (
  <span className={`${size === 'lg' ? 'text-2xl' : 'text-sm'} text-emerald-400`}>
    {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
  </span>
)

// Returns a human-readable relative time label for a given ISO date string
const timeAgo = (dateStr: string) => {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

// Renders a labelled horizontal progress bar for a single rating dimension
const StatBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-emerald-400 font-semibold">{value.toFixed(1)}</span>
    </div>
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-supply-teal transition-all" style={{ width: `${(value / 5) * 100}%` }} />
    </div>
  </div>
)

// ─── Page component ───────────────────────────────────────────────────────────

const SellerRatingsPage = (): JSX.Element => {
  const { showToast } = useToast()
  const [view, setView]                       = useState<View>('products')
  const [products, setProducts]               = useState<ProductSummary[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null)
  const [productStats, setProductStats]       = useState<ProductStats | null>(null)
  const [reviews, setReviews]                 = useState<IndividualRating[]>([])
  const [loading, setLoading]                 = useState(true)
  const [reviewsLoading, setReviewsLoading]   = useState(false)
  // Star value used to filter the individual reviews list; null means show all
  const [filter, setFilter]                   = useState<number | null>(null)

  // Loads the product list on mount — replace setTimeout with a real API call
  useEffect(() => {
    setTimeout(() => { setProducts(DUMMY_PRODUCTS); setLoading(false) }, 500)
  }, [])

  // Navigates to the detail view and loads stats + reviews for the selected product in one go
  const handleProductClick = (product: ProductSummary) => {
    setSelectedProduct(product)
    setView('detail')
    setReviewsLoading(true)
    setFilter(null)
    // Replace with: fetch(`/api/v1/rating/product/${product.id}`)
    setTimeout(() => {
      setProductStats(DUMMY_STATS[product.id] ?? null)
      setReviews(DUMMY_REVIEWS[product.id] ?? [])
      setReviewsLoading(false)
    }, 400)
  }

  // Flags a review as inappropriate and sends it to the admin review queue
  const handleFlag = (id: string) => {
    // Replace with: fetch(`/api/v1/rating/${id}/flag`, { method: 'POST' })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isFlagged: true } : r))
    showToast('Review flagged for admin review')
  }

  // Applies the active star filter to the reviews list; null shows all
  const filteredReviews = filter ? reviews.filter(r => r.rating === filter) : reviews

  // Computes the store-wide average rating across all products that have been rated
  const ratedProducts     = products.filter(p => p.totalRatings > 0)
  const storeAverage      = ratedProducts.length
    ? ratedProducts.reduce((sum, p) => sum + p.averageRating, 0) / ratedProducts.length
    : 0
  const totalStoreRatings = products.reduce((sum, p) => sum + p.totalRatings, 0)

  // ── PRODUCTS LIST VIEW ────────────────────────────────────────────────────
  if (view === 'products') return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">Feedback</p>
        <h2 className="mt-0.5 text-2xl font-semibold text-slate-50">Ratings & Reviews</h2>
        <p className="mt-1 text-sm text-slate-400">See what customers are saying about your products</p>
      </div>

      {/* Store-wide average rating summary card */}
      {totalStoreRatings > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal mb-3">Store Overview</p>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-50">{storeAverage.toFixed(1)}</p>
              <Stars value={storeAverage} size="lg" />
              <p className="text-xs text-slate-400 mt-1">Store average</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 text-center min-w-[200px]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-2xl font-bold text-slate-50">{totalStoreRatings}</p>
                <p className="text-xs text-slate-400">Total reviews</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-2xl font-bold text-slate-50">{ratedProducts.length}</p>
                <p className="text-xs text-slate-400">Products rated</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        // Product cards grid — each card shows the product's average rating and review count
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <button key={product.id} onClick={() => handleProductClick(product)}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left hover:bg-white/10 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover rounded-xl" />
                    : '🛒'
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate group-hover:text-emerald-300 transition-colors">{product.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                </div>
                <svg className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {product.totalRatings === 0 ? (
                <p className="mt-4 text-xs text-slate-500">No reviews yet</p>
              ) : (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-50">{product.averageRating.toFixed(1)}</span>
                  <div>
                    <Stars value={product.averageRating} />
                    <p className="text-xs text-slate-400 mt-0.5">{product.totalRatings} review{product.totalRatings !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // ── DETAIL VIEW — stats card + all reviews on the same page ──────────────
  if (view === 'detail' && selectedProduct) return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">

      {/* Back navigation */}
      <button onClick={() => { setView('products'); setSelectedProduct(null); setProductStats(null) }}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to products
      </button>

      {/* Product header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-xl">
          {selectedProduct.imageUrl
            ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover rounded-xl" />
            : '🛒'
          }
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-supply-teal">{selectedProduct.category}</p>
          <h2 className="text-2xl font-semibold text-slate-50">{selectedProduct.name}</h2>
        </div>
      </div>

      {reviewsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : !productStats || productStats.total === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-3xl mb-3">⭐</p>
          <p className="text-slate-300 font-medium">No reviews yet for this product</p>
        </div>
      ) : (
        <>
          {/* Rating stats card: large score, distribution bars, and dimension averages */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

              {/* Large overall score with star display */}
              <div className="text-center sm:border-r sm:border-white/10 sm:pr-6 sm:min-w-[120px]">
                <p className="text-5xl font-bold text-slate-50">{productStats.averages.overall.toFixed(1)}</p>
                <Stars value={productStats.averages.overall} size="lg" />
                <p className="text-xs text-slate-400 mt-1">{productStats.total} review{productStats.total !== 1 ? 's' : ''}</p>
              </div>

              {/* Star distribution bars — 5★ down to 1★ */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(s => (
                  <div key={s} className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 w-3 text-right">{s}</span>
                    <span className="text-emerald-400 text-[10px]">★</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${((productStats.distribution[s] || 0) / productStats.total) * 100}%` }} />
                    </div>
                    <span className="text-slate-400 w-4 text-right">{productStats.distribution[s] || 0}</span>
                  </div>
                ))}
              </div>

              {/* Per-dimension average bars: delivery, quality, packaging */}
              <div className="space-y-3 sm:border-l sm:border-white/10 sm:pl-6 sm:min-w-[180px]">
                <StatBar label="Delivery Speed"  value={productStats.averages.delivery} />
                <StatBar label="Product Quality" value={productStats.averages.quality} />
                <StatBar label="Packaging"       value={productStats.averages.packaging} />
              </div>
            </div>
          </div>

          {/* ── Individual reviews rendered directly below — no extra click needed ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-200">
                {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
              </p>
              {/* Star filter pills — clicking a star value filters the list to that rating only */}
              <div className="flex gap-2 flex-wrap justify-end">
                <button onClick={() => setFilter(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!filter ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
                  All
                </button>
                {[5, 4, 3, 2, 1].map(s => (
                  <button key={s} onClick={() => setFilter(filter === s ? null : s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
                    {'★'.repeat(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual review cards */}
            <div className="space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400 text-sm">
                  No reviews for this rating
                </div>
              ) : filteredReviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">

                  {/* Reviewer identity, star rating, badges, and flag button */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Buyer avatar — first letter of their name */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400 shrink-0">
                        {r.buyer?.user?.name?.charAt(0).toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-200">{r.buyer?.user?.name ?? 'Anonymous'}</span>
                          {/* Verified purchase badge — confirms the reviewer bought this product */}
                          {r.isVerifiedPurchase && (
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              ✓ Verified Purchase
                            </span>
                          )}
                          {r.order && <span className="text-[10px] text-slate-500">{r.order.orderNumber}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Stars value={r.rating} />
                          <span className="text-xs text-slate-500">{timeAgo(r.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Flag button — toggles to a "Flagged" label once clicked; sends to admin queue */}
                    {!r.isFlagged
                      ? <button onClick={() => handleFlag(r.id)} className="text-[10px] text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 border border-white/10 rounded-full px-2 py-0.5">⚑ Flag</button>
                      : <span className="text-[10px] text-orange-400 flex-shrink-0">⚑ Flagged</span>
                    }
                  </div>

                  {/* Sub-rating stars for delivery, quality, and packaging */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                    {r.deliveryRating       != null && <span>Delivery: <Stars value={r.deliveryRating} /></span>}
                    {r.productQualityRating != null && <span>Quality: <Stars value={r.productQualityRating} /></span>}
                    {r.packagingRating      != null && <span>Packaging: <Stars value={r.packagingRating} /></span>}
                  </div>

                  {/* Written comment — only rendered when the reviewer left one */}
                  {r.comment && (
                    <p className="text-sm text-slate-300 border-t border-white/10 pt-2 leading-relaxed">"{r.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )

  return <></>
}

export default SellerRatingsPage