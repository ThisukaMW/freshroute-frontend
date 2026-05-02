import { Link, useNavigate } from 'react-router-dom'
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
  const [cartPopupOpen, setCartPopupOpen] = useState(false)
  
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const cartCount = useSelector((state: any) => state.cart?.items?.length ?? 0)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from backend on component mount
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProducts()
      
      // Map backend format to frontend format
      const formattedProducts = data.map((product: any) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        pricePerUnit: product.price,
        unit: product.unit,
        stock: product.stock,
        status: product.status,
        imageUrl: product.imageUrl,
        description: product.description,
        sellerName: product.seller?.user?.name || 'Unknown Vendor',
      }))
      
      setProducts(formattedProducts)
      console.log('✅ Products loaded successfully')
    } catch (err: any) {
      console.error('❌ Error fetching products:', err.message)
      setError('Failed to load products')
    } finally {
      setLoading(false)
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
        return 0
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
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-500 bg-supply-charcoal text-supply-orange focus:ring-supply-orange" />
                <span>4★ and above</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-500 bg-supply-charcoal text-supply-orange focus:ring-supply-orange" />
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
              className="rounded-xl border border-supply-teal/40 bg-supply-teal/20 px-3 py-1.5 text-xs  text-supply-charcoal outline-none ring-supply-teal/60 focus:border-supply-teal focus:ring-2 hover:bg-supply-teal/30 transition-colors"
            >
              <option value="recommended">Sort by: Recommended</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Rating</option>
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
                    {/* ✅ Stock Badge */}
                    <div className="absolute top-2 right-2 rounded-lg bg-black/60 backdrop-blur px-2 py-1 text-xs font-medium">
                      {p.stock === 0 ? (
                        <span className="text-red-400">Out of Stock</span>
                      ) : p.stock <= p.lowStock ? (
                        <span className="text-amber-400">Low Stock: {p.stock}</span>
                      ) : (
                        <span className="text-emerald-400">{p.stock} Available</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-supply-paper">{p.name}</p>
                  <p className="text-[11px] text-slate-300">{p.sellerName}</p>
                  <p className="mt-1 text-xs font-semibold text-supply-paper">
                    Rs. {p.pricePerUnit}{' '}
                    <span className="font-normal text-slate-300">
                      / {p.unit} · <span className="text-supply-peach">4.5★</span>
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleBrowseSellers(p)}
                    disabled={p.stock === 0}
                    className={`mt-2 inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      p.stock === 0
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                        : 'bg-primary-dark text-supply-paper hover:bg-primary'
                    }`}
                  >
                    {p.stock === 0 ? 'Out of Stock' : 'Browse Sellers'}
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

// import { Link, useNavigate } from 'react-router-dom'
// import { useState, useEffect } from 'react'
// import { useAuth } from '../../hooks/useAuth'
// import { useSelector } from 'react-redux'

// interface Product {
//   id: string
//   name: string
//   category: string
//   price: number
//   unit: string
//   stock: number
//   status: string
//   imageUrl?: string
// }

// const ProductBrowsePage = () => {
//   const [activeCategory, setActiveCategory] = useState('All')
//   const [priceRange, setPriceRange] = useState({ min: 0, max: 500 })
//   const [sortBy, setSortBy] = useState('recommended')
//   const [searchQuery, setSearchQuery] = useState('')
//   const [products, setProducts] = useState<Product[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const navigate = useNavigate()
//   const { isAuthenticated } = useAuth()
//   const cartCount = useSelector((state: any) => state.cart?.items?.length ?? 0)

//   // Load real products from backend
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await fetch('/api/v1/products')
//         if (!res.ok) throw new Error('Failed to load products')
//         const data = await res.json()
//         setProducts(data)
//       } catch (err) {
//         setError('Failed to load products')
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchProducts()
//   }, [])

//   const categories: string[] = [
//     'All',
//     ...Array.from(
//       new Set<string>(
//         products.map((p) => String(p.category ?? '')).filter((c) => c.length > 0)
//       )
//     ),
//   ]

//   const getImageForProduct = (product: Product) => {
//     if (product.imageUrl) return product.imageUrl
//     switch (product.category) {
//       case 'Fruits':
//         return 'https://images.unsplash.com/photo-1576179635662-9d1983e97f5d?auto=format&fit=crop&w=600&q=80'
//       case 'Vegetables':
//         return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
//       case 'Dairy':
//         return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
//       case 'Bakery':
//         return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkFWFlHyoiKpLLWXJpQcH2pcR0iBFmjTCMQ&s'
//       default:
//         return 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80'
//     }
//   }

//   const filteredProducts = products.filter((p) => {
//     if (p.status !== 'APPROVED') return false
//     if (activeCategory !== 'All' && p.category !== activeCategory) return false
//     if (p.price < priceRange.min || p.price > priceRange.max) return false
//     if (searchQuery.trim() !== '') {
//       const query = searchQuery.toLowerCase()
//       if (
//         !p.name.toLowerCase().includes(query) &&
//         !p.category.toLowerCase().includes(query)
//       )
//         return false
//     }
//     return true
//   })

//   const visibleProducts = [...filteredProducts].sort((a, b) => {
//     switch (sortBy) {
//       case 'price-low-high': return a.price - b.price
//       case 'price-high-low': return b.price - a.price
//       default: return 0
//     }
//   })

//   const handleBrowseSellers = (product: Product) => {
//     if (!isAuthenticated) {
//       navigate('/signup/customer')
//       return
//     }
//     navigate(`/buyer/products/${product.id}/sellers`)
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-slate-300 text-sm">Loading products...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-red-400 text-sm">{error}</p>
//       </div>
//     )
//   }

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-6">
//       <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
//         <div>
//           <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">Browse</p>
//           <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Browse products</h1>
//           <p className="mt-1 text-sm text-slate-300">
//             Explore items from multiple vendors and compare prices.
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <input
//             type="text"
//             placeholder="Search for apples, milk, tomatoes..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-supply-paper outline-none ring-supply-teal/60 placeholder:text-slate-400 focus:border-supply-teal focus:ring-2 md:w-72"
//           />
//           <Link
//             to="/signup/customer"
//             className="rounded-xl bg-supply-orange/80 px-4 py-2 text-xs font-medium text-supply-paper hover:bg-supply-clay"
//           >
//             Sign up to order
//           </Link>
//           <Link
//             to="/buyer/cart"
//             className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-supply-paper hover:bg-white/10"
//           >
//             Cart ({cartCount})
//           </Link>
//         </div>
//       </header>

//       <div className="mt-6 grid gap-6 md:grid-cols-[220px,1fr]">
//         <aside className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
//           <div>
//             <p className="text-xs font-semibold text-supply-paper">Categories</p>
//             <div className="mt-2 flex flex-wrap gap-2 md:flex-col">
//               {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => setActiveCategory(cat)}
//                   className={`rounded-full px-3 py-1 text-xs ${
//                     cat === activeCategory
//                       ? 'bg-supply-teal text-supply-paper'
//                       : 'bg-white/5 text-slate-200 hover:bg-white/10'
//                   }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div>
//             <p className="text-xs font-semibold text-supply-paper">Price range</p>
//             <div className="mt-3 space-y-3">
//               <div>
//                 <label className="text-[11px] text-slate-400">Min: Rs. {priceRange.min}</label>
//                 <input
//                   type="range" min="0" max="500"
//                   value={priceRange.min}
//                   onChange={(e) => {
//                     const v = Number(e.target.value)
//                     if (v <= priceRange.max) setPriceRange({ ...priceRange, min: v })
//                   }}
//                   className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-supply-peach"
//                 />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400">Max: Rs. {priceRange.max}</label>
//                 <input
//                   type="range" min="0" max="500"
//                   value={priceRange.max}
//                   onChange={(e) => {
//                     const v = Number(e.target.value)
//                     if (v >= priceRange.min) setPriceRange({ ...priceRange, max: v })
//                   }}
//                   className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-supply-orange"
//                 />
//               </div>
//               <div className="flex justify-between text-[11px] text-slate-300 font-medium">
//                 <span>Rs. {priceRange.min}</span>
//                 <span>to</span>
//                 <span>Rs. {priceRange.max}</span>
//               </div>
//             </div>
//           </div>
//         </aside>

//         <section>
//           <div className="flex items-center justify-between">
//             <p className="text-xs text-slate-300">
//               Showing {visibleProducts.length} product{visibleProducts.length !== 1 ? 's' : ''}
//               {searchQuery && <span className="font-semibold"> for "{searchQuery}"</span>}
//             </p>
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="rounded-xl border border-supply-teal/40 bg-supply-teal/20 px-3 py-1.5 text-xs text-supply-charcoal outline-none"
//             >
//               <option value="recommended">Sort by: Recommended</option>
//               <option value="price-low-high">Price: Low to High</option>
//               <option value="price-high-low">Price: High to Low</option>
//             </select>
//           </div>

//           {visibleProducts.length === 0 ? (
//             <div className="mt-8 text-center">
//               <p className="text-lg text-slate-300">No products found</p>
//               <p className="mt-2 text-sm text-slate-400">Try adjusting your filters or search query</p>
//             </div>
//           ) : (
//             <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {visibleProducts.map((p) => (
//                 <div
//                   key={p.id}
//                   className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
//                 >
//                   <div className="mb-2 h-24 overflow-hidden rounded-xl bg-white/5">
//                     <img
//                       src={getImageForProduct(p)}
//                       alt={p.name}
//                       className="h-full w-full object-cover transition duration-500 hover:scale-105"
//                       loading="lazy"
//                     />
//                   </div>
//                   <p className="text-sm font-medium text-supply-paper">{p.name}</p>
//                   <p className="mt-1 text-xs font-semibold text-supply-paper">
//                     Rs. {p.price}{' '}
//                     <span className="font-normal text-slate-300">/ {p.unit}</span>
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => handleBrowseSellers(p)}
//                     className="mt-2 inline-flex items-center justify-center rounded-xl bg-primary-dark px-3 py-1.5 text-xs font-medium text-supply-paper hover:bg-primary"
//                   >
//                     Browse Sellers
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       </div>
//     </div>
//   )
// }

// export default ProductBrowsePage