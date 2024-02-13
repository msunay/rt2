import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ResponseUser, User } from '@/types/Types';
import type { RootState } from '@/store';

type UserState = {
  id?: string;
  username: string;
  email: string;
  isPremiumMember: boolean;
  pointsWon: number;
};

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: '',
    username: '',
    email: '',
    isPremiumMember: false,
    pointsWon: 0,
  } as UserState,
  reducers: {
    setCurrentUser: (
      state,
      {
        payload: { id, username, email, isPremiumMember, pointsWon },
      }: PayloadAction<User>
    ) => {
      state.id = id;
      state.username = username;
      state.email = email;
      state.isPremiumMember = isPremiumMember;
      state.pointsWon = pointsWon;
    },
  },
});

export const { setCurrentUser } = userSlice.actions;

export default userSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.userSlice;
