/*import React, { useState } from 'react'
import type { JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RatingCategory {
  id: string
  label: string
  description: string
  rating: number
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const RateOrderPage = (): JSX.Element => {
  const navigate = useNavigate()
  const { orderId, productId } = useParams<{ orderId: string; productId: string }>()

  const [categories, setCategories] = useState<RatingCategory[]>([
    { id: 'overall',   label: 'Overall Experience', description: 'How was your experience overall?', rating: 0 },
    { id: 'quality',   label: 'Product Quality',    description: 'Was the product as described?',    rating: 0 },
    { id: 'delivery',  label: 'Delivery Speed',     description: 'Did it arrive on time?',           rating: 0 },
    { id: 'packaging', label: 'Packaging',          description: 'Was it packed well?',              rating: 0 },
  ])
  const [hoveredStar, setHoveredStar] = useState<{ id: string; star: number } | null>(null)
  const [review, setReview]           = useState('')
  const [submitted, setSubmitted]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const handleStarClick = (categoryId: string, rating: number) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, rating } : c))
  }

  const overall = categories.find(c => c.id === 'overall')?.rating ?? 0

  const ratingLabel = (val: number) => {
    if (val === 5) return 'Excellent'
    if (val === 4) return 'Very Good'
    if (val === 3) return 'Good'
    if (val === 2) return 'Fair'
    if (val === 1) return 'Poor'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (overall === 0) { setError('Please give at least an overall rating.'); return }
    if (!orderId || !productId) { setError('Missing order or product info. Please go back and try again.'); return }

    setLoading(true)
    try {
      const token = localStorage.getItem('fr_token')
      const quality   = categories.find(c => c.id === 'quality')?.rating   ?? 0
      const delivery  = categories.find(c => c.id === 'delivery')?.rating  ?? 0
      const packaging = categories.find(c => c.id === 'packaging')?.rating ?? 0

      const res = await fetch('/api/v1/ratings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          orderId,
          productId,
          rating:               overall,
          productQualityRating: quality   || undefined,
          deliveryRating:       delivery  || undefined,
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
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Thank-you screen ───────────────────────────────────────────────────────
  if (submitted) return (
    <div className="flex flex-col items-center justify-center space-y-5 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
        <span className="text-4xl text-emerald-400">✓</span>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-supply-paper">Thanks for your feedback!</h2>
        <p className="mt-2 text-sm text-slate-400">Your review helps other buyers make better choices.</p>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => navigate('/buyer/orders')}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
        >
          Back to Orders
        </button>
        <button
          onClick={() => navigate('/buyer/reviews')}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
        >
          View My Reviews
        </button>
      </div>
    </div>
  )

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-xl space-y-6 py-6 text-slate-100">

      {/* Header */
      /*<header className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">Feedback</p>
        <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Rate your order</h1>
        <p className="mt-1 text-sm text-slate-300">
          Share your experience to help other buyers and vendors improve.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Star rating cards */
       /* <div className="space-y-3">
          {categories.map(cat => {
            const activeVal = hoveredStar?.id === cat.id ? hoveredStar.star : cat.rating
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition-colors hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-supply-paper">{cat.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(cat.id, star)}
                          onMouseEnter={() => setHoveredStar({ id: cat.id, star })}
                          onMouseLeave={() => setHoveredStar(null)}
                          className={`text-2xl transition-all duration-75 ${
                            star <= activeVal ? 'text-amber-400 scale-110' : 'text-slate-600'
                          } hover:scale-125`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {cat.rating > 0 && (
                      <span className="text-[10px] text-amber-400 font-medium">
                        {ratingLabel(cat.rating)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Written review */
        /*<div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 space-y-2">
          <label className="block text-sm font-semibold text-supply-paper">
            Written review
            <span className="ml-2 text-[10px] font-normal text-slate-500 normal-case">optional</span>
          </label>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-colors"
            placeholder="Tell us about your experience..."
          />
          <p className="text-right text-[10px] text-slate-600">{review.length}/500</p>
        </div>

        {/* Error */
       /* {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-xs text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Progress indicator */
       /* <div className="flex gap-1.5">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                cat.rating > 0 ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-slate-500 text-center">
          {categories.filter(c => c.rating > 0).length} of {categories.length} rated
          {categories.filter(c => c.rating > 0).length < categories.length && ' — only overall is required'}
        </p>

        {/* Submit */
       /* <button
          type="submit"
          disabled={loading || overall === 0}
          className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              Submitting...
            </span>
          ) : 'Submit Review'}
        </button>

      </form>
    </div>
  )
}

export default RateOrderPage*/