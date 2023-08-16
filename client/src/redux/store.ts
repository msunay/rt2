import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/authSlice";
import discoverSlice from "./features/discoverSlice";

export const store = configureStore({
  reducer: {
    authSlice,
    discoverSlice,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
