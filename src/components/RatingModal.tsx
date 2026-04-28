import { useState } from 'react'
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
  products: Product[]        // ← list of products in the order
  sellerName?: string
}

const StarRating = ({ value, onChange, label }: {
  value: number
  onChange: (v: number) => void
  label: string
}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-300">{label}</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`text-xl transition-all ${s <= value ? 'text-emerald-400' : 'text-slate-600'} hover:text-emerald-300`}
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

  // track which product we're currently rating (step through each one)
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const [ratings, setRatings] = useState({
    overall: 0, delivery: 0, quality: 0, packaging: 0,
  })
  const [comment, setComment] = useState('')

  if (!isOpen) return null

  const currentProduct = products[step]
  const isLastProduct  = step === products.length - 1
  const token          = localStorage.getItem('fr_token')

  const resetForm = () => {
    setRatings({ overall: 0, delivery: 0, quality: 0, packaging: 0 })
    setComment('')
  }

  const handleSubmit = async () => {
    if (ratings.overall === 0)  { showToast('Please give an overall rating', 'error'); return }
    if (ratings.delivery === 0) { showToast('Please rate delivery speed', 'error'); return }
    if (ratings.quality === 0)  { showToast('Please rate product quality', 'error'); return }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/rating`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          orderId,
          productId: currentProduct.id,
          sellerId:  currentProduct.sellerId,
          driverId,
          buyerId,
          ratings,
          comment,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      if (isLastProduct) {
        // all products rated
        setDone(true)
        showToast('Thanks for your reviews! ⭐')
      } else {
        // move to next product
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

  const handleSkip = () => {
    if (isLastProduct) {
      onClose()
    } else {
      setStep(s => s + 1)
      resetForm()
    }
  }

  // success state
  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl mx-4 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-3xl">
            ⭐
          </div>
          <h2 className="text-lg font-semibold text-slate-50">Thanks for your feedback!</h2>
          <p className="text-sm text-slate-400">Your reviews help other buyers make better choices.</p>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl mx-4">

        {/* Header */}
        <div className="mb-5 text-center">
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-medium text-emerald-400">
            Order Delivered ✓
          </span>
          <h2 className="mt-3 text-lg font-semibold text-slate-50">Rate your experience</h2>
          <p className="mt-1 text-xs text-slate-400">
            {sellerName ? `from ${sellerName}` : ''}
          </p>
        </div>

        {/* Product progress indicator (if multiple products) */}
        {products.length > 1 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">
                Product {step + 1} of {products.length}
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {currentProduct.name}
              </span>
            </div>
            <div className="flex gap-1">
              {products.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i < step
                      ? 'bg-emerald-500'
                      : i === step
                      ? 'bg-emerald-400'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Product name badge (single product) */}
        {products.length === 1 && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
            <p className="text-xs text-slate-400">Rating for</p>
            <p className="text-sm font-semibold text-slate-100">{currentProduct.name}</p>
          </div>
        )}

        {/* Star ratings */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 mb-4">
          <StarRating
            value={ratings.overall}
            onChange={(v) => setRatings(r => ({ ...r, overall: v }))}
            label="Overall experience"
          />
          <div className="border-t border-white/10" />
          <StarRating
            value={ratings.delivery}
            onChange={(v) => setRatings(r => ({ ...r, delivery: v }))}
            label="Delivery speed"
          />
          <div className="border-t border-white/10" />
          <StarRating
            value={ratings.quality}
            onChange={(v) => setRatings(r => ({ ...r, quality: v }))}
            label="Product quality"
          />
          <div className="border-t border-white/10" />
          <StarRating
            value={ratings.packaging}
            onChange={(v) => setRatings(r => ({ ...r, packaging: v }))}
            label="Packaging"
          />
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
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

        {/* Buttons */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-supply-teal py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 mb-2"
        >
          {loading
            ? 'Submitting...'
            : isLastProduct
            ? 'Submit Review'
            : `Rate & Continue →`
          }
        </button>
        <button
          onClick={handleSkip}
          className="w-full rounded-xl py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          {isLastProduct ? 'Skip for now' : 'Skip this product'}
        </button>
      </div>
    </div>
  )
}

export default RatingModal