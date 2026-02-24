import React, { useState } from 'react'
import type { JSX } from 'react'
import { useNavigate } from 'react-router-dom'

interface RatingCategory {
  id: string
  label: string
  rating: number
}

const RateOrderPage = (): JSX.Element => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<RatingCategory[]>([
    { id: 'overall', label: 'Overall Experience', rating: 0 },
    { id: 'quality', label: 'Product Quality', rating: 0 },
    { id: 'delivery', label: 'Delivery Speed', rating: 0 },
    { id: 'packaging', label: 'Packaging', rating: 0 },
  ])
  const [review, setReview] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)

  const handleStarClick = (categoryId: string, rating: number): void => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, rating } : cat))
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-50">Thanks for your feedback!</h2>
        <p className="text-sm text-slate-400">Your review helps other buyers make better choices.</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Rate your order</h1>
        <p className="mt-1 text-sm text-slate-400">
          Share your experience to help other buyers and vendors improve.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star ratings */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-5">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between">
              <p className="text-sm text-slate-200">{cat.label}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(cat.id, star)}
                    className={`text-2xl transition-colors ${
                      star <= cat.rating ? 'text-yellow-400' : 'text-slate-600'
                    } hover:text-yellow-300`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Written review */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-200">
            Written review (optional)
          </label>
          <textarea
            value={review}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
            placeholder="Tell us about your experience..."
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Submit Review
        </button>
      </form>
    </div>
  )
}

export default RateOrderPage