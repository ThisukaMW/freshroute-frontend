import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.ts";
import { addItemToCart, getCart } from "../../api/endpoints/cart";
import { getProductBySellers } from "../../api/endpoints/products";

const BrowseProductPage = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<string, number>
  >({});
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signup/customer", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch products from specific seller
  useEffect(() => {
    const fetchData = async () => {
      if (!sellerId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getProductBySellers(sellerId);

        // Map backend format to frontend format
        const formattedProducts = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          pricePerUnit: product.price,
          unit: product.unit,
          stock: product.stock,
          status: product.status === "APPROVED" ? "active" : "inactive",
          imageUrl: product.imageUrl,
          description: product.description,
          sellerId: sellerId,
        }));

        setProducts(formattedProducts);
        console.log("✅ Seller products loaded successfully");
      } catch (err: any) {
        console.error("❌ Error fetching seller products:", err.message);
        setError("Failed to load products from this seller");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  const categories: string[] = [
    "All",
    ...Array.from(
      new Set<string>(
        products
          .map((p: any) => String(p.category ?? ""))
          .filter((c: string) => c.length > 0),
      ),
    ),
  ];

  const getImageForProduct = (product: any) => {
    if (product.imageUrl) {
      return product.imageUrl;
    }

    switch (product.category) {
      case "Fruits":
        return "https://images.unsplash.com/photo-1576179635662-9d1983e97f5d?auto=format&fit=crop&w=600&q=80";
      case "Vegetables":
        return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80";
      case "Dairy":
        return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
      case "Bakery":
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkFWFlHyoiKpLLWXJpQcH2pcR0iBFmjTCMQ&s";
      default:
        return "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80";
    }
  };

  // Filter products
  const filteredProducts = products.filter((p: any) => {
    if (p.status !== "active") return false;
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (p.pricePerUnit < priceRange.min || p.pricePerUnit > priceRange.max)
      return false;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const productName = String(p.name || "").toLowerCase();
      const productCategory = String(p.category || "").toLowerCase();
      return productName.includes(query) || productCategory.includes(query);
    }
    return true;
  });

  const handleAddToCart = async (product: any) => {
    const quantity = selectedQuantities[product.id] || 1;

    try {
      setAddingToCart({ ...addingToCart, [product.id]: true });
      await addItemToCart(product.id, quantity, sellerId);
      // Refetch cart to update CartPage
      await getCart();
      setSelectedQuantities({ ...selectedQuantities, [product.id]: 1 });
      alert(`✅ Added "${product.name}" to cart`);
      console.log("✅ Item added to cart successfully");
    } catch (err: any) {
      console.error("❌ Failed to add to cart:", err.message);
      alert("Failed to add item to cart");
    } finally {
      setAddingToCart({ ...addingToCart, [product.id]: false });
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity > 0) {
      setSelectedQuantities({ ...selectedQuantities, [productId]: quantity });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-300">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:text-primary-light mb-4 flex items-center gap-2"
          >
            ← Back to sellers
          </button>
          <h1 className="text-3xl font-bold text-slate-50">Seller Products</h1>
          <p className="text-slate-400 mt-2">
            Browse and add products to your cart
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-slate-800 rounded-xl p-6 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-slate-50 mb-3">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`block w-full text-left px-3 py-2 rounded text-sm transition ${
                        activeCategory === cat
                          ? "bg-primary text-white"
                          : "text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-semibold text-slate-50 mb-3">
                  Price Range
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400">
                      Min: ${priceRange.min}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          min: Number(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">
                      Max: ${priceRange.max}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          max: Number(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Search */}
              <div>
                <h3 className="text-sm font-semibold text-slate-50 mb-3">
                  Search
                </h3>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-700 text-slate-50 rounded px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-slate-400">No products found</p>
                <p className="text-sm text-slate-500 mt-2">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-slate-800 rounded-xl overflow-hidden hover:shadow-xl transition transform hover:scale-105"
                  >
                    {/* Product Image */}
                    <img
                      src={getImageForProduct(product)}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-slate-50">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {product.category}
                      </p>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            ${product.pricePerUnit}
                          </p>
                          <p className="text-xs text-slate-400">
                            per {product.unit}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">
                          Stock: {product.stock}
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 bg-slate-700 rounded px-2 py-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              product.id,
                              (selectedQuantities[product.id] || 1) - 1,
                            )
                          }
                          className="text-primary hover:text-primary-light text-sm"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={selectedQuantities[product.id] || 1}
                          onChange={(e) =>
                            handleQuantityChange(
                              product.id,
                              Number(e.target.value),
                            )
                          }
                          className="w-8 bg-transparent text-center text-slate-50 text-sm focus:outline-none"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              product.id,
                              (selectedQuantities[product.id] || 1) + 1,
                            )
                          }
                          className="text-primary hover:text-primary-light text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart[product.id]}
                        className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-600 text-white font-medium py-2 rounded-lg transition text-sm"
                      >
                        {addingToCart[product.id] ? "Adding..." : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseProductPage;
