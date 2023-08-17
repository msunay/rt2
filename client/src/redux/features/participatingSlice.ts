"use client";

import { Participation } from "@/Types";
import { createSlice } from "@reduxjs/toolkit";

interface participatingState {
  value: Participation[];
}

const initialState: participatingState = {
  value: [],
};

export const participatingSlice = createSlice({
  name: "participating",
  initialState,
  reducers: {
    setParticipatingList: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setParticipatingList } = participatingSlice.actions;

export default participatingSlice.reducer;
