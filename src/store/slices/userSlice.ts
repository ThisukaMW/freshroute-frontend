import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Buyer profile data
interface BuyerProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
}

// Seller profile data
interface SellerProfile {
  ownerName: string;
  email: string;
  businessName: string;
  businessAddress: string;
  phone: string;
  city: string;
}

interface UserState {
  buyerProfile: BuyerProfile | null;
  sellerProfile: SellerProfile | null;
}

const initialState: UserState = {
  buyerProfile: null,
  sellerProfile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // call this after buyer signs in or signs up
    setBuyerProfile(state, action: PayloadAction<BuyerProfile>) {
      state.buyerProfile = action.payload;
    },

    // call this after seller signs in or signs up
    setSellerProfile(state, action: PayloadAction<SellerProfile>) {
      state.sellerProfile = action.payload;
    },

    // update buyer profile fields (like when they save changes)
    updateBuyerProfile(state, action: PayloadAction<Partial<BuyerProfile>>) {
      if (state.buyerProfile) {
        state.buyerProfile = { ...state.buyerProfile, ...action.payload };
      }
    },

    // update seller profile fields
    updateSellerProfile(state, action: PayloadAction<Partial<SellerProfile>>) {
      if (state.sellerProfile) {
        state.sellerProfile = { ...state.sellerProfile, ...action.payload };
      }
    },

    // clear everything on logout
    clearUserProfile(state) {
      state.buyerProfile = null;
      state.sellerProfile = null;
    },
  },
});

export const {
  setBuyerProfile,
  setSellerProfile,
  updateBuyerProfile,
  updateSellerProfile,
  clearUserProfile,
} = userSlice.actions;

export default userSlice.reducer;