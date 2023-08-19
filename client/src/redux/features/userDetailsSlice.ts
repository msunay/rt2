'use client';

import { User } from '@/Types/Types';
import { createSlice } from '@reduxjs/toolkit';

interface userDetailsState {
  value: User;
}

const initialState: userDetailsState = {
  value: {} as User,
};

export const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setUserDetails } = userDetailsSlice.actions;

export default userDetailsSlice.reducer;
