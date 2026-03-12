import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { addItem } from '../../store/slices/cartSlice.ts'

type RootState = any

interface SellerOption {
  id: string
  name: string
  rating: number
  deliveriesPerWeek: number
  priceMultiplier: number
  etaLabel: string
}

const SELLER_OPTIONS: SellerOption[] = [
  {
    id: 'seller-fresh-farms',
    name: 'Fresh Farms Co.',
    rating: 4.8,
    deliveriesPerWeek: 6,
    priceMultiplier: 1,
    etaLabel: 'Same day delivery',
  },
  {
    id: 'seller-green-valley',
    name: 'Green Valley Traders',
    rating: 4.5,
    deliveriesPerWeek: 5,
    priceMultiplier: 0.96,
    etaLabel: 'Within 24 hours',
  },
  {
    id: 'seller-city-market',
    name: 'City Market Hub',
    rating: 4.2,
    deliveriesPerWeek: 7,
    priceMultiplier: 1.04,
    etaLabel: 'Express delivery',
  },
]

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

const SelectSellerPage = () => {
  const { id: productId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const product = useSelector((state: RootState) =>
    state.sellerProducts?.products?.find((p: any) => p.id === productId)
  )

  const [selectedSellerId, setSelectedSellerId] = useState(SELLER_OPTIONS[0]?.id)
  const [quantity, setQuantity] = useState<number>(1)
  const [requirements, setRequirements] = useState<string>('')

  const selectedSeller = useMemo(
    () => SELLER_OPTIONS.find((s) => s.id === selectedSellerId) ?? SELLER_OPTIONS[0],
    [selectedSellerId]
  )

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">Product not found</h1>
        <p className="text-sm text-slate-300">
          We couldn&apos;t find this product. Please go back to the product list and try again.
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

  const basePrice = Number(product.pricePerUnit) || 0
  const productImage = getImageForProduct(product)

  const handleAddToCart = () => {
    if (!selectedSeller) return
    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1

    const priceForSeller = Math.round(basePrice * selectedSeller.priceMultiplier)
    const compositeId = `${product.id}-${selectedSeller.id}`

    dispatch(
      addItem({
        id: compositeId,
        name: product.name,
        vendor: selectedSeller.name,
        price: `Rs. ${priceForSeller}`,
        unit: product.unit,
        quantity: safeQuantity,
        requirements: requirements.trim() || undefined,
      })
    )

    navigate('/buyer/cart')
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
          <p className="text-xs font-semibold text-supply-paper">Available sellers</p>
          <div className="mt-2 space-y-2">
            {SELLER_OPTIONS.map((seller) => {
              const sellerPrice = Math.round(basePrice * seller.priceMultiplier)
              return (
                <button
                  key={seller.id}
                  type="button"
                  onClick={() => setSelectedSellerId(seller.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs transition ${
                    selectedSellerId === seller.id
                      ? 'border border-supply-teal bg-supply-teal/20 text-supply-paper'
                      : 'border border-white/10 bg-slate-950/40 text-slate-200 hover:border-supply-teal/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{seller.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-300">
                        {seller.rating.toFixed(1)}★ · {seller.deliveriesPerWeek}+ deliveries/week
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-supply-paper">
                        Rs. {sellerPrice}{' '}
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
              <label className="text-[11px] text-slate-200">Quantity ({product.unit})</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
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

            {selectedSeller && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-50">
                <p className="font-semibold">
                  Selected seller: <span className="font-normal">{selectedSeller.name}</span>
                </p>
                <p className="mt-0.5">
                  {selectedSeller.rating.toFixed(1)}★ · {selectedSeller.etaLabel}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-dark"
            >
              Add to cart from {selectedSeller?.name ?? 'selected seller'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SelectSellerPage


