// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { addProduct } from "../../store/slices/sellerProductsSlice";
// import type { AppDispatch } from "../../store";

// const AddProductPage: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const [name, setName] = useState<string>("");
//   const [category, setCategory] = useState<string>("Fruits");
//   const [price, setPrice] = useState<number>(0);
//   const [unit, setUnit] = useState<string>("kg");
//   const [stock, setStock] = useState<number>(0);

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     dispatch(
//       addProduct({
//         name,
//         category,
//         pricePerUnit: price,
//         unit,
//         stock: stock,
//       })
//     );

//     navigate("/seller/products");
//   };

//   return (
//     <div className="max-w-xl space-y-4">
//       <h1 className="text-xl font-semibold text-slate-50">
//         Add new product
//       </h1>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl text-sm"
//       >
//         <div>
//           <label>Product name</label>
//           <input
//             type="text"
//             value={name}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setName(e.target.value)
//             }
//           />
//         </div>

//         <div>
//           <label>Category</label>
//           <select
//             value={category}
//             onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
//               setCategory(e.target.value)
//             }
//           >
//             <option>Fruits</option>
//             <option>Vegetables</option>
//             <option>Dairy</option>
//             <option>Bakery</option>
//           </select>
//         </div>

//         <div>
//           <label>Price</label>
//           <input
//             type="number"
//             value={price}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setPrice(Number(e.target.value))
//             }
//           />
//         </div>

//         <button type="submit" >Save product</button>
//       </form>
//     </div>
//   );
// };

// export default AddProductPage;


// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { addProduct } from "../../store/slices/sellerProductsSlice";
// import type { AppDispatch } from "../../store";

// const AddProductPage: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const [name, setName] = useState<string>("");
//   const [category, setCategory] = useState<string>("Fruits");
//   const [price, setPrice] = useState<number>(0);
//   const [unit, setUnit] = useState<string>("kg");
//   const [stock, setStock] = useState<number>(0);

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     dispatch(
//       addProduct({
//         name,
//         category,
//         pricePerUnit: price,
//         unit,
//         stock,
//       })
//     );

//     navigate("/seller/products");
//   };

//   return (
//     <div className="max-w-xl space-y-4">
//       <h1 className="text-xl font-semibold text-slate-50">
//         Add new product
//       </h1>

//       <p className="text-sm text-slate-300">
//         Frontend-only form to demonstrate how sellers create products.
//       </p>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl text-sm"
//       >
//         {/* Product Name */}
//         <div>
//           <label className="block text-xs font-medium text-slate-200">
//             Product name
//           </label>
//           <input
//             type="text"
//             value={name}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setName(e.target.value)
//             }
//             placeholder="e.g. Red Apple"
//             className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
//           />
//         </div>

//         {/* Category + Unit */}
//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className="block text-xs font-medium text-slate-200">
//               Category
//             </label>
//             <select
//               value={category}
//               onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
//                 setCategory(e.target.value)
//               }
//               className="mt-1 w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
//             >
//               <option>Fruits</option>
//               <option>Vegetables</option>
//               <option>Dairy</option>
//               <option>Bakery</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-200">
//               Unit
//             </label>
//             <select
//               value={unit}
//               onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
//                 setUnit(e.target.value)
//               }
//               className="mt-1 w-full rounded-xl border border-white/10 bg-brand-background/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
//             >
//               <option value="kg">kg</option>
//               <option value="bunch">bunch</option>
//               <option value="pack">pack</option>
//               <option value="piece">piece</option>
//             </select>
//           </div>
//         </div>

//         {/* Price + Stock */}
//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className="block text-xs font-medium text-slate-200">
//               Price per unit (Rs.)
//             </label>
//             <input
//               type="number"
//               value={price}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                 setPrice(Number(e.target.value))
//               }
//               className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-slate-200">
//               Stock quantity
//             </label>
//             <input
//               type="number"
//               value={stock}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                 setStock(Number(e.target.value))
//               }
//               className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/60"
//             />
//           </div>
//         </div>

//         {/* Button */}
//         <button
//           type="submit"
//           className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition"
//         >
//           Save product
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddProductPage;

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../../store/slices/sellerProductsSlice";
import type { AppDispatch } from "../../store";

interface Variant {
  id: number;
  label: string;
  price: number;
  stock: number;
}

const AddProductPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  /* ---------- BASIC PRODUCT ---------- */
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fruits");
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState("kg");
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");

  /* ---------- IMAGES ---------- */
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  /* ---------- PRICING RULES ---------- */
  const [pricingMode, setPricingMode] =
    useState<"per_kg" | "per_piece" | "flat">("per_kg");
  const [taxPercent, setTaxPercent] = useState(0);

  /* ---------- VARIANTS ---------- */
  const [variants, setVariants] = useState<Variant[]>([
    { id: Date.now(), label: "", price: 0, stock: 0 },
  ]);

  /* ---------- IMAGE UPLOAD ---------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  /* ---------- VARIANT FUNCTIONS ---------- */
  const addVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now(), label: "", price: 0, stock: 0 },
    ]);
  };

  const removeVariant = (id: number) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (
    id: number,
    field: keyof Variant,
    value: string | number
  ) => {
    setVariants(
      variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(
      addProduct({
        name,
        category,
        description,
        images,
        pricingMode,
        taxPercent,
        variants,
        pricePerUnit: price,
        unit,
        stock,
      })
    );

    navigate("/seller/products");
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/60";

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 px-4">
    <div className="w-full max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">
        Add New Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
      >
        {/* NAME */}
        <div>
          <label className="text-xs text-slate-200">Product Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Red Apple"
            className={inputClass}
          />
        </div>

        {/* IMAGES */}
        <div>
          <label className="text-xs text-slate-200">
            Product Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-2 text-sm text-slate-300"
          />

          <div className="flex gap-2 mt-3 flex-wrap">
            {imagePreviews.map((src, i) => (
              <img
                key={i}
                src={src}
                className="h-20 w-20 rounded-lg object-cover border border-white/10"
              />
            ))}
          </div>
        </div>

        {/* CATEGORY + UNIT */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-200">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              <option>Fruits</option>
              <option>Vegetables</option>
              <option>Dairy</option>
              <option>Bakery</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-200">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={inputClass}
            >
              <option value="kg">kg</option>
              <option value="piece">piece</option>
              <option value="pack">pack</option>
              <option value="bunch">bunch</option>
            </select>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-xs text-slate-200">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* BASE PRICE */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-200">
              Price (Rs.)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs text-slate-200">
              Stock Quantity
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        {/* VARIANTS */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs text-slate-200">
              Product Variants
            </label>
            <button
              type="button"
              onClick={addVariant}
              className="text-emerald-400 text-xs"
            >
              + Add Variant
            </button>
          </div>

          {variants.map((variant) => (
            <div key={variant.id} className="grid grid-cols-4 gap-2">
              <input
                placeholder="Size/Weight"
                value={variant.label}
                onChange={(e) =>
                  updateVariant(variant.id, "label", e.target.value)
                }
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Price"
                onChange={(e) =>
                  updateVariant(
                    variant.id,
                    "price",
                    Number(e.target.value)
                  )
                }
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Stock"
                onChange={(e) =>
                  updateVariant(
                    variant.id,
                    "stock",
                    Number(e.target.value)
                  )
                }
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeVariant(variant.id)}
                className="text-red-400 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* PRICING RULES */}
        <div className="border border-white/10 rounded-xl p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-200">
            Pricing Rules
          </p>

          <select
            value={pricingMode}
            onChange={(e) =>
              setPricingMode(e.target.value as any)
            }
            className={inputClass}
          >
            <option value="per_kg">Per KG</option>
            <option value="per_piece">Per Piece</option>
            <option value="flat">Flat Price</option>
          </select>

          <input
            type="number"
            placeholder="Tax %"
            value={taxPercent}
            onChange={(e) =>
              setTaxPercent(Number(e.target.value))
            }
            className={inputClass}
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-2 text-white font-medium hover:bg-primary-dark transition"
        >
          Save Product
        </button>
      </form>
    </div>
    </div>
  );
};

export default AddProductPage;