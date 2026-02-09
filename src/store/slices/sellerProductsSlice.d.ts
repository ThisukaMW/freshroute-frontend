import type { ActionCreatorWithPayload, Reducer } from "@reduxjs/toolkit";

export interface SellerProduct {
  id: string;
  name: string;
  category: string;
  pricePerUnit: number;
  unit: string;
  stock: number;
  status: "active" | "inactive" | "pending" | "rejected";
}

export interface SellerProductsState {
  products: SellerProduct[];
}

export const addProduct: ActionCreatorWithPayload<
  Partial<SellerProduct> & {
    name: string;
    category: string;
    pricePerUnit: number;
    unit: string;
    stock: number;
  }
>;

export const updateProduct: ActionCreatorWithPayload<{
  id: string;
  changes: Partial<SellerProduct>;
}>;

export const toggleStatus: ActionCreatorWithPayload<string>;

declare const reducer: Reducer<SellerProductsState>;
export default reducer;

