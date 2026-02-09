import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import sellerProductsReducer from "./slices/sellerProductsSlice"
import ordersReducer from "./slices/ordersSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        sellerProducts: sellerProductsReducer,
        orders: ordersReducer,
    },
});