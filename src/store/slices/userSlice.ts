// userSlice.ts
// Stores the buyer or seller's profile details in Redux AND in localStorage.
// localStorage means the profile survives a page refresh.

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Shape of a buyer's profile.
interface BuyerProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
}

// Shape of a seller's profile.
interface SellerProfile {
  ownerName: string;
  email: string;
  businessName: string;
  businessAddress: string;
  phone: string;
  city: string;
}

// The overall state: either a buyer profile, a seller profile, or both null.
interface UserState {
  buyerProfile: BuyerProfile | null;
  sellerProfile: SellerProfile | null;
}

// Reads the saved buyer profile from localStorage when the app first starts.
// Returns null if nothing was saved or the data is corrupted.
const loadBuyerProfile = (): BuyerProfile | null => {
  try {
    const data = localStorage.getItem('fr_buyer_profile');
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

// Reads the saved seller profile from localStorage when the app first starts.
// Returns null if nothing was saved or the data is corrupted.
const loadSellerProfile = (): SellerProfile | null => {
  try {
    const data = localStorage.getItem('fr_seller_profile');
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

// Fills the initial state from localStorage so profiles survive page refreshes.
const initialState: UserState = {
  buyerProfile:  loadBuyerProfile(),
  sellerProfile: loadSellerProfile(),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {

    // Saves a whole new buyer profile into Redux and localStorage.
    // Used right after login when the backend returns the buyer's details.
    setBuyerProfile(state, action: PayloadAction<BuyerProfile>) {
      state.buyerProfile = action.payload;
      localStorage.setItem('fr_buyer_profile', JSON.stringify(action.payload));
    },

    // Saves a whole new seller profile into Redux and localStorage.
    // Used right after login when the backend returns the seller's details.
    setSellerProfile(state, action: PayloadAction<SellerProfile>) {
      state.sellerProfile = action.payload;
      localStorage.setItem('fr_seller_profile', JSON.stringify(action.payload));
    },

    // Updates only the fields you pass in — leaves the rest of the buyer profile unchanged.
    // Used when the user edits their profile (e.g. updates just their phone number).
    updateBuyerProfile(state, action: PayloadAction<Partial<BuyerProfile>>) {
      if (state.buyerProfile) {
        state.buyerProfile = { ...state.buyerProfile, ...action.payload };
        localStorage.setItem('fr_buyer_profile', JSON.stringify(state.buyerProfile));
      }
    },

    // Updates only the fields you pass in — leaves the rest of the seller profile unchanged.
    // Used when the vendor edits their store details.
    updateSellerProfile(state, action: PayloadAction<Partial<SellerProfile>>) {
      if (state.sellerProfile) {
        state.sellerProfile = { ...state.sellerProfile, ...action.payload };
        localStorage.setItem('fr_seller_profile', JSON.stringify(state.sellerProfile));
      }
    },

    // Wipes both profiles from Redux and localStorage.
    // Called when the user logs out so no personal data is left behind.
    clearUserProfile(state) {
      state.buyerProfile  = null;
      state.sellerProfile = null;
      localStorage.removeItem('fr_buyer_profile');
      localStorage.removeItem('fr_seller_profile');
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