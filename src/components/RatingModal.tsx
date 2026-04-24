import { useState } from 'react'
import type { JSX } from 'react'
import { useToast } from '../context/ToastContext'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  driverId: string
  buyerId: string
  sellerName?: string
}

const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
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

const RatingModal = ({ isOpen, onClose, orderId, driverId, buyerId, sellerName }: RatingModalProps): JSX.Element | null => {
  const { showToast } = useToast()
  const [ratings, setRatings] = useState({ overall: 0, delivery: 0, quality: 0, packaging: 0 })
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (ratings.overall === 0) { showToast('Please give an overall rating', 'error'); return }
    if (ratings.delivery === 0) { showToast('Please rate delivery speed', 'error'); return }
    if (ratings.quality === 0) { showToast('Please rate product quality', 'error'); return }

    setLoading(true)
    try {
      const token = localStorage.getItem('fr_token')
      const res = await fetch('http://localhost:5000/api/v1/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, driverId, buyerId, ratings, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      showToast('Rating submitted successfully! ⭐')
      onClose()
    } catch (err: any) {
      showToast(err.message ?? 'Failed to submit rating', 'error')
    } finally {
      setLoading(false)
    }
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
            How was your order{sellerName ? ` from ${sellerName}` : ''}?
          </p>
        </div>

        {/* Star ratings */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 mb-4">
          <StarRating value={ratings.overall} onChange={(v) => setRatings(r => ({ ...r, overall: v }))} label="Overall experience" />
          <div className="border-t border-white/10" />
          <StarRating value={ratings.delivery} onChange={(v) => setRatings(r => ({ ...r, delivery: v }))} label="Delivery speed" />
          <div className="border-t border-white/10" />
          <StarRating value={ratings.quality} onChange={(v) => setRatings(r => ({ ...r, quality: v }))} label="Product quality" />
          <div className="border-t border-white/10" />
          <StarRating value={ratings.packaging} onChange={(v) => setRatings(r => ({ ...r, packaging: v }))} label="Packaging" />
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Comments (optional)</label>
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
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-xl py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

export default RatingModal