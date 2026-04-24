import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { addItem } from '../../store/slices/cartSlice.ts'

type RootState = any

interface SellerOption {
  id: string
  name: string
  rating: number
  deliveriesPerWeek: number
  priceMultiplier: number
  etaLabel: string
}

interface Review {
  id: string
  buyerName: string
  rating: number
  comment: string
  date: string
  isVerifiedPurchase: boolean
}

const SELLER_OPTIONS: SellerOption[] = [
  {
    id: 'seller-fresh-farms',
    name: 'Fresh Farms Co.',
    rating: 4.8,
    deliveriesPerWeek: 6,
    priceMultiplier: 1,
    etaLabel: 'Same day delivery',
  },
  {
    id: 'seller-green-valley',
    name: 'Green Valley Traders',
    rating: 4.5,
    deliveriesPerWeek: 5,
    priceMultiplier: 0.96,
    etaLabel: 'Within 24 hours',
  },
  {
    id: 'seller-city-market',
    name: 'City Market Hub',
    rating: 4.2,
    deliveriesPerWeek: 7,
    priceMultiplier: 1.04,
    etaLabel: 'Express delivery',
  },
]

// Mock reviews per seller — replace with real API call later
const SELLER_REVIEWS: Record<string, Review[]> = {
  'seller-fresh-farms': [
    { id: '1', buyerName: 'Aysha D.', rating: 5, comment: 'Super fresh produce, arrived on time!', date: 'Apr 18, 2026', isVerifiedPurchase: true },
    { id: '2', buyerName: 'Isuru P.', rating: 5, comment: 'Best quality apples I have ever ordered. Will order again!', date: 'Apr 15, 2026', isVerifiedPurchase: true },
    { id: '3', buyerName: 'Nimali S.', rating: 4, comment: 'Good quality but delivery was slightly late.', date: 'Apr 10, 2026', isVerifiedPurchase: true },
  ],
  'seller-green-valley': [
    { id: '4', buyerName: 'Kasun R.', rating: 5, comment: 'Great prices and fresh vegetables!', date: 'Apr 17, 2026', isVerifiedPurchase: true },
    { id: '5', buyerName: 'Dilini W.', rating: 4, comment: 'Packaging was good, produce was fresh.', date: 'Apr 12, 2026', isVerifiedPurchase: true },
    { id: '6', buyerName: 'Tharindu M.', rating: 4, comment: 'Reliable seller, good communication.', date: 'Apr 8, 2026', isVerifiedPurchase: false },
  ],
  'seller-city-market': [
    { id: '7', buyerName: 'Sanduni K.', rating: 4, comment: 'Express delivery was great, produce was decent.', date: 'Apr 16, 2026', isVerifiedPurchase: true },
    { id: '8', buyerName: 'Roshan F.', rating: 4, comment: 'Good overall experience.', date: 'Apr 11, 2026', isVerifiedPurchase: true },
    { id: '9', buyerName: 'Malini B.', rating: 5, comment: 'Always fresh and well packed!', date: 'Apr 6, 2026', isVerifiedPurchase: true },
  ],
}

const getImageForProduct = (product: any) => {
  if (product.imageUrl) return product.imageUrl
  switch (product.category) {
    case 'Fruits': return 'https://images.unsplash.com/photo-1576179635662-9d1983e97f5d?auto=format&fit=crop&w=600&q=80'
    case 'Vegetables': return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
    case 'Dairy': return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    case 'Bakery': return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkFWFlHyoiKpLLWXJpQcH2pcR0iBFmjTCMQ&s'
    default: return 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80'
  }
}

