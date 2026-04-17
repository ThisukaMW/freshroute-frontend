import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { getCart, removeItemFromCart, clearCart as clearCartApi, updateCartItemQuantity } from "../../api/endpoints/cart"
import { setCartItems, removeItemLocal, updateQuantityLocal, clearCart } from "../../store/slices/cartSlice"
import { LocalStorageService } from "../../services/storage/LocalStorageService"

type RootState = any

const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Get items from Redux
  const reduxCart = useSelector((state: RootState) => state.cart)
  const items = reduxCart?.items || []

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [total, setTotal] = useState(0)

  // TEMPORARY: Inject test token from Postman
  useEffect(() => {
    LocalStorageService.set('fr_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYWU3ZjIzYy02NDEwLTRiZjMtYWVkYy0yNWM1MmMwMjAzYWYiLCJidXllcklkIjoiNmM4OWQ5YjEtNTk1Yy00ZjkzLTk3NjUtMzE0OTk3ZDgzZTY5Iiwicm9sZSI6IkJVWUVSIiwiaWF0IjoxNzc1OTgzODY0LCJleHAiOjE3NzY1ODg2NjR9.hF7nIf_iBwe1kMtkg5pzG2EJGv1jNwxgtMyr-61efhU')
  }, [])

  // Sync Redux with DB on component mount
  useEffect(() => {
    syncCartFromDB()
  }, [])

  // Refetch from DB when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Page visible - syncing cart')
        syncCartFromDB()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const syncCartFromDB = async () => {
    try {
      setLoading(true)
      setError(null)
      const cartData = await getCart()
      // Update Redux with DB data
      dispatch(setCartItems(cartData.items || []))
      setSubtotal(cartData.subtotal || 0)
      setTax(cartData.tax || 0)
      setDiscount(cartData.discount || 0)
      setTotal(cartData.total || 0)
      console.log('✅ Cart synced with DB')
    } catch (err: any) {
      console.error('❌ Error syncing cart:', err.message)
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals whenever items change
  useEffect(() => {
    const newSubtotal = items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0) * item.quantity, 0)
    const newTax = newSubtotal * 0.1
    const newTotal = newSubtotal + newTax - discount
    setSubtotal(newSubtotal)
    setTax(newTax)
    setTotal(newTotal)
  }, [items, discount])

  const handleRemoveItem = async (productId: string) => {
    // 1️⃣ Remove from Redux immediately
    dispatch(removeItemLocal(productId))
    
    // 2️⃣ Also remove from DB
    try {
      await removeItemFromCart(productId)
      console.log('✅ Item removed from cart and DB')
    } catch (err: any) {
      console.error('❌ Error removing item from DB:', err.message)
      setError('Failed to remove item')
    }
  }

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(productId)
      return
    }

    // 1️⃣ Update Redux immediately
    dispatch(updateQuantityLocal({ productId, quantity: newQuantity }))
    
    // 2️⃣ Also update in DB
    try {
      await updateCartItemQuantity(productId, newQuantity)
      console.log('✅ Quantity updated')
    } catch (err: any) {
      console.error('❌ Error updating quantity:', err.message)
      setError('Failed to update item quantity')
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCartApi()
      dispatch(clearCart())
      console.log('✅ Cart cleared')
    } catch (err: any) {
      console.error('❌ Error clearing cart:', err.message)
      setError('Failed to clear cart')
    }
  }

  const handleProceed = () => {
    if (!items.length) return
    navigate('/buyer/checkout')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-300">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Your cart</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-300">Your cart is empty.</p>
          <p className="text-xs text-slate-400 mt-2">
            Browse products to add items.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-slate-950/40 px-3 py-3 text-sm text-slate-100"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    {item.category} · ${item.price} / {item.unit}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2  bg-slate-700 rounded px-2 py-1 mr-3">
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                    className="text-primary hover:text-primary-light text-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.productId, Number(e.target.value))}
                    className="w-8 bg-transparent text-center text-slate-50 text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                    className="text-primary hover:text-primary-light text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right mr-3">
                  <p className="font-semibold text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.productId)}
                  className="text-xs text-red-300 hover:text-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl text-sm text-slate-100">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {discount && discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span>-${(discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-2 flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleProceed}
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition"
            >
              Proceed to Payment
            </button>

            <button
              type="button"
              onClick={handleClearCart}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 transition"
            >
              Clear Cart
            </button>
          </div>

          {/* Continue Shopping */}
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="text-xs text-slate-400 hover:text-slate-200 w-full py-2"
          >
            Continue shopping
          </button>
        </>
      )}
    </div>
  )
}

export default CartPage
