import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateProduct } from "../../store/slices/sellerProductsSlice";

type Category = "Fruits" | "Vegetables" | "Dairy" | "Bakery";
type Unit = "kg" | "bunch" | "pack" | "piece";

interface SellerProduct {
  id: string;
  name: string;
  category: Category;
  price: number;
  unit: Unit;
  sellerStock: number;
  lowStockThreshold: number;
  status: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface RootState {
  sellerProducts: {
    products: SellerProduct[];
    loading: boolean;
    error: string | null;
  };
}

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  const { products, loading: storeLoading } = useSelector(
    (state: RootState) => state.sellerProducts
  );

  const product = products.find((p) => p.id === id);

  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<Category>("Fruits");
  const [price, setPrice] = useState<number | null>(null);
  const [unit, setUnit] = useState<Unit>("kg");
  const [stock, setStock] = useState<number | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "Fruits");
      setPrice(product.price ?? null);
      setUnit(product.unit || "kg");
      setStock(product.sellerStock ?? null);
      setDescription(product.description || null);
      setImageUrl(product.imageUrl || null);
    }
  }, [product]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!product || !id) return;

    setLoading(true);
    setError(null);

    try {
      // Only send editable fields: price, stock, imageUrl
      const updateData: Record<string, any> = {};
      if (price !== null) updateData.price = price;
      if (stock !== null) updateData.stock = stock;
      if (imageUrl !== null) updateData.imageUrl = imageUrl;

      dispatch(
        updateProduct({
          productId: id,
          productData: updateData,
        })
      );
      navigate("/seller/products");
    } catch (err: any) {
      setError(err?.message || "Failed to update product");
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="max-w-xl space-y-4">
        <p className="text-sm text-slate-300">Product not found.</p>
        <button
          onClick={() => navigate("/seller/products")}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Edit product</h1>
      <p className="text-sm text-slate-300">
        Update pricing, stock, and image for <span className="font-semibold">{product.name}</span>. Other details are locked after approval.
      </p>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl text-sm"
      >
        <div>
          <label className="block text-xs font-medium text-slate-200">Product name</label>
          <input
            type="text"
            value={name}
            disabled
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Name cannot be changed here. Use admin tools if you need to rename a product.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-200">Category</label>
          <input
            type="text"
            value={category}
            disabled
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Category cannot be changed after approval.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-200">Unit</label>
          <input
            type="text"
            value={unit}
            disabled
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Unit cannot be changed after approval.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-200">Description</label>
          <textarea
            value={description || ""}
            disabled
            placeholder="Description cannot be edited"
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Description cannot be changed after approval.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-200">Image URL</label>
          <input
            type="text"
            value={imageUrl || ""}
            onChange={(e) => setImageUrl(e.target.value || null)}
            disabled={loading || storeLoading}
            placeholder="https://example.com/image.jpg"
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-50"
          />
          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Product preview"
                className="h-20 w-20 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-200">Price per unit (Rs.)</label>
            <input
              type="number"
              value={price ?? ""}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : null)}
              disabled={loading || storeLoading}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-200">Stock quantity</label>
            <input
              type="number"
              value={stock ?? ""}
              onChange={(e) => setStock(e.target.value ? Number(e.target.value) : null)}
              disabled={loading || storeLoading}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-50"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading || storeLoading}
            className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || storeLoading ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            disabled={loading}
            className="flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-slate-100 hover:border-white/40 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;