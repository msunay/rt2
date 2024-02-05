import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { backendApi } from '@/services/backendApi';
import userSlice from './features/userSlice';
import userIdSlice from './features/userIdSlice';
import questionSlice from './features/questionSlice';

export const store = configureStore({
  reducer: {
    [backendApi.reducerPath]: backendApi.reducer,
    userSlice,
    userIdSlice,
    questionSlice,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(backendApi.middleware),

  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
