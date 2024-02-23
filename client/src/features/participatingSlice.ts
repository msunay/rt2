import { Quiz, UserParticipations } from '@/types/Types';
import { createSlice } from '@reduxjs/toolkit';

interface participatingState {
  value: Quiz[];
  initialized: boolean;
}

const initialState: participatingState = {
  value: [],
  initialized: false
};

export const participatingSlice = createSlice({
  name: 'participating',
  initialState,
  reducers: {
    setParticipationsList: (state, { payload }: {payload: Quiz[]}) => {
      state.value = payload
      state.initialized = true
    },
    addToParticipatingList: (state, { payload }: { payload: Quiz }) => {
      state.value = [...state.value, payload];
    },
    removeFromParticipatingList: (state, { payload }: { payload: Quiz }) => {
      state.value = state.value.filter(quiz => quiz.id !== payload.id)
    },
    popFromParticipatingList: (state) => {
      state.value.pop()
    }
  },
});

export const { popFromParticipatingList, setParticipationsList, addToParticipatingList, removeFromParticipatingList } = participatingSlice.actions;

export default participatingSlice.reducer;
