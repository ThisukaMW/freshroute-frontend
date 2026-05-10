// store/index.ts
// Creates the Redux store — the app's shared memory that every component can read from and write to.
// All the different "slices" (auth, cart, products, etc.) are combined here into one big store.

import { configureStore } from "@reduxjs/toolkit";
import authReducer           from "./slices/authSlice";
import cartReducer           from "./slices/cartSlice";
import sellerProductsReducer from "./slices/sellerProductsSlice";
import ordersReducer         from "./slices/ordersSlice";
import userReducer           from "./slices/userSlice";

// Builds the store by combining all the slice reducers into one object.
// Each key becomes a "section" of the store (e.g. store.auth, store.cart).
export const store = configureStore({
  reducer: {
    auth:           authReducer,           // Stores login token and basic user info.
    cart:           cartReducer,           // Stores what items the buyer has in their cart.
    sellerProducts: sellerProductsReducer, // Stores the seller's product list.
    orders:         ordersReducer,         // Stores order data for buyer and seller views.
    user:           userReducer,           // Stores the full buyer or seller profile.
  },
});

// RootState = the TypeScript type that describes the shape of the whole store.
// Use this when you call useSelector() in a component.
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch = the TypeScript type for the dispatch function.
// Use this when you call useDispatch() in a component so TypeScript knows what actions are valid.
export type AppDispatch = typeof store.dispatch;