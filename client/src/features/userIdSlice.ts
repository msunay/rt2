import { ResponseUser } from "@/types/Types";
import { createSlice } from "@reduxjs/toolkit";

interface userIdState {
  id: string;
  username: string;
}

const initialState: userIdState = {
  id: "",
  username: ''
};

export const userIdSlice = createSlice({
  name: "userId",
  initialState,
  reducers: {
    setUserId: (state, { payload }: { payload: ResponseUser }) => {
      state.id = payload.id;
      state.username = payload.username;
    },
  },
});

export const { setUserId } = userIdSlice.actions;

export default userIdSlice.reducer;