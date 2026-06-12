import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { updateQuantityAsync, removeItemAsync } from '../../store/slices/cartSlice'
import type { RootState, AppDispatch } from '../../store'

interface CartPopupProps {
  isOpen: boolean
  onClose: () => void
}

const CartPopup = ({ isOpen, onClose }: CartPopupProps) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const loading = useSelector((state: RootState) => state.cart.loading)
  const [subtotal, setSubtotal] = useState(0)

  // Calculate subtotal whenever items change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
      return sum + price * item.quantity
    }, 0)
    setSubtotal(total)
  }, [cartItems])

  const handleQuantityChange = async (productId: string, sellerId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await dispatch(removeItemAsync({ productId, sellerId }))
    } else {
      await dispatch(updateQuantityAsync({ productId, sellerId, quantity: newQuantity }))
    }
  }

  const handleRemoveItem = async (productId: string, sellerId: string) => {
    await dispatch(removeItemAsync({ productId, sellerId }))
  }

  const handleGoToCart = () => {
    navigate('/buyer/cart')
    onClose()
  }

  const handleCheckout = () => {
    navigate('/buyer/checkout')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup - Smaller and more left */}
      <div className="fixed right-4 top-4 z-50 h-[calc(100vh-2rem)] w-80 overflow-hidden rounded-2xl bg-slate-900 border border-primary-dark/60 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-primary-dark/40 bg-gradient-to-r from-primary-dark/40 to-primary-dark/20 backdrop-blur-xl px-3 py-2.5">
          <h2 className="text-base font-semibold text-white">YOUR BAG</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary-dark/90">
              {cartItems.length}
            </span>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          {cartItems.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-400 text-sm">Your bag is empty</p>
              <button
                onClick={() => {
                  onClose()
                }}
                className="mt-3 inline-block text-xs font-medium text-primary-dark hover:text-primary transition-colors"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.sellerId}`}
                  className="flex gap-2 rounded-lg border border-primary-dark/40 bg-slate-800/60 p-2 hover:bg-slate-800 transition-colors"
                >
                  {/* Product Image */}
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-slate-700 overflow-hidden border border-primary-dark/30">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary-dark/40 to-primary-dark/20" />
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-medium text-white line-clamp-2">{item.name}</h3>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        🏪 {item.vendor} · Rs. {typeof item.price === 'string' ? item.price : item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-0.5 bg-slate-700/80 rounded w-fit px-1 py-0.5 border border-primary-dark/50">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.sellerId, item.quantity - 1)}
                        disabled={loading}
                        className="flex h-5 w-5 items-center justify-center rounded text-primary-dark hover:bg-primary-dark/30 disabled:opacity-50 transition-colors font-bold text-sm"
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-[11px] text-slate-300 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.sellerId, item.quantity + 1)}
                        disabled={loading}
                        className="flex h-5 w-5 items-center justify-center rounded text-primary-dark hover:bg-primary-dark/30 disabled:opacity-50 transition-colors font-bold text-sm"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Link */}
                    <button
                      onClick={() => handleRemoveItem(item.productId, item.sellerId)}
                      disabled={loading}
                      className="mt-0.5 text-[10px] text-primary-dark/70 hover:text-primary-dark font-medium disabled:opacity-50 transition-colors w-fit"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Item Price */}
                  <div className="flex flex-col items-end justify-start">
                    <p className="text-[11px] text-slate-300 font-semibold">
                      Rs. {(
                        (typeof item.price === 'string' ? parseFloat(item.price) : item.price) *
                        item.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        {cartItems.length > 0 && <div className="border-t border-primary-dark/30" />}

        {/* Subtotal Section */}
        {cartItems.length > 0 && (
          <div className="space-y-2 px-3 py-2.5 bg-slate-800/40 border-b border-primary-dark/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary-dark/80">SUBTOTAL</span>
              <span className="text-[11px] text-slate-300 font-semibold">
                Rs. {subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Taxes & shipping at checkout
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {cartItems.length > 0 && (
          <div className="space-y-1.5 p-3">
            <button
              onClick={handleGoToCart}
              className="w-full rounded-lg border-2 border-primary-dark/70 px-3 py-2 text-xs font-semibold text-primary-dark hover:bg-primary-dark/20 transition-colors"
            >
              GO TO CART
            </button>
            <button
              onClick={handleCheckout}
              className="w-full rounded-lg bg-primary-dark px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark/90 transition-colors"
            >
              CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartPopup
