import React, { useState } from 'react'
import type { JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface RatingCategory {
  id: string
  label: string
  rating: number
}

const RateOrderPage = (): JSX.Element => {
  const navigate = useNavigate()
  // grab orderId and productId from the URL
  // route should be: /buyer/rate/:orderId/:productId
  const { orderId, productId } = useParams<{ orderId: string; productId: string }>()

  const [categories, setCategories] = useState<RatingCategory[]>([
    { id: 'overall',   label: 'Overall Experience', rating: 0 },
    { id: 'quality',   label: 'Product Quality',    rating: 0 },
    { id: 'delivery',  label: 'Delivery Speed',     rating: 0 },
    { id: 'packaging', label: 'Packaging',          rating: 0 },
  ])
  const [review, setReview]       = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [loading, setLoading]     = useState<boolean>(false)
  const [error, setError]         = useState<string | null>(null)
  const [visible]                 = useState<boolean>(true)

  const handleStarClick = (categoryId: string, rating: number): void => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, rating } : cat))
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)

    const overall   = categories.find((c) => c.id === 'overall')?.rating ?? 0
    const quality   = categories.find((c) => c.id === 'quality')?.rating ?? 0
    const delivery  = categories.find((c) => c.id === 'delivery')?.rating ?? 0
    const packaging = categories.find((c) => c.id === 'packaging')?.rating ?? 0

    // must have at least an overall rating
    if (overall === 0) {
      setError('Please give at least an overall rating.')
      return
    }

    if (!orderId || !productId) {
      setError('Missing order or product info. Please go back and try again.')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('fr_token')

      const res = await fetch('/api/v1/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          productId,
          rating: overall,
          productQualityRating: quality  || undefined,
          deliveryRating:       delivery || undefined,
          packagingRating:      packaging || undefined,
          comment:              review.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to submit rating')
      }

      setSubmitted(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // thank-you screen
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-50">Thanks for your feedback!</h2>
        <p className="text-sm text-slate-400">Your review helps other buyers make better choices.</p>
        <button
          onClick={() => navigate('/buyer/orders')}
          className="mt-4 rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div
      className={`mx-auto max-w-xl space-y-6 py-6 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Rate your order</h1>
        <p className="mt-1 text-sm text-slate-400">
          Share your experience to help other buyers and vendors improve.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* error message */}
        {error && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}

export default RateOrderPage