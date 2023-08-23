/*"use client";

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getNextQuizForUser } from '../services/quizeApiService';

// Initial State
const initialState = {
  quiz: null,
  status: 'idle',
  error: null as string | null
};

// Async thunk to fetch the next quiz for a user
export const fetchNextQuiz = createAsyncThunk(
  'quizLoading/fetchNextQuiz',
  async (userId: string) => {
    const response = await getNextQuizForUser(userId);
    console.log("Thunk Response:", response);
    return response;
  }
);

// Slice Creation
const quizLoadingSlice = createSlice({
  name: 'quizLoading',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNextQuiz.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNextQuiz.fulfilled, (state, action) => {
        console.log("Fulfilled Action Payload:", action.payload);
        state.status = 'succeeded';
        state.quiz = action.payload;
      })
      .addCase(fetchNextQuiz.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || "An error occurred.";
      });
  }
});

export default quizLoadingSlice.reducer;


*/
