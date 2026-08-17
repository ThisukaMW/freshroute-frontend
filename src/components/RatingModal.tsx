import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useToast } from '../context/ToastContext'

interface Product {
  id: string
  name: string
  sellerId: string
}

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  driverId: string
  buyerId: string
  products: Product[]
  sellerName?: string
}

// Star row — amber to match BuyerRatingsPage / SellerRatingsPage
const StarRating = ({ value, onChange, label }: {
  value: number
  onChange: (v: number) => void
  label: string
}) => (
  <div className="flex items-center justify-between py-2.5">
    <span className="text-sm text-slate-300">{label}</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="text-2xl leading-none transition-all hover:scale-110"
          style={{ color: s <= value ? '#f59e0b' : '#475569' }}
        >
          ★
        </button>
      ))}
    </div>
  </div>
)

const RatingModal = ({
  isOpen, onClose, orderId, driverId, buyerId, products, sellerName,
}: RatingModalProps): JSX.Element | null => {
  const { showToast } = useToast()

  // ── product-loop state ──────────────────────────────────────────────────
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [checkingDuplicate, setCheckingDuplicate] = useState(true)

  const [ratings, setRatings] = useState({
    overall: 0, delivery: 0, quality: 0, packaging: 0,
  })
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // ── overall flow phase: products -> driver -> done ─────────────────────
  const [phase, setPhase] = useState<'products' | 'driver' | 'done'>('products')

  // ── driver-rating state ─────────────────────────────────────────────────
  const [driverRatingValue, setDriverRatingValue] = useState(0)
  const [driverComment, setDriverComment] = useState('')
  const [driverAlreadyRated, setDriverAlreadyRated] = useState(false)
  const [checkingDriverDuplicate, setCheckingDriverDuplicate] = useState(false)

  // On open, check whether the buyer has already rated this order's products
  useEffect(() => {
    if (!isOpen) return
    setCheckingDuplicate(true)

    const token = localStorage.getItem('fr_token')
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/rating/check?orderId=${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAlreadyRated(data.alreadyRated === true)
      })
      .catch(() => {
        setAlreadyRated(false)
      })
      .finally(() => setCheckingDuplicate(false))
  }, [isOpen, orderId])

  if (!isOpen) return null

  const currentProduct = products[step]
  const isLastProduct  = step === products.length - 1
  const token          = localStorage.getItem('fr_token')

  const resetForm = () => {
    setRatings({ overall: 0, delivery: 0, quality: 0, packaging: 0 })
    setComment('')
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    setImages([])
    setImagePreviews([])
  }

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (images.length + files.length > 5) {
      showToast('You can add up to 5 photos', 'error')
      return
    }
    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setImages((prev) => [...prev, ...files])
    setImagePreviews((prev) => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const checkDriverAlreadyRated = async () => {
    setCheckingDriverDuplicate(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/rating/driver-rating/check?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setDriverAlreadyRated(data.alreadyRated === true)
    } catch {
      setDriverAlreadyRated(false)
    } finally {
      setCheckingDriverDuplicate(false)
    }
  }

  // Submits the rating for the current product, then advances to the next
  // product, or — if this was the last one — moves into the driver phase
  const handleSubmit = async () => {
    if (ratings.overall === 0)  { showToast('Please give an overall rating', 'error'); return }
    if (ratings.delivery === 0) { showToast('Please rate delivery speed', 'error'); return }
    if (ratings.quality === 0)  { showToast('Please rate product quality', 'error'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('orderId', orderId)
      formData.append('productId', currentProduct.id)
      formData.append('sellerId', currentProduct.sellerId)
      formData.append('driverId', driverId)
      formData.append('buyerId', buyerId)
      formData.append('ratings', JSON.stringify(ratings))
      formData.append('comment', comment)
      images.forEach((file) => formData.append('images', file))

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/rating`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      if (isLastProduct) {
        setPhase('driver')
        checkDriverAlreadyRated()
      } else {
        showToast(`"${currentProduct.name}" rated! Next product...`)
        setStep(s => s + 1)
        resetForm()
      }
    } catch (err: any) {
      showToast(err.message ?? 'Failed to submit rating', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Skips the current product without submitting a rating
  const handleSkip = () => {
    if (isLastProduct) {
      setPhase('driver')
      checkDriverAlreadyRated()
    } else {
      setStep(s => s + 1)
      resetForm()
    }
  }

  const handleDriverSubmit = async () => {
    if (driverRatingValue === 0) { showToast('Please rate your driver', 'error'); return }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/rating/driver-rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, driverId, rating: driverRatingValue, comment: driverComment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setPhase('done')
      showToast('Thanks for rating your driver!')
    } catch (err: any) {
      showToast(err.message ?? 'Failed to submit driver rating', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDriverSkip = () => setPhase('done')

  // Shared full-screen shell — every screen in this flow renders inside this
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-brand-background/98 via-supply-teal/30 to-supply-teal/20 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 py-6 md:py-10">
        {children}
      </div>
    </div>
  )

  // ── Loading state while checking for a duplicate product rating ─────────
  if (checkingDuplicate) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Checking order status...</p>
        </div>
      </Shell>
    )
  }

  // ── Duplicate guard — buyer already rated this order's products ─────────
  if (alreadyRated) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/30 text-3xl">
            ⚠️
          </div>
          <h2 className="text-lg font-semibold text-slate-50">Already reviewed</h2>
          <p className="max-w-sm text-sm text-slate-400">You've already submitted a rating for this order. Visit <strong>My Reviews</strong> to edit or delete it.</p>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-6 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </Shell>
    )
  }

  // ── Driver phase — one screen, shown once after all products are done ──
  if (phase === 'driver') {
    if (checkingDriverDuplicate) {
      return (
        <Shell>
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        </Shell>
      )
    }

    if (driverAlreadyRated) {
      return (
        <Shell>
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-3xl">
              ⭐
            </div>
            <h2 className="text-lg font-semibold text-slate-50">Thanks for your feedback!</h2>
            <p className="max-w-sm text-sm text-slate-400">You've already rated your driver for this order.</p>
            <button
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </Shell>
      )
    }

    return (
      <Shell>
        <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">One more thing</p>
          <h1 className="mt-2 text-2xl font-semibold text-supply-paper">How was your driver?</h1>
          <p className="mt-1 text-sm text-slate-300">
            This covers your whole delivery — not tied to any one product.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-4 flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDriverRatingValue(s)}
                className="text-4xl leading-none transition-all hover:scale-110"
                style={{ color: s <= driverRatingValue ? '#f59e0b' : '#475569' }}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Comments (optional)
          </label>
          <textarea
            value={driverComment}
            onChange={(e) => setDriverComment(e.target.value)}
            placeholder="How was the delivery experience..."
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/40 resize-none transition-all"
          />
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={handleDriverSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            onClick={handleDriverSkip}
            className="w-full rounded-xl py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </Shell>
    )
  }

  // ── Success screen — shown once products + driver are both done/skipped ─
  if (phase === 'done') {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-3xl">
            ⭐
          </div>
          <h2 className="text-lg font-semibold text-slate-50">Thanks for your feedback!</h2>
          <p className="max-w-sm text-sm text-slate-400">Your reviews help other buyers make better choices.</p>
          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </Shell>
    )
  }

  // ── Main product-rating form (phase === 'products') ─────────────────────
  return (
    <Shell>
      {/* Close button */}
      <div className="mb-2 flex justify-end">
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-xl border border-white/10 p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Header */}
      <header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6 mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">Feedback</p>
        <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Rate your order</h1>
        <p className="mt-1 text-sm text-slate-300">
          {sellerName ? `from ${sellerName}` : ''}
        </p>
        <span className="mt-3 inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-medium text-emerald-400">
          Order delivered ✓
        </span>
      </header>

      {/* Multi-product progress */}
      {products.length > 1 && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">
              Product {step + 1} of {products.length}
            </span>
            <span className="text-xs font-medium text-emerald-400">
              {currentProduct.name}
            </span>
          </div>
          <div className="flex gap-1.5">
            {products.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i < step ? 'bg-emerald-500' : i === step ? 'bg-emerald-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {products.length === 1 && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-4 mb-4 text-center">
          <p className="text-xs text-slate-400">Rating for</p>
          <p className="text-sm font-semibold text-slate-100">{currentProduct.name}</p>
        </div>
      )}

      {/* Star rating rows */}
      <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10 px-5 mb-4">
        <StarRating value={ratings.overall}   onChange={(v) => setRatings(r => ({ ...r, overall: v }))}   label="Overall experience" />
        <StarRating value={ratings.delivery}  onChange={(v) => setRatings(r => ({ ...r, delivery: v }))}  label="Delivery speed" />
        <StarRating value={ratings.quality}   onChange={(v) => setRatings(r => ({ ...r, quality: v }))}   label="Product quality" />
        <StarRating value={ratings.packaging} onChange={(v) => setRatings(r => ({ ...r, packaging: v }))} label="Packaging" />
      </div>

      {/* Comment */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-4">
        <label className="block text-xs font-medium text-slate-300 mb-2">
          Comments (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/40 resize-none transition-all"
        />
      </div>

      {/* Photo upload */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-300">
            Add photos (optional)
          </label>
          <span className="text-[11px] text-slate-500">{images.length}/5</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10">
              <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[10px] text-white hover:bg-black/90"
              >
                ✕
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <label className="flex h-16 w-16 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-white/20 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors">
              <span className="text-lg leading-none">+</span>
              <span className="text-[9px]">Add photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Submitting...' : isLastProduct ? 'Submit review' : 'Rate and continue →'}
        </button>
        <button
          onClick={handleSkip}
          className="w-full rounded-xl py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          {isLastProduct ? 'Skip for now' : 'Skip this product'}
        </button>
      </div>
    </Shell>
  )
}

export default RatingModal