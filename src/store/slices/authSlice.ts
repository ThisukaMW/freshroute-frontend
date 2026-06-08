// authSlice.ts
// Stores the logged-in user's basic info and token in Redux (the app's shared memory).
// Two actions: save login data, and clear it on logout.

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Shape of the auth state: either null (logged out) or the user + token.
interface AuthState {
  user: { id: string; email: string; name: string } | null;
  token: string | null;
}

// Start with no user and no token — nobody is logged in yet.
const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    // Saves the user object and token into Redux state.
    // Called right after a successful login or registration.
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthState["user"]; token: string }>
    ) {
      state.user  = action.payload.user;
      state.token = action.payload.token;
    },

    // Wipes the user and token from Redux state.
    // Called when the user logs out.
    clearCredentials(state) {
      state.user  = null;
      state.token = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;