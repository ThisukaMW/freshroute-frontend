// import { createSlice } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

// export interface CartItem {
//   id: string;
//   name: string;
//   vendor: string;
//   price: string | number;
//   unit: string;
//   quantity: number;
//   requirements?: string;
// }

// export interface CartState {
//   items: CartItem[];
// }

// const initialState: CartState = {
//   items: [],
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addItem(state, action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>) {
//       const incoming = action.payload;
//       const qtyToAdd = incoming.quantity && incoming.quantity > 0 ? incoming.quantity : 1;
//       const existing = state.items.find((i) => i.id === incoming.id);
//       if (existing) {
//         existing.quantity += qtyToAdd;
//       } else {
//         state.items.push({ ...incoming, quantity: qtyToAdd });
//       }
//     },
//     removeItem(state, action: PayloadAction<string>) {
//       const id = action.payload;
//       state.items = state.items.filter((i) => i.id !== id);
//     },
//     clearCart(state) {
//       state.items = [];
//     },
//   },
// });

// export const { addItem, removeItem, clearCart } = cartSlice.actions;
// export default cartSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;         // composite id for cart uniqueness
  productId: string;  // real DB product id for orders
  name: string;
  vendor: string;
  price: string | number;
  unit: string;
  quantity: number;
  requirements?: string;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(
      state,
      action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>
    ) {
      const incoming = action.payload;
      const qtyToAdd =
        incoming.quantity && incoming.quantity > 0 ? incoming.quantity : 1;
      const existing = state.items.find((i) => i.id === incoming.id);
      if (existing) {
        existing.quantity += qtyToAdd;
      } else {
        state.items.push({ ...incoming, quantity: qtyToAdd });
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
