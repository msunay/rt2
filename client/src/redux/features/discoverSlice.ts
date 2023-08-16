"use client";

import { createSlice } from "@reduxjs/toolkit";
import { Quiz } from "@/Types";

interface DiscoverState {
  value: Quiz[];
}

const initialState: DiscoverState = {
  value: [],
};

export const discoverSlice = createSlice({
  name: "discover",
  initialState,
  reducers: {
    setQuizList: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setQuizList } = discoverSlice.actions;

export default discoverSlice.reducer;
