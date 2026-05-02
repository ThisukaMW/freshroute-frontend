import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { addItemToCart, removeItemFromCart, updateCartItemQuantity } from "../../api/endpoints/cart";

export interface CartItem {
  sellerId: any;
  id: string;
  productId: string;
  name: string;
  category?: string;
  price: string | number;
  unit: string;
  quantity: number;
  imageUrl?: string;
  vendor?: string;
  requirements?: string;
}

export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk to add item to cart (updates both Redux + DB)
export const addItemAsync = createAsyncThunk(
  "cart/addItem",
  async (
    { productId, quantity, sellerId }: { productId: string; quantity: number; sellerId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await addItemToCart(productId, quantity, sellerId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add item");
    }
  }
);

// Async thunk to remove item from cart (updates both Redux + DB)
export const removeItemAsync = createAsyncThunk(
  "cart/removeItem",
  async (productId: string, { rejectWithValue }) => {
    try {
      await removeItemFromCart(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to remove item");
    }
  }
);

// Async thunk to update quantity (updates both Redux + DB)
export const updateQuantityAsync = createAsyncThunk(
  "cart/updateQuantity",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      await updateCartItemQuantity(productId, quantity);
      return { productId, quantity };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update quantity");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Instant local updates (for optimistic UI)
    addItemLocal(state, action: PayloadAction<CartItem>) {
      const incoming = action.payload;
      const existing = state.items.find((i) => i.productId === incoming.productId);
      if (existing) {
        existing.quantity += incoming.quantity;
      } else {
        state.items.push(incoming);
      }
    },
    removeItemLocal(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    updateQuantityLocal(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateQuantityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantityAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateQuantityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addItemLocal, removeItemLocal, updateQuantityLocal, setCartItems, clearCart } =
  cartSlice.actions;
  
export default cartSlice.reducer;
