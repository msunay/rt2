"use client";

import { createSlice } from "@reduxjs/toolkit";

interface userIdState {
  value: string;
}

const initialState: userIdState = {
  value: "",
};

export const userIdSlice = createSlice({
  name: "userId",
  initialState,
  reducers: {
    setUserId: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setUserId } = userIdSlice.actions;

export default userIdSlice.reducer;
