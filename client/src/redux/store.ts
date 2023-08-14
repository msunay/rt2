import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/authSlice";
import { apiUser } from './services/userApi'


export const store = configureStore({
  reducer: {
    authSlice,
    [apiUser.reducerPath]: apiUser.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([apiUser.middleware]),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;