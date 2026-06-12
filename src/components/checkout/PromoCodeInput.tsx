import React, { useState } from "react"
import { applyPromoCode } from "../../api/endpoints/cart"
import { showSuccessToast, showErrorToast } from "../../utils/toastNotification"

interface PromoCodeInputProps {
  onApply: (discount: number, code: string) => void
  appliedCode?: string
  isLoading?: boolean
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ onApply, appliedCode, isLoading = false }) => {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      setError("Please enter a promo code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await applyPromoCode(code.trim())
      
      if (result.discount > 0) {
        showSuccessToast(`✅ Promo code "${code}" applied! You saved Rs. ${result.discount.toFixed(2)}`)
        onApply(result.discount, code)
        setCode("")
      } else {
        setError("Promo code is invalid or has no discount")
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to apply promo code"
      setError(errorMsg)
      showErrorToast(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-slate-50 mb-3">Promo Code</h3>
      
      {appliedCode ? (
        <div className="flex items-center gap-2 mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-emerald-300">Code "{appliedCode}" applied successfully</span>
        </div>
      ) : null}

      {error && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      <form onSubmit={handleApplyPromo} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError("")
          }}
          disabled={loading || isLoading || !!appliedCode}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={loading || isLoading || !!appliedCode || !code.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </span>
          ) : (
            "Apply"
          )}
        </button>
      </form>

      <p className="text-xs text-slate-400 mt-3">
        Have a promo code? Enter it above to get a discount on your order.
      </p>
    </div>
  )
}

export default PromoCodeInput
