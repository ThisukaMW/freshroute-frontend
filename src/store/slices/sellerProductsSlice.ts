import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  getSellerInventory,
  type ProductInventory,
} from "../../api/endpoints/inventory";
import { updateSellerProduct } from "../../api/endpoints/products";

// ---------------- TYPES ----------------
type SellerProductsState = {
  products: ProductInventory[];
  loading: boolean;
  error: string | null;
};

// ---------------- INITIAL STATE ----------------
const initialState: SellerProductsState = {
  products: [],
  loading: false,
  error: null,
};

// ---------------- THUNKS ----------------

// Fetch products
export const fetchSellerProducts = createAsyncThunk<
  ProductInventory[], // return type
  void,               // argument type
  { rejectValue: string }
>(
  "sellerProducts/fetchSellerProducts",
  async (_, { rejectWithValue }) => {
    try {
      const products = await getSellerInventory();
      return products;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch products");
    }
  }
);

// Update product
// Sellers can only edit: price, stock, imageUrl
type EditableProductFields = {
  price?: number;
  stock?: number;
  imageUrl?: string | null;
};

export const updateProduct = createAsyncThunk<
  { productId: string; updatedProduct: ProductInventory },
  { productId: string; productData: EditableProductFields },
  { rejectValue: string }
>(
  "sellerProducts/updateProduct",
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const updatedProduct = await updateSellerProduct(
        productId,
        productData
      );
      return { productId, updatedProduct };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to update product");
    }
  }
);

// ---------------- SLICE ----------------
const sellerProductsSlice = createSlice({
  name: "sellerProducts",
  initialState,
  reducers: {
    // ⚠️ Frontend-only (temporary)
    toggleStatus: (state, action: PayloadAction<string>) => {
      const product = state.products.find(
        (p) => p.id === action.payload
      );
      if (product) {
        product.status =
          product.status === "active" ? "inactive" : "active";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- FETCH PRODUCTS --------
      .addCase(fetchSellerProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSellerProducts.fulfilled,
        (state, action: PayloadAction<ProductInventory[]>) => {
          state.loading = false;
          state.products = action.payload;
        }
      )
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      // -------- UPDATE PRODUCT --------
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProduct.fulfilled,
        (
          state,
          action: PayloadAction<{
            productId: string;
            updatedProduct: ProductInventory;
          }>
        ) => {
          state.loading = false;

          const index = state.products.findIndex(
            (p) => p.id === action.payload.productId
          );

          if (index !== -1 && action.payload.updatedProduct) {
            state.products[index] = {
              ...state.products[index],
              ...action.payload.updatedProduct,
            };
          }
        }
      )
      .addCase(
        updateProduct.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message || "Update failed";
        }
      );
  },
});

// ---------------- EXPORTS ----------------
export const { toggleStatus } = sellerProductsSlice.actions;
export default sellerProductsSlice.reducer;