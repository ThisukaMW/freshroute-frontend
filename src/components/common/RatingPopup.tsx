import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { JSX } from 'react'

interface RatingCategory {
  id: string
  label: string
  rating: number
}

interface RatingPopupProps {
  sellerName: string
  orderId: string
  itemCount: number
  onSubmit: (ratings: RatingCategory[], comment: string) => void
  onSkip: () => void
}

const RatingPopup = ({
  sellerName,
  orderId,
  itemCount,
  onSubmit,
  onSkip,
}: RatingPopupProps): JSX.Element => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<RatingCategory[]>([
    { id: 'overall', label: 'Overall Experience', rating: 0 },
    { id: 'quality', label: 'Product Quality', rating: 0 },
    { id: 'delivery', label: 'Delivery Speed', rating: 0 },
    { id: 'packaging', label: 'Packaging', rating: 0 },
  ])
  const [comment, setComment] = useState<string>('')
  const [hoveredStar, setHoveredStar] = useState<{ id: string; star: number } | null>(null)

  const handleSkip = (): void => {
    onSkip()
    navigate('/products')
  }

  const handleStarClick = (categoryId: string, rating: number): void => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, rating } : cat))
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    onSubmit(categories, comment)
  }

  const getStarFilled = (categoryId: string, star: number): boolean => {
    if (hoveredStar?.id === categoryId) return star <= hoveredStar.star
    const cat = categories.find((c) => c.id === categoryId)
    return star <= (cat?.rating ?? 0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
        
        {/* green accent top border */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-supply-teal to-emerald-400" />

        <div className="border border-white/10 bg-cyan-950 p-8">

          {/* Header */}
          <div className="mb-6 text-center">
            <span className="inline-block rounded-full border  border-supply-teal/30 bg-supply-teal/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white mb-3">
              Order Delivered ✓
            </span>
            <h2 className="text-xl font-semibold text-white">Rate your experience</h2>
            <p className="mt-1 text-sm text-slate-400">How was your order from this seller?</p>
          </div>

          {/* Seller info */}
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-supply-teal to-primary-dark text-lg font-bold text-white">
              {sellerName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{sellerName}</p>
              <span className="text-xs text-slate-500">Order #{orderId} · {itemCount} items</span>
            </div>
          </div>

          {/* Star ratings */}
          <form onSubmit={handleSubmit}>
            <div className="mb-5 divide-y divide-white/5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium text-white">{cat.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(cat.id, star)}
                        onMouseEnter={() => setHoveredStar({ id: cat.id, star })}
                        onMouseLeave={() => setHoveredStar(null)}
                        className={`text-2xl transition-colors duration-100 ${
                          getStarFilled(cat.id, star)
                            ? 'text-yellow-600'
                            : 'text-slate-600 hover:text-yellow-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Comment */}
            <div className="mb-5">
              <label className="mb-2 block text-xs font-medium text-white">
                Comments (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-supply-teal focus:ring-2 focus:ring-supply-teal/40 resize-none"
                placeholder="Tell us about your experience..."
              />
            </div>

            {/* Buttons */}
            <button
              type="submit"
              className="w-full rounded-xl bg-primary-dark px-4 py-2.5 text-sm font-semibold text-supply-paper hover:bg-primary-dark/80 mb-2"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full rounded-xl px-4 py-2 text-sm text-slate-400 hover:text-supply-ash"
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RatingPopup