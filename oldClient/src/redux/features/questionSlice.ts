'use client';

import { createSlice } from '@reduxjs/toolkit';

interface QuestionNumberState {
  value: number;
}

const initialState: QuestionNumberState = {
  value: 0,
};

export const questionNumberSlice = createSlice({
  name: 'questionNumber',
  initialState,
  reducers: {
    incrementQuestionNumber: (state) => {
      state.value += 1;
    },
  },
});

export const { incrementQuestionNumber } = questionNumberSlice.actions;

export default questionNumberSlice.reducer;
