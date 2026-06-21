import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItemLocal, addItemAsync } from '../../store/slices/cartSlice.ts'
import { getProductById, getProductBySellers } from '../../api/endpoints/products'
import { showSuccessToast, showErrorToast } from '../../utils/toastNotification'
import { useNotificationContext } from "../../context/NotificationContext";

const SelectSellerPage = () => {
  const { id: productId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cartItems = useSelector((state: any) => state.cart?.items ?? []) // ✅ Get cart items to calculate remaining stock
  const { addNotification } = useNotificationContext()

  const [product, setProduct] = useState<any>(null)
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [requirements, setRequirements] = useState<string>('')

  // Fetch product and sellers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch product details
        const productData = await getProductById(productId!)
        setProduct({
          id: productData.id,
          name: productData.name,
          category: productData.category,
          pricePerUnit: productData.price,
          unit: productData.unit,
          stock: productData.stock,
          imageUrl: productData.imageUrl,
          description: productData.description,
        })

        // Fetch all sellers offering this product
        const sellersData = await getProductBySellers(productId!)
        const formattedSellers = sellersData.map((item: any) => ({
          id: item.id,
          sellerId: item.seller?.id,
          sellerName: item.seller?.businessName || 'Unknown Seller',
          price: item.price,
          stock: item.stock, // ✅ NOW INCLUDED - Available quantity from this seller
          rating: 4.5,
          deliveriesPerWeek: 5,
          etaLabel: '',
        }))

        setSellers(formattedSellers)
        if (formattedSellers.length > 0) {
          setSelectedSellerId(formattedSellers[0].sellerId)
        }

        console.log('✅ Product and sellers loaded successfully')
      } catch (err: any) {
        console.error('❌ Error fetching data:', err.message)
        setError('Failed to load product or sellers')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchData()
    }
  }, [productId])

  const selectedSeller = useMemo(
    () => sellers.find((s) => s.sellerId === selectedSellerId) ?? sellers[0],
    [selectedSellerId, sellers]
  )

  // ✅ Calculate remaining stock for a specific seller (accounting for items already in cart from this seller)
  const getRemainingStockForSeller = (sellerId: string, totalSellerStock: number) => {
    const quantityInCart = cartItems
      .filter((item: any) => item.productId === productId && item.sellerId === sellerId)
      .reduce((sum: number, item: any) => sum + item.quantity, 0)
    
    return Math.max(0, totalSellerStock - quantityInCart)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 py-8">
        <h1 className="text-xl font-semibold text-slate-50">Loading...</h1>
        <p className="text-sm text-slate-300">Fetching product and sellers...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">Product not found</h1>
        <p className="text-sm text-slate-300">
          {error || "We couldn't find this product. Please go back to the product list and try again."}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Go back
        </button>
      </div>
    )
  }

  if (sellers.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">No sellers available</h1>
        <p className="text-sm text-slate-300">
          Sorry, there are no sellers currently offering this product.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Go back
        </button>
      </div>
    )
  }

  const getImageForProduct = (product: any) => {
    if (product.imageUrl) {
      return product.imageUrl
    }

    switch (product.category) {
      case 'Fruits':
        return 'https://images.unsplash.com/photo-1576179635662-9d1983e97f5d?auto=format&fit=crop&w=600&q=80'
      case 'Vegetables':
        return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
      case 'Dairy':
        return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
      case 'Bakery':
        return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkFWFlHyoiKpLLWXJpQcH2pcR0iBFmjTCMQ&s'
      default:
        return 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80'
    }
  }

  const basePrice = Number(product.pricePerUnit) || 0
  const productImage = getImageForProduct(product)

//   const handleAddToCart = async () => {
//   if (!selectedSeller) return

//   const safeQuantity =
//     Number.isFinite(quantity) && quantity > 0 ? quantity : 1

//   try {
//     await addItemToCart(
//       product.id,
//       safeQuantity,
//       selectedSeller.sellerId
      
