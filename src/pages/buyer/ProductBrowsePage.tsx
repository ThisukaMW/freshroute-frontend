import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.ts'
import { useSelector } from 'react-redux'
import { getProducts } from '../../api/endpoints/products'
import CartPopup from '../../components/cart/CartPopup'
const ProductBrowsePage = () => {

  const [activeCategory, setActiveCategory] = useState('All')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 })
  const [sortBy, setSortBy] = useState('recommended')
  const [searchQuery, setSearchQuery] = useState('')  // ← NEW: Search state
  const [minRating, setMinRating] = useState<number | null>(null)  // ← NEW: Minimum rating state
  const [cartPopupOpen, setCartPopupOpen] = useState(false)
  
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const cartCount = useSelector((state: any) => state.cart?.items?.length ?? 0)
  const [products, setProducts] = useState<any[]>([])

  // Fetch products from backend on component mount
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getProducts()
      
      // Map backend format to frontend format
      const formattedProducts = data.map((product: any) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        pricePerUnit: product.price,
        unit: product.unit,
        stock: product.stock, // Total stock
        availableStock: product.availableStock, // ✅ Available = Total - Reserved
        reservedQuantity: product.reservedQuantity, // For debugging
        status: product.status,
        imageUrl: product.imageUrl,
        description: product.description,
        sellerName: product.seller?.user?.name || 'Unknown Vendor',
        averageRating: product.averageRating ?? 0,   // ← add
        totalRatings: product.totalRatings ?? 0,     // ← add
      }))
      
      setProducts(formattedProducts)
      console.log('✅ Products loaded successfully')
    } catch (err: any) {
      console.error('❌ Error fetching products:', err.message)
    }
  }
  
  fetchData()
}, [])

  const categories: string[] = [
    'All',
    ...Array.from(
      new Set<string>(
        products.map((p: any) => String(p.category ?? '')).filter((c: string) => c.length > 0)
      )
    ),
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

  // ✅ UPDATED: Filter with category, price, AND search
  const filteredProducts = products.filter((p: any) => {
    // Filter by status
    if (p.status !== 'APPROVED') return false
    
    // Filter by category
    if (activeCategory !== 'All' && p.category !== activeCategory) return false
    
    // Filter by price range
    if (p.pricePerUnit < priceRange.min || p.pricePerUnit > priceRange.max) return false
    
    // ← add this block
    if (minRating !== null && (p.averageRating ?? 0) < minRating) return false

    // ✅ NEW: Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      const productName = String(p.name || '').toLowerCase()
      const productCategory = String(p.category || '').toLowerCase()
      
      // Check if query matches name or category
      if (!productName.includes(query) && !productCategory.includes(query)) {
        return false
      }
    }
    
    return true
  })

  // Sort the filtered products
  const visibleProducts = [...filteredProducts].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-low-high':
        return a.pricePerUnit - b.pricePerUnit
      case 'price-high-low':
        return b.pricePerUnit - a.pricePerUnit
      case 'rating':
        return (b.averageRating ?? 0) - (a.averageRating ?? 0)   // ← was `return 0`
      default:
        return 0
    }
  })

  const handleBrowseSellers = (product: any) => {
    if (!isAuthenticated) {
      navigate('/signup/customer')
      return
    }
    navigate(`/buyer/products/${product.id}/sellers`)
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value)
    if (newMin <= priceRange.max) {
      setPriceRange({ ...priceRange, min: newMin })
    }
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value)
    if (newMax >= priceRange.min) {
      setPriceRange({ ...priceRange, max: newMax })
    }
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  // ✅ NEW: Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">Browse</p>
          <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Browse products</h1>
          <p className="mt-1 text-sm text-slate-300">
            Explore items from multiple vendors and compare prices. To add items to your cart, please create an
            account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* ✅ UPDATED: Search input with value and onChange */}
          <input
            type="text"
            placeholder="Search for apples, milk, tomatoes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-supply-paper outline-none ring-supply-teal/60 placeholder:text-slate-400 focus:border-supply-teal focus:ring-2 md:w-72"
          />
          
          <button
            onClick={() => setCartPopupOpen(true)}
            className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-supply-paper hover:bg-white/10 transition-colors"
          >
            Cart ({cartCount})
          </button>
        </div>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-[220px,1fr]">
        <aside className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          {/* Categories */}
          <div>
            <p className="text-xs font-semibold text-supply-paper">Categories</p>
            <div className="mt-2 flex flex-wrap gap-2 md:flex-col">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    cat === activeCategory
                      ? 'bg-supply-teal text-supply-paper'
                      : 'bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <p className="text-xs font-semibold text-supply-paper">Price range</p>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-[11px] text-slate-400">Min: Rs. {priceRange.min}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange.min}
                  onChange={handleMinPriceChange}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-supply-peach"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Max: Rs. {priceRange.max}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange.max}
                  onChange={handleMaxPriceChange}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-supply-orange"
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                <span>Rs. {priceRange.min}</span>
                <span>to</span>
                <span>Rs. {priceRange.max}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-xs font-semibold text-supply-paper">Rating</p>
            <div className="mt-2 space-y-1 text-xs text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={minRating === 4}
                  onChange={() => setMinRating(minRating === 4 ? null : 4)}
                  className="h-3.5 w-3.5 rounded border-slate-500 bg-supply-charcoal text-supply-orange focus:ring-supply-orange"
                />
                <span>4★ and above</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={minRating === 3}
                  onChange={() => setMinRating(minRating === 3 ? null : 3)}
                  className="h-3.5 w-3.5 rounded border-slate-500 bg-supply-charcoal text-supply-orange focus:ring-supply-orange"
                />
                <span>3★ and above</span>
              </label>
            </div>
          </div>
        </aside>

        <section>
          

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-300">
              Showing {visibleProducts.length} product{visibleProducts.length !== 1 ? 's' : ''}
              {searchQuery && <span className="font-semibold"> for "{searchQuery}"</span>}
            </p>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-supply-paper outline-none ring-supply-teal/60 focus:border-supply-teal focus:ring-2 hover:bg-white/10 transition-colors"
            
            >
              <option value="recommended" className="bg-slate-900 text-supply-paper">Sort by: Recommended</option>
              <option value="price-low-high" className="bg-slate-900 text-supply-paper">Price: Low to High</option>
              <option value="price-high-low" className="bg-slate-900 text-supply-paper">Price: High to Low</option>
              <option value="rating" className="bg-slate-900 text-supply-paper">Rating</option>
            </select>
          </div>

          {/* ✅ NEW: Show "No results" message when no products match */}
          {visibleProducts.length === 0 ? (
            <div className="mt-8 text-center">
              <p className="text-lg text-slate-300">No products found</p>
              <p className="mt-2 text-sm text-slate-400">
                Try adjusting your filters or search query
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 rounded-xl bg-supply-teal px-4 py-2 text-xs font-medium text-supply-paper hover:bg-supply-teal/80"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
                >
                  <div className="mb-2 h-24 overflow-hidden rounded-xl bg-white/5 relative">
                    <img
                      src={getImageForProduct(p)}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-sm font-medium text-supply-paper">{p.name}</p>

                  {/* ← new rating snippet goes here */}
                  {p.totalRatings > 0 ? (
                    <p className="mt-0.5 text-xs text-slate-300">
                      <span className="text-supply-peach">{p.averageRating.toFixed(1)}★</span>
                      <span className="text-slate-500"> ({p.totalRatings})</span>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-slate-500 italic">No ratings yet</p>
                  )}

                  <button
                    type="button"
                    onClick={() => handleBrowseSellers(p)}
                    className="mt-2 inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-medium transition-all bg-primary-dark text-supply-paper hover:bg-primary"
                  >
                    Browse Sellers
                  </button>
            
                  {/* <p className="mt-1 text-xs font-semibold text-supply-paper">
                    Rs. {p.pricePerUnit}{' '}
                    <span className="font-normal text-slate-300">
                      / {p.unit} · <span className="text-supply-peach">4.5★</span>
                    </span>
                  </p> */}
                  <button
                    type="button"
                    onClick={() => handleBrowseSellers(p)}
                    className="mt-2 inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-medium transition-all bg-primary-dark text-supply-paper hover:bg-primary"
                  >
                    Browse Sellers
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      
      {/* Cart Popup Modal */}
      <CartPopup isOpen={cartPopupOpen} onClose={() => setCartPopupOpen(false)} />
    </div>
  )
};

export default ProductBrowsePage;

