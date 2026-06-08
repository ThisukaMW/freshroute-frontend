import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toggleStatus } from '../../store/slices/sellerProductsSlice.js'
import { useEffect, useState } from "react";
import { fetchSellerProducts } from "../../store/slices/sellerProductsSlice";

const VendorProductsPage = () => {
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { products, loading } = useSelector(
    (state: any) => state.sellerProducts
  );

  // ✅ Add search and filter state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')

  useEffect(() => {
    dispatch(fetchSellerProducts() as any);
  }, [dispatch]);

  // ✅ Filtered products
  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus =
      statusFilter === 'All statuses' ? true :
      statusFilter === 'Active' ? p.status === 'APPROVED' :
      statusFilter === 'Inactive' ? p.status === 'REJECTED' :
      true

    return matchesSearch && matchesStatus
  })

  const formatPrice = (p: any) => `Rs. ${p.sellerPrice}`

  return (
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-supply-peach">Inventory</p>
              <h1 className="mt-2 text-2xl font-semibold text-supply-paper">Products</h1>
              <p className="mt-1 text-sm text-slate-300">
                Manage your product catalog, pricing and stock levels from a single place.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-xl border border-white/20 px-4 py-2 text-xs font-medium text-slate-100 hover:border-emerald-400">
                Export
              </button>
              <button
                className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-dark"
                onClick={() => navigate("/seller/products/add")}
              >
                + Add Product
              </button>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-white/10 bg-supply-deep/80 p-4 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                {/* ✅ Wired up search */}
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                />
                {/* ✅ Wired up status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2"
                >
                  <option>All statuses</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              {/* ✅ Shows filtered count */}
              <p className="text-xs text-slate-300">{filteredProducts.length} products</p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-100">
                <thead className="border-b border-white/5 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Price</th>
                    <th className="px-3 py-2 font-medium">Stock</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                    <th className="px-3 py-2 font-medium">Test</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {/* ✅ Use filteredProducts instead of products */}
                  {filteredProducts.length > 0 ? filteredProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400/70 via-emerald-500/60 to-accent-blue/60" />
                          <div>
                            <p className="text-xs font-medium text-slate-50">{p.name}</p>
                            <p className="text-[11px] text-slate-400">
                              SKU: {p.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-300">{p.category}</td>
                      <td className="px-3 py-2 text-xs text-slate-50">{formatPrice(p)}</td>
                      <td className="px-3 py-2 text-xs text-slate-50">{p.sellerStock}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          p.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-300' :
                          p.status === 'PENDING_APPROVAL' ? 'bg-amber-500/15 text-amber-300' :
                          p.status === 'OUT_OF_STOCK' ? 'bg-white/10 text-slate-300' :
                          'bg-red-500/10 text-red-300'
                        }`}>
                          {p.status === 'APPROVED' ? 'Approved' :
                           p.status === 'PENDING_APPROVAL' ? 'Pending approval' :
                           p.status === 'OUT_OF_STOCK' ? 'Out of stock' : 'Rejected'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2 text-[11px]">
                          <button
                            className="text-emerald-300 hover:text-emerald-200 disabled:text-slate-500"
                            onClick={() => navigate(`/seller/products/${p.id}/edit`)}
                            disabled={p.status === 'PENDING_APPROVAL'}
                          >
                            Edit
                          </button>
                          <button
                            className="text-slate-400 hover:text-slate-200 disabled:text-slate-600"
                            onClick={() => dispatch(toggleStatus(p.id))}
                            disabled={p.status === 'PENDING_APPROVAL'}
                          >
                            {p.status === 'APPROVED' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                      <td>test</td>
                    </tr>
                  )) : (
                    // ✅ Empty state when no results
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                        No products match your search
                      </td>
                    </tr>
                    
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
  )
}

export default VendorProductsPage