import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSellerProduct } from "../../api/endpoints/products";
import { useAuth } from "../../hooks/useAuth";

/* ---------- VALIDATION ---------- */
interface FormErrors {
  name?: string;
  category?: string;
  unit?: string;
  description?: string;
  price?: string;
  stock?: string;
  image?: string;
}

const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validate(fields: {
  name: string;
  category: string;
  unit: string;
  description: string;
  price: number;
  stock: number;
  image: File | null;
}): FormErrors {
  const errors: FormErrors = {};

  if (!fields.name.trim()) {
    errors.name = "Product name is required.";
  } else if (fields.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (fields.name.trim().length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  if (!fields.category.trim()) {
    errors.category = "Please select a category.";
  }

  if (!fields.unit.trim()) {
    errors.unit = "Please select a unit.";
  }

  if (fields.description.length > 500) {
    errors.description = "Description must be 500 characters or fewer.";
  }

  if (String(fields.price) === "" || fields.price === 0) {
    errors.price = "Price is required.";
  } else if (isNaN(fields.price) || fields.price <= 0) {
    errors.price = "Price must be greater than 0.";
  } else if (fields.price > 1_000_000) {
    errors.price = "Price seems too high. Please double-check.";
  }

  if (fields.stock === -1 || String(fields.stock) === "") {
    errors.stock = "Stock quantity is required.";
  } else if (!Number.isInteger(fields.stock) || fields.stock <= 0) {
    errors.stock = "Stock must be a whole number greater than 0.";
  } else if (fields.stock > 100_000) {
    errors.stock = "Stock quantity seems too high. Please double-check.";
  }

  if (fields.image) {
    if (!ALLOWED_IMAGE_TYPES.includes(fields.image.type)) {
      errors.image = "Only JPEG, PNG, WebP, or GIF images are allowed.";
    } else if (fields.image.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      errors.image = `Image must be under ${MAX_IMAGE_SIZE_MB} MB.`;
    }
  }

  return errors;
}

/* ---------- FIELD ERROR ---------- */
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-xs text-red-400">{message}</p> : null;

/* ---------- CUSTOM SELECT ---------- */
interface SelectOption { label: string; value: string }

const CustomSelect: React.FC<{
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  hasError: boolean;
}> = ({ value, options, placeholder, onChange, onBlur, hasError }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onBlur]);

  const selected = options.find((o) => o.value === value);

  const triggerBorder = hasError ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.1)";

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((o) => !o); }}
        style={{
          marginTop: "4px",
          width: "100%",
          borderRadius: "0.75rem",
          border: `1px solid ${triggerBorder}`,
          background: "rgba(255,255,255,0.05)",
          padding: "8px 12px",
          fontSize: "0.875rem",
          color: hasError ? "#fca5a5" : "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          outline: "none",
          transition: "border-color 0.15s",
        }}
      >
        <span className={selected ? "text-slate-100" : "text-slate-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-[#0f1117] shadow-xl overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); onBlur(); }}
              className={`px-3 py-2.5 text-sm cursor-pointer transition
                ${opt.value === value
                  ? "bg-emerald-600/20 text-emerald-300"
                  : "text-slate-300 hover:bg-white/5"
                }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- CONSTANTS ---------- */
const CATEGORIES: SelectOption[] = [
  { value: "Fruits", label: "🍎  Fruits" },
  { value: "Vegetables", label: "🥦  Vegetables" },
  { value: "Dairy", label: "🧀  Dairy" },
  { value: "Bakery", label: "🍞  Bakery" },
];

const UNITS: SelectOption[] = [
  { value: "kg", label: "kg — Kilogram" },
  { value: "piece", label: "piece — Per item" },
  { value: "pack", label: "pack — Per pack" },
  { value: "bunch", label: "bunch — Per bunch" },
];

/* ---------- COMPONENT ---------- */
const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      alert("You must be logged in as a seller to add products");
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [unit, setUnit] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [description, setDescription] = useState("");

  // Single image
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  /* ---------- HELPERS ---------- */
  const currentFields = () => ({
    name,
    category,
    unit,
    description,
    price: price === "" ? 0 : (price as number),
    stock: stock === "" ? -1 : (stock as number),
    image,
  });

  const touch = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(currentFields()));
  };

  /* ---------- IMAGE UPLOAD ---------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    const errs = validate({ ...currentFields(), image: file });
    setErrors((prev) => ({ ...prev, image: errs.image }));
    setTouched((prev) => ({ ...prev, image: true }));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({
      name: true, category: true, unit: true,
      description: true, price: true, stock: true, image: true,
    });

    const validationErrors = validate(currentFields());
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", category.trim());
      formData.append("description", description);
      formData.append("price", String(price));
      formData.append("unit", unit);
      formData.append("stock", String(stock));
      if (image) formData.append("images", image);

      const response = await createSellerProduct(formData);
      console.log("✅ Product created:", response);
      alert("Product created successfully!");
      navigate("/seller/products");
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error?.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 transition ${
      touched[field] && errors[field]
        ? "border-red-500/70 bg-red-500/5 focus:ring-red-500/40"
        : "border-white/10 bg-white/5 focus:ring-emerald-500/60"
    }`;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 px-4">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold text-slate-50">Add New Product</h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
        >
          {/* NAME */}
          <div>
            <label className="text-xs text-slate-200">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (touched.name) setErrors(validate({ ...currentFields(), name: e.target.value }));
              }}
              onBlur={() => touch("name")}
              placeholder="e.g. Red Apple"
              className={inputClass("name")}
              maxLength={101}
            />
            {touched.name && <FieldError message={errors.name} />}
            <p className="mt-0.5 text-right text-[10px] text-slate-500">{name.length}/100</p>
          </div>

          {/* IMAGE — single */}
          <div>
            <label className="text-xs text-slate-200">
              Product Image{" "}
              <span className="text-slate-500">(1 image, max {MAX_IMAGE_SIZE_MB} MB)</span>
            </label>

            {!imagePreview ? (
              <label
                className={`mt-2 flex flex-col items-center justify-center gap-1 h-32 w-full rounded-xl border-2 border-dashed cursor-pointer transition
                  ${touched.image && errors.image
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-white/10 bg-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                  }`}
              >
                <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-slate-400">Click to upload image</span>
                <span className="text-[10px] text-slate-600">JPEG, PNG, WebP or GIF</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="mt-2 relative inline-block group">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-32 w-32 rounded-xl object-cover border border-white/10"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            )}

            {touched.image && <FieldError message={errors.image} />}
          </div>

          {/* CATEGORY + UNIT — custom dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-200">
                Category <span className="text-red-400">*</span>
              </label>
              <CustomSelect
                value={category}
                options={CATEGORIES}
                placeholder="Select category"
                onChange={(val) => {
                  setCategory(val);
                  if (touched.category) setErrors(validate({ ...currentFields(), category: val }));
                }}
                onBlur={() => touch("category")}
                hasError={!!(touched.category && errors.category)}
              />
              {touched.category && <FieldError message={errors.category} />}
            </div>

            <div>
              <label className="text-xs text-slate-200">
                Unit <span className="text-red-400">*</span>
              </label>
              <CustomSelect
                value={unit}
                options={UNITS}
                placeholder="Select unit"
                onChange={(val) => {
                  setUnit(val);
                  if (touched.unit) setErrors(validate({ ...currentFields(), unit: val }));
                }}
                onBlur={() => touch("unit")}
                hasError={!!(touched.unit && errors.unit)}
              />
              {touched.unit && <FieldError message={errors.unit} />}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs text-slate-200">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (touched.description) setErrors(validate({ ...currentFields(), description: e.target.value }));
              }}
              onBlur={() => touch("description")}
              className={inputClass("description")}
              maxLength={501}
              placeholder="Describe your product..."
            />
            {touched.description && <FieldError message={errors.description} />}
            <p className="mt-0.5 text-right text-[10px] text-slate-500">{description.length}/500</p>
          </div>

          {/* PRICE + STOCK */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-200">
                Price (Rs.) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={price}
                onChange={(e) => {
                  const val = e.target.value === "" ? "" : Number(e.target.value);
                  setPrice(val);
                  if (touched.price)
                    setErrors(validate({ ...currentFields(), price: val === "" ? 0 : (val as number) }));
                }}
                onBlur={() => touch("price")}
                placeholder="0.00"
                className={inputClass("price")}
              />
              {touched.price && <FieldError message={errors.price} />}
            </div>

            <div>
              <label className="text-xs text-slate-200">
                Stock Quantity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                step="1"
                value={stock}
                onChange={(e) => {
                  const val = e.target.value === "" ? "" : Number(e.target.value);
                  setStock(val);
                  if (touched.stock)
                    setErrors(validate({ ...currentFields(), stock: val === "" ? -1 : (val as number) }));
                }}
                onBlur={() => touch("stock")}
                placeholder="0"
                className={inputClass("stock")}
              />
              {touched.stock && <FieldError message={errors.stock} />}
            </div>
          </div>

          {/* GLOBAL ERROR HINT */}
          {Object.values(touched).some(Boolean) && hasErrors && (
            <p className="text-xs text-red-400 text-center">
              Please fix the errors above before saving.
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary px-4 py-2 text-white font-medium hover:bg-primary-dark transition disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;