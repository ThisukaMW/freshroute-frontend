import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface BuyerProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
}

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

// load from localStorage on app start
const loadBuyerProfile = (): BuyerProfile | null => {
  try {
    const data = localStorage.getItem('fr_buyer_profile')
    return data ? JSON.parse(data) : null
  } catch { return null }
}

const loadSellerProfile = (): SellerProfile | null => {
  try {
    const data = localStorage.getItem('fr_seller_profile')
    return data ? JSON.parse(data) : null
  } catch { return null }
}

const initialState: UserState = {
  buyerProfile: loadBuyerProfile(),
  sellerProfile: loadSellerProfile(),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setBuyerProfile(state, action: PayloadAction<BuyerProfile>) {
      state.buyerProfile = action.payload;
      localStorage.setItem('fr_buyer_profile', JSON.stringify(action.payload))
    },

    setSellerProfile(state, action: PayloadAction<SellerProfile>) {
      state.sellerProfile = action.payload;
      localStorage.setItem('fr_seller_profile', JSON.stringify(action.payload))
    },

    updateBuyerProfile(state, action: PayloadAction<Partial<BuyerProfile>>) {
      if (state.buyerProfile) {
        state.buyerProfile = { ...state.buyerProfile, ...action.payload };
        localStorage.setItem('fr_buyer_profile', JSON.stringify(state.buyerProfile))
      }
    },

    updateSellerProfile(state, action: PayloadAction<Partial<SellerProfile>>) {
      if (state.sellerProfile) {
        state.sellerProfile = { ...state.sellerProfile, ...action.payload };
        localStorage.setItem('fr_seller_profile', JSON.stringify(state.sellerProfile))
      }
    },

    clearUserProfile(state) {
      state.buyerProfile = null;
      state.sellerProfile = null;
      localStorage.removeItem('fr_buyer_profile')
      localStorage.removeItem('fr_seller_profile')
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