import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [
    {
      id: "prod-apple",
      name: "Red Apple",
      category: "Fruits",
      pricePerUnit: 200,
      unit: "kg",
      stock: 30,
      status: "active",
    },
    {
      id: "prod-tomato",
      name: "Tomato",
      category: "Vegetables",
      pricePerUnit: 180,
      unit: "kg",
      stock: 6,
      status: "active",
    },
    {
      id: "prod-mango",
      name: "Mango",
      category: "Fruits",
      pricePerUnit: 300,
      unit: "kg",
      stock: 0,
      status: "inactive",
    },
    {
      id: "prod-spinach",
      name: "Spinach",
      category: "Vegetables",
      pricePerUnit: 100,
      unit: "bunch",
      stock: 10,
      status: "active",
    },
    {
      id: "prod-milk",
      name: "Fresh Milk",
      category: "Dairy",
      pricePerUnit: 150,
      unit: "L",
      stock: 20,
      status: "active",
    },
    {
      id: "prod-bread",
      name: "Brown Bread",
      category: "Bakery",
      pricePerUnit: 120,
      unit: "loaf",
      stock: 15,
      status: "active",
    },
    {
      id: "prod-carrot",
      name: "Carrot",
      category: "Vegetables",
      pricePerUnit: 160,
      unit: "kg",
      stock: 25,
      status: "active",
    },
  ],
};

const sellerProductsSlice = createSlice({
  name: "sellerProducts",
  initialState,
  reducers: {
    addProduct(state, action) {
      const product = action.payload;
      state.products.push({
        ...product,
        id: product.id || `prod-${Date.now()}`,
        status: product.status || "pending",
      });
    },
    updateProduct(state, action) {
      const { id, changes } = action.payload;
      const existing = state.products.find((p) => p.id === id);
      if (existing) {
        Object.assign(existing, changes);
      }
    },
    toggleStatus(state, action) {
      const id = action.payload;
      const existing = state.products.find((p) => p.id === id);
      if (existing) {
        existing.status = existing.status === "active" ? "inactive" : "active";
      }
    },
  },
});

export const { addProduct, updateProduct, toggleStatus } = sellerProductsSlice.actions;
export default sellerProductsSlice.reducer;


