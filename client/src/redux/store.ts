import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/authSlice";
import discoverSlice from "./features/discoverSlice";
import participatingSlice from "./features/participatingSlice";
import userIdSlice from "./features/userIdSlice";

export const store = configureStore({
  reducer: {
    authSlice,
    discoverSlice,
    participatingSlice,
    userIdSlice,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
