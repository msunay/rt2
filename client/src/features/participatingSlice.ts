import { UserParticipations } from '@/types/Types';
import { createSlice } from '@reduxjs/toolkit';

interface participatingState {
  value: UserParticipations;
}

const initialState: participatingState = {
  value: {} as UserParticipations,
};

export const participatingSlice = createSlice({
  name: 'participating',
  initialState,
  reducers: {
    setParticipatingList: (state, { payload }: { payload: UserParticipations }) => {
      state.value = payload;
    },
  },
});

export const { setParticipatingList } = participatingSlice.actions;

export default participatingSlice.reducer;
