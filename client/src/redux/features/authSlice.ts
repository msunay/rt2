'use client';

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { AppState } from "../store";
// import { HYDRATE } from "next-redux-wrapper";

// Type for our state
interface AuthState {
  authState: boolean;
}

// Initial state
const initialState: AuthState = {
  authState: false,
};

// Actual Slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to set the authentication status
    setAuthState: (state, action) => {
      state.authState = action.payload;
    },
  }
});

export const { setAuthState } = authSlice.actions;

export default authSlice.reducer;