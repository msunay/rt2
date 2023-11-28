"use client";

import { ParticipationAnswer } from "@/Types/Types";
import { createSlice } from "@reduxjs/toolkit";


const initialState: ParticipationAnswer = {
    AnswerId: '',
    ParticipationId: ''
};

export const userParticipationAnswerSlice = createSlice({
  name: "userId",
  initialState,
  reducers: {
    setUserParticipationAnswer: (state, action) => {
      state = action.payload;
    },
  },
});

export const { setUserParticipationAnswer } = userParticipationAnswerSlice.actions;

export default userParticipationAnswerSlice.reducer;