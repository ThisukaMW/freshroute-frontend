import React, { useState, useEffect, useRef } from "react";
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

/* ---------- VALIDATION ---------- */
interface FormErrors {
  price?: string;
  stock?: string;
  imageUrl?: string;
}

const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validate(fields: {
  price: number | null;
  stock: number | null;
  imageFile: File | null;
  imageUrl: string | null;
  imageMode: "url" | "file";
}): FormErrors {
  const errors: FormErrors = {};

  // Price
  if (fields.price === null || String(fields.price) === "") {
    errors.price = "Price is required.";
  } else if (isNaN(fields.price) || fields.price <= 0) {
    errors.price = "Price must be greater than 0.";
  } else if (fields.price > 1_000_000) {
    errors.price = "Price seems too high. Please double-check.";
  }

  // Stock
if (fields.stock === null || String(fields.stock) === "") {
  errors.stock = "Stock quantity is required.";
} else if (!Number.isInteger(fields.stock) || fields.stock <= 0) {
  errors.stock = "Stock must be a whole number greater than 0.";
} else if (fields.stock > 100_000) {
  errors.stock = "Stock quantity seems too high. Please double-check.";
}

  // Image — only validate if something was provided
  if (fields.imageMode === "url" && fields.imageUrl) {
    try {
      new URL(fields.imageUrl);
    } catch {
      errors.imageUrl = "Please enter a valid URL (starting with https://).";
    }
  }

  if (fields.imageMode === "file" && fields.imageFile) {
    if (!ALLOWED_IMAGE_TYPES.includes(fields.imageFile.type)) {
      errors.imageUrl = "Only JPEG, PNG, WebP, or GIF images are allowed.";
    } else if (fields.imageFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      errors.imageUrl = `Image must be under ${MAX_IMAGE_SIZE_MB} MB.`;
    }
  }

  return errors;
}

/* ---------- FIELD ERROR ---------- */
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-xs text-red-400">{message}</p> : null;

