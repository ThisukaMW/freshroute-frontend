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
  reservation?: {
    id: string;
    status: 'ACTIVE' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
    expiresAt: string;
  };
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
  async ({ productId, sellerId }: { productId: string; sellerId: string }, { rejectWithValue }) => {
    try {
      await removeItemFromCart(productId, sellerId);
      return { productId, sellerId };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to remove item");
    }
  }
);

// Async thunk to update quantity (updates both Redux + DB)
export const updateQuantityAsync = createAsyncThunk(
  "cart/updateQuantity",
  async (
    { productId, sellerId, quantity }: { productId: string; sellerId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      await updateCartItemQuantity(productId, sellerId, quantity);
      return { productId, sellerId, quantity };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update quantity");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ✅ FIXED: Use composite key (productId, sellerId) instead of just productId
    // This allows same product from different sellers to be separate items
    addItemLocal(state, action: PayloadAction<CartItem>) {
      const incoming = action.payload;
      
      // Find existing item with SAME productId AND sellerId
      const existing = state.items.find(
        (i) => i.productId === incoming.productId && i.sellerId === incoming.sellerId
      );
      
      if (existing) {
        // Merge quantities if same product + seller
        existing.quantity += incoming.quantity;
      } else {
        // Different seller = separate cart entry
        state.items.push(incoming);
      }
    },
    
    // ✅ FIXED: Remove only item with matching productId AND sellerId
    removeItemLocal(state, action: PayloadAction<{ productId: string; sellerId: string }>) {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && i.sellerId === action.payload.sellerId)
      );
    },
    
    // ✅ FIXED: Update only item with matching productId AND sellerId
    updateQuantityLocal(state, action: PayloadAction<{ productId: string; sellerId: string; quantity: number }>) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId && i.sellerId === action.payload.sellerId
      );
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
