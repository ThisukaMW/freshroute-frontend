import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateProduct } from "../../store/slices/sellerProductsSlice";

type Category = "Fruits" | "Vegetables" | "Dairy" | "Bakery";
type Unit = "kg" | "bunch" | "pack" | "piece";

interface Product {
  id: string;
  name: string;
  category: Category;
  pricePerUnit: number;
  unit: Unit;
  stock: number;
}

interface RootState {
  sellerProducts: {
    products: Product[];
  };
}

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const product = useSelector((state: RootState) =>
    state.sellerProducts.products.find((p) => p.id === id)
  );

  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<Category>("Fruits");
  const [price, setPrice] = useState<number>(0);
  const [unit, setUnit] = useState<Unit>("kg");
  const [stock, setStock] = useState<number>(0);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.pricePerUnit);
      setUnit(product.unit);
      setStock(product.stock);
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!product) return;
    dispatch(
      updateProduct({
        id,
        changes: {
          category,
          pricePerUnit: Number(price) || 0,
          unit,
          stock: Number(stock) || 0,
        },
      })
    );
    navigate("/seller/products");
  };

  if (!product) {
    return <p className="text-sm text-slate-300">Product not found (demo data only).</p>;
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Edit product</h1>
      <p className="text-sm text-slate-300">
        Update pricing and stock for <span className="font-semibold">{product.name}</span>.
      </p>
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-200">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
            >
              <option>Fruits</option>
              <option>Vegetables</option>
              <option>Dairy</option>
              <option>Bakery</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-200">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
            >
              <option value="kg">kg</option>
              <option value="bunch">bunch</option>
              <option value="pack">pack</option>
              <option value="piece">piece</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-200">Price per unit (Rs.)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-200">Stock quantity</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Save changes
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;