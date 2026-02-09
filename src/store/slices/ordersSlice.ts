import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerId: string;
  total: number;
  items: OrderItem[];
  status: string;
  createdAt: string;
}

interface OrdersState {
  orders: Order[];
}

const initialState: OrdersState = {
  orders: [],
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    createOrder(
      state,
      action: PayloadAction<{
        customerName: string;
        customerId: string;
        total: number;
        items: OrderItem[];
      }>
    ) {
      const { customerName, customerId, total, items } = action.payload;
      state.orders.unshift({
        id: `ORD-${Date.now()}`,
        customerName,
        customerId,
        total,
        items,
        status: "On the way",
        createdAt: new Date().toISOString(),
      });
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) {
      const { id, status } = action.payload;
      const existing = state.orders.find((o) => o.id === id);
      if (existing) {
        existing.status = status;
      }
    },
  },
});

export const { createOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;