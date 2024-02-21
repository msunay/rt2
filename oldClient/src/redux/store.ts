import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/authSlice";
import discoverSlice from "./features/discoverSlice";
import participatingSlice from "./features/participatingSlice";
import userIdSlice from "./features/userIdSlice";
import userParticipationAnswerSlice from "./features/userParticipationAnswerSlice";
import userDetailsSlice from "./features/userDetailsSlice";
import questionSlice from "./features/questionSlice";

export const store = configureStore({
  reducer: {
    authSlice,
    discoverSlice,
    participatingSlice,
    userIdSlice,
    userDetailsSlice,
    userParticipationAnswerSlice,
    questionSlice
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;