/* ---------- COMPONENT ---------- */
const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "file">("url");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "Fruits");
      setPrice(product.price ?? null);
      setUnit(product.unit || "kg");
      setStock(product.sellerStock ?? null);
      setDescription(product.description || null);
      setImageUrl(product.imageUrl || null);
      setImagePreview(product.imageUrl || null);
    }
  }, [product]);

  /* ---------- HELPERS ---------- */
  const currentFields = () => ({
    price,
    stock,
    imageFile,
    imageUrl,
    imageMode,
  });

  const touch = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(currentFields()));
  };

  const inputClass = (field: keyof FormErrors) =>
    `mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 transition disabled:opacity-50 ${
      touched[field] && errors[field]
        ? "border-red-500/70 bg-red-500/5 focus:ring-red-500/40"
        : "border-white/10 bg-white/5 focus:ring-emerald-500/60"
    }`;

  /* ---------- IMAGE HANDLERS ---------- */
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value || null;
    setImageUrl(val);
    setImagePreview(val);
    if (touched.imageUrl) setErrors(validate({ ...currentFields(), imageUrl: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const blobUrl = URL.createObjectURL(file);
    setImagePreview(blobUrl);
    setImageUrl(blobUrl);
    const errs = validate({ ...currentFields(), imageFile: file });
    setErrors((prev) => ({ ...prev, imageUrl: errs.imageUrl }));
    setTouched((prev) => ({ ...prev, imageUrl: true }));
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!product || !id) return;

    // Touch all editable fields
    setTouched({ price: true, stock: true, imageUrl: true });

    const validationErrors = validate(currentFields());
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setError(null);

    try {
      const updateData: Record<string, any> = {};
      if (price !== null) updateData.price = price;
      if (stock !== null) updateData.stock = stock;
      if (imageUrl !== null) updateData.imageUrl = imageUrl;

      dispatch(updateProduct({ productId: id, productData: updateData }));
      navigate("/seller/products");
    } catch (err: any) {
      setError(err?.message || "Failed to update product");
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <p className="text-sm text-slate-300">Product not found.</p>
          <button
            onClick={() => navigate("/seller/products")}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isDisabled = loading || storeLoading;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="flex min-h-screen w-full justify-center px-4 py-10">
      <div className="w-full max-w-xl space-y-5">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-50">Edit product</h1>
          <p className="text-sm text-slate-400">
            Update pricing, stock, and image for{" "}
            <span className="font-semibold text-slate-200">{product.name}</span>.
            Other details are locked after approval.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl text-sm"
        >
          {/* Locked: Name */}
          <LockedField label="Product name" value={name} hint="Name is locked after approval." />

          {/* Locked: Category */}
          <LockedField label="Category" value={category} hint="Category is locked after approval." />

          {/* Locked: Unit */}
          <LockedField label="Unit" value={unit} hint="Unit is locked after approval." />

          {/* Locked: Description */}
          <div>
            <label className="block text-xs font-medium text-slate-200">Description</label>
            <textarea
              value={description || ""}
              disabled
              rows={3}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 outline-none resize-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">Description is locked after approval.</p>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Editable: Image */}
          <div>
            <label className="block text-xs font-medium text-slate-200 mb-2">Product image</label>

            {/* Mode toggle */}
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => { setImageMode("url"); setErrors(validate({ ...currentFields(), imageMode: "url" })); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  imageMode === "url"
                    ? "bg-emerald-600 text-white"
                    : "border border-white/15 text-slate-400 hover:text-slate-200"
                }`}
              >
                Paste URL
              </button>
              <button
                type="button"
                onClick={() => { setImageMode("file"); setErrors(validate({ ...currentFields(), imageMode: "file" })); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  imageMode === "file"
                    ? "bg-emerald-600 text-white"
                    : "border border-white/15 text-slate-400 hover:text-slate-200"
                }`}
              >
                Browse file
              </button>
            </div>

            {imageMode === "url" ? (
              <div>
                <input
                  type="text"
                  value={imageUrl || ""}
                  onChange={handleUrlChange}
                  onBlur={() => touch("imageUrl")}
                  disabled={isDisabled}
                  placeholder="https://example.com/image.jpg"
                  className={inputClass("imageUrl").replace("mt-1 ", "")}
                />
                {touched.imageUrl && <FieldError message={errors.imageUrl} />}
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  disabled={isDisabled}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isDisabled}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-4 text-sm transition-colors disabled:opacity-50 ${
                    touched.imageUrl && errors.imageUrl
                      ? "border-red-500/50 bg-red-500/5 text-red-300"
                      : "border-white/20 bg-white/5 text-slate-400 hover:border-emerald-500/60 hover:text-slate-200"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {imageFile ? imageFile.name : "Click to browse image"}
                </button>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  PNG, JPG, WEBP — max {MAX_IMAGE_SIZE_MB} MB.
                </p>
                {touched.imageUrl && <FieldError message={errors.imageUrl} />}
              </>
            )}

            {/* Preview */}
            {imagePreview && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-20 w-20 rounded-xl object-cover border border-white/10"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Preview</p>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl(null);
                      setImagePreview(null);
                      setImageFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Editable: Price + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-200">
                Price per unit (Rs.) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={price ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  setPrice(val);
                  if (touched.price) setErrors(validate({ ...currentFields(), price: val }));
                }}
                onBlur={() => touch("price")}
                disabled={isDisabled}
                placeholder="0.00"
                className={inputClass("price")}
              />
              {touched.price && <FieldError message={errors.price} />}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200">
                Stock quantity <span className="text-red-400">*</span>
              </label>
              <input
  type="number"
  min={1}
  step="1"
  value={stock ?? ""}
  onChange={(e) => {
    const val = e.target.value === "" ? null : Number(e.target.value);
    setStock(val);

    if (touched.stock) {
      setErrors(validate({ ...currentFields(), stock: val }));
    }
  }}
  onBlur={() => touch("stock")}
  disabled={isDisabled}
  placeholder="1"
  className={inputClass("stock")}
/>

              {touched.stock && <FieldError message={errors.stock} />}
            </div>
          </div>

          {/* Global error hint */}
          {Object.values(touched).some(Boolean) && hasErrors && (
            <p className="text-xs text-red-400 text-center">
              Please fix the errors above before saving.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isDisabled}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {isDisabled ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              disabled={isDisabled}
              className="flex-1 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-slate-100 hover:border-white/40 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- LOCKED FIELD ---------- */
const LockedField: React.FC<{ label: string; value: string; hint: string }> = ({ label, value, hint }) => (
  <div>
    <label className="block text-xs font-medium text-slate-200">{label}</label>
    <input
      type="text"
      value={value}
      disabled
      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 outline-none"
    />
    <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
  </div>
);

export default EditProductPage;