// ---- Reviews Modal ----
const ReviewsModal = ({ seller, onClose }: { seller: SellerOption; onClose: () => void }) => {
  const reviews = SELLER_REVIEWS[seller.id] ?? []
  const [filterStar, setFilterStar] = useState<number | null>(null)

  const filtered = filterStar ? reviews.filter((r) => r.rating === filterStar) : reviews
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">{seller.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">{avgRating.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-sm ${s <= Math.round(avgRating) ? 'text-emerald-400' : 'text-slate-600'}`}>★</span>
                ))}
              </div>
              <span className="text-xs text-slate-400">{reviews.length} reviews</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        {/* Rating distribution */}
        <div className="space-y-1.5 mb-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-slate-400">{star}★</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                />
              </div>
              <span className="w-4 text-slate-400 text-right">{count}</span>
            </div>
          ))}
        </div>

        {/* Filter by star */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterStar(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${filterStar === null ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10 text-slate-400 hover:border-emerald-500/40'}`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStar(filterStar === s ? null : s)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${filterStar === s ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10 text-slate-400 hover:border-emerald-500/40'}`}
            >
              {s}★
            </button>
          ))}
        </div>

        {/* Reviews list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No reviews for this rating.</p>
          ) : (
            filtered.map((review) => (
              <div key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-400">
                      {review.buyerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-slate-200">{review.buyerName}</p>
                        {review.isVerifiedPurchase && (
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-[10px] ${s <= review.rating ? 'text-emerald-400' : 'text-slate-600'}`}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{review.date}</span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const SelectSellerPage = () => {
  const { id: productId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const product = useSelector((state: RootState) =>
    state.sellerProducts?.products?.find((p: any) => p.id === productId)
  )

  const [selectedSellerId, setSelectedSellerId] = useState(SELLER_OPTIONS[0]?.id)
  const [quantity, setQuantity] = useState<number>(1)
  const [requirements, setRequirements] = useState<string>('')
  const [reviewsSeller, setReviewsSeller] = useState<SellerOption | null>(null)

  const selectedSeller = useMemo(
    () => SELLER_OPTIONS.find((s) => s.id === selectedSellerId) ?? SELLER_OPTIONS[0],
    [selectedSellerId]
  )

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">Product not found</h1>
        <p className="text-sm text-slate-300">
          We couldn&apos;t find this product. Please go back to the product list and try again.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Go back
        </button>
      </div>
    )
  }

  const basePrice = Number(product.pricePerUnit) || 0
  const productImage = getImageForProduct(product)

  const handleAddToCart = () => {
    if (!selectedSeller) return
    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1
    const priceForSeller = Math.round(basePrice * selectedSeller.priceMultiplier)
    const compositeId = `${product.id}-${selectedSeller.id}`
    dispatch(
      addItem({
        id: compositeId,
        name: product.name,
        vendor: selectedSeller.name,
        price: `Rs. ${priceForSeller}`,
        unit: product.unit,
        quantity: safeQuantity,
        requirements: requirements.trim() || undefined,
      })
    )
    navigate('/buyer/cart')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Reviews Modal */}
      {reviewsSeller && (
        <ReviewsModal seller={reviewsSeller} onClose={() => setReviewsSeller(null)} />
      )}

      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">Select seller</p>
          <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Choose a seller for {product.name}</h1>
          <p className="mt-1 text-xs text-slate-300">
            Compare seller ratings, delivery speed and prices. Then add the product to your cart with your required quantity and any special notes.
          </p>
        </div>
        <Link
          to="/buyer/products"
          className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-supply-paper hover:bg-white/10"
        >
          Back to products
        </Link>
      </header>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-supply-paper backdrop-blur-xl md:grid-cols-[120px,minmax(0,1fr)]">
        <div className="h-24 w-full overflow-hidden rounded-xl bg-white/5 md:h-28">
          <img src={productImage} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-supply-paper">{product.name}</p>
            <p className="mt-0.5 text-[11px] text-slate-300">
              Category: <span className="font-medium">{product.category || 'General'}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-300">
              Base price:{' '}
              <span className="font-semibold text-supply-paper">
                Rs. {basePrice} <span className="font-normal">/ {product.unit}</span>
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-supply-teal/40 bg-supply-teal/10 px-3 py-2 text-[11px] text-supply-paper md:text-right">
            <p className="font-semibold">How this works</p>
            <p className="mt-0.5 text-[11px] text-slate-200">
              1. Pick your preferred seller.<br />
              2. Set quantity and notes.<br />
              3. Add to cart.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <p className="text-xs font-semibold text-supply-paper">Available sellers</p>
          <div className="mt-2 space-y-2">
            {SELLER_OPTIONS.map((seller) => {
              const sellerPrice = Math.round(basePrice * seller.priceMultiplier)
              return (
                <div key={seller.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSellerId(seller.id)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs transition ${
                      selectedSellerId === seller.id
                        ? 'border border-supply-teal bg-supply-teal/20 text-supply-paper'
                        : 'border border-white/10 bg-slate-950/40 text-slate-200 hover:border-supply-teal/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{seller.name}</p>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          {seller.rating.toFixed(1)}★ · {seller.deliveriesPerWeek}+ deliveries/week
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-supply-paper">
                          Rs. {sellerPrice}{' '}
                          <span className="font-normal text-slate-300">/ {product.unit}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-supply-peach">{seller.etaLabel}</p>
                      </div>
                    </div>
                  </button>
                  {/* See reviews link */}
                  <button
                    type="button"
                    onClick={() => setReviewsSeller(seller)}
                    className="ml-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    See {SELLER_REVIEWS[seller.id]?.length ?? 0} reviews →
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-supply-teal/40 bg-supply-deep/80 p-4 text-xs text-supply-paper">
          <p className="text-xs font-semibold text-supply-paper">Your requirements</p>
          <div className="mt-2 space-y-3">
            <div>
              <label className="text-[11px] text-slate-200">Quantity ({product.unit})</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 w-32 rounded-xl border border-white/15 bg-slate-950/60 px-3 py-1.5 text-xs text-supply-paper outline-none focus:border-supply-teal focus:ring-1 focus:ring-supply-teal"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-200">Special instructions (optional)</label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="E.g. medium-sized fruits, nicely packed, arrive before 6 PM..."
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-xs text-supply-paper outline-none placeholder:text-slate-400 focus:border-supply-teal focus:ring-1 focus:ring-supply-teal"
              />
            </div>
            {selectedSeller && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-50">
                <p className="font-semibold">
                  Selected seller: <span className="font-normal">{selectedSeller.name}</span>
                </p>
                <p className="mt-0.5">
                  {selectedSeller.rating.toFixed(1)}★ · {selectedSeller.etaLabel}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-dark"
            >
              Add to cart from {selectedSeller?.name ?? 'selected seller'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SelectSellerPage