import { Quiz, UserParticipations } from '@/types/Types';
import { createSlice } from '@reduxjs/toolkit';

interface participatingState {
  value: Quiz[];
}

const initialState: participatingState = {
  value: [],
};

export const participatingSlice = createSlice({
  name: 'participating',
  initialState,
  reducers: {
    addToParticipatingList: (state, { payload }: { payload: Quiz }) => {
      state.value = [...state.value, payload];
    },
    removeFromParticipatingList: (state, { payload }: { payload: Quiz }) => {
      state.value = state.value.filter(quiz => quiz.id !== payload.id)
    }
  },
});

export const { addToParticipatingList, removeFromParticipatingList } = participatingSlice.actions;

export default participatingSlice.reducer;