//     )

//     console.log("✅ Added to backend cart")

//     navigate('/buyer/cart')
//   } catch (error) {
//     console.error("❌ Add to cart failed:", error)
//   }
// }

  const handleAddToCart = async () => {
    if (!selectedSeller || !product) return

    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1
    const remainingStock = getRemainingStockForSeller(selectedSeller.sellerId, selectedSeller.stock)

    // ✅ VALIDATION: Check if quantity exceeds REMAINING available stock (accounting for cart)
    if (safeQuantity > remainingStock) {
      setError(`Insufficient stock! Only ${remainingStock} ${product.unit} available for you from ${selectedSeller.sellerName}`)
      return
    }

    // Clear previous errors
    setError(null)

    // 1️⃣ Dispatch to Redux immediately (optimistic update)
    dispatch(
      addItemLocal({
        id: product.id,
        productId: product.id,
        name: product.name,
        category: product.category,
        price: selectedSeller.price,
        unit: product.unit,
        quantity: safeQuantity,
        imageUrl: product.imageUrl,
        sellerId: selectedSeller.sellerId,
        vendor: selectedSeller.sellerName // ✅ Added seller name
      })
    )

    // 2️⃣ Also save to database (in background)
    try {
      await dispatch(
        addItemAsync({
          productId: product.id,
          quantity: safeQuantity,
          sellerId: selectedSeller.sellerId,
        }) as any
      )
      console.log('✅ Item added to cart and saved to DB')
      showSuccessToast(`✓ ${product.name} added! Reserved for 20 mins.`)
      addNotification({                                           // ← ADD
        id: `cart-reminder-${Date.now()}`,                       // ← ADD
        title: "You're almost there!",                           // ← ADD
        body: `${product.name} is in your cart. Complete your order before your reservation expires.`, // ← ADD
        read: false,                                             // ← ADD
        createdAt: new Date().toISOString(),                     // ← ADD
        data: { type: "CART_REMINDER" },                        // ← ADD
      })                                                         // ← ADD
      navigate('/buyer/cart')
    } catch (error: any) {
      console.error('❌ Failed to sync with DB:', error)
      showErrorToast(error.response?.data?.message || 'Failed to add item to cart')
      setError(error.response?.data?.message || 'Failed to add item to cart')
      // Item stays in Redux even if DB save fails - user can retry
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">
            Select seller
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-supply-paper">
            Choose a seller for {product.name}
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Compare seller ratings, delivery speed and prices. Then add the product to your cart
            with your required quantity and any special notes.
          </p>
        </div>
        <Link
          to="/buyer/products"
          className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-supply-paper hover:bg-white/10"
        >
          Back to products
        </Link>
      </header>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-supply-paper backdrop-blur-xl md:grid-cols-[120px,minmax(0,1fr)]">
        <div className="h-24 w-full overflow-hidden rounded-xl bg-white/5 md:h-28">
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-supply-paper">{product.name}</p>
            <p className="mt-0.5 text-[11px] text-slate-300">
              Category: <span className="font-medium">{product.category || 'General'}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-300">
              Base price:{' '}
              <span className="font-semibold text-supply-paper">
                Rs. {basePrice} <span className="font-normal">/ {product.unit}</span>
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-supply-teal/40 bg-supply-teal/10 px-3 py-2 text-[11px] text-supply-paper md:text-right">
            <p className="font-semibold">How this works</p>
            <p className="mt-0.5 text-[11px] text-slate-200">
              1. Pick your preferred seller.
              <br />
              2. Set quantity and notes.
              <br />
              3. Add to cart.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <p className="text-xs font-semibold text-supply-paper">Available sellers ({sellers.length})</p>
          <div className="mt-2 space-y-2">
            {sellers.map((seller) => {
              const remainingStock = getRemainingStockForSeller(seller.sellerId, seller.stock)
              const inYourCart = cartItems
                .filter((item: any) => item.productId === productId && item.sellerId === seller.sellerId)
                .reduce((sum: number, item: any) => sum + item.quantity, 0)
              
              return (
  <button
    key={seller.id}
    type="button"
    onClick={() => setSelectedSellerId(seller.sellerId)}
    className={`w-full rounded-xl px-3 py-2 text-left text-xs transition ${
      selectedSellerId === seller.sellerId
        ? 'border border-supply-teal bg-supply-teal/20 text-supply-paper'
        : 'border border-white/10 bg-slate-950/40 text-slate-200 hover:border-supply-teal/70'
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-semibold">{seller.sellerName}</p>
        <p className="mt-0.5 text-[11px] text-slate-300">
          {seller.rating.toFixed(1)}★ · {seller.deliveriesPerWeek}+ deliveries/week
        </p>
        {/* ✅ SHOW REMAINING QUANTITY (Total - Already in cart) */}
        <p className="mt-1 text-[11px] font-medium">
          {remainingStock === 0 ? (
            <span className="text-red-400">❌ Out of stock</span>
          ) : remainingStock <= 5 ? (
            <span className="text-amber-400">⚠️ Low: {remainingStock} {product.unit} left</span>
          ) : (
            <span className="text-emerald-400">✓ {remainingStock} {product.unit} available for you</span>
          )}
        </p>
        {inYourCart > 0 && (
          <p className="mt-0.5 text-[10px] text-supply-peach">
            📦 {inYourCart} {product.unit} already in your cart from this seller
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-supply-paper">
          Rs. {seller.price}{' '}
          <span className="font-normal text-slate-300">/ {product.unit}</span>
        </p>
        <p className="mt-0.5 text-[11px] text-supply-peach">{seller.etaLabel}</p>
      </div>
    </div>
  </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-supply-teal/40 bg-supply-deep/80 p-4 text-xs text-supply-paper">
          <p className="text-xs font-semibold text-supply-paper">Your requirements</p>
          <div className="mt-2 space-y-3">
            <div>
              <label className="text-[11px] text-slate-200">
                Quantity ({product.unit}) 
                {selectedSeller && (
                  <span className="ml-2 font-medium text-supply-peach">
                    Max: {getRemainingStockForSeller(selectedSeller.sellerId, selectedSeller.stock)} available for you
                  </span>
                )}
              </label>
              <input
                type="number"
                min={1}
                max={selectedSeller ? getRemainingStockForSeller(selectedSeller.sellerId, selectedSeller.stock) : 1}
                value={quantity}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setQuantity(val)
                  // ✅ VALIDATE ON INPUT CHANGE
                  if (selectedSeller && val > selectedSeller.stock) {
                    setError(`Cannot order more than ${selectedSeller.stock} ${product.unit} available`)
                  } else {
                    setError(null)
                  }
                }}
                className="mt-1 w-32 rounded-xl border border-white/15 bg-slate-950/60 px-3 py-1.5 text-xs text-supply-paper outline-none focus:border-supply-teal focus:ring-1 focus:ring-supply-teal"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-200">Special instructions (optional)</label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="E.g. medium-sized fruits, nicely packed, arrive before 6 PM..."
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-xs text-supply-paper outline-none placeholder:text-slate-400 focus:border-supply-teal focus:ring-1 focus:ring-supply-teal"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-50">
                <p className="font-semibold">❌ {error}</p>
              </div>
            )}

            {selectedSeller && !error && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-50">
                <p className="font-semibold">
                  Selected seller: <span className="font-normal">{selectedSeller.sellerName}</span>
                </p>
                <p className="mt-0.5">
                  {selectedSeller.rating.toFixed(1)}★ · Rs. {selectedSeller.price} / {product.unit}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={error !== null} // ✅ DISABLE IF ERROR
              className={`mt-1 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-xs font-medium transition ${
                error 
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              Add to cart from {selectedSeller?.sellerName ?? 'selected seller'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SelectSellerPage;


