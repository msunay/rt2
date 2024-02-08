import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { composeWithDevTools } from '@redux-devtools/remote';

import { backendApi } from '@/services/backendApi';
import userSlice from '@/features/userSlice';
import userIdSlice from '@/features/userIdSlice';
import questionSlice from '@/features/questionSlice';
import participatingSlice from '@/features/participatingSlice';
import quizCreationSlice from '@/features/quizCreationSlice';

const composeEnhancers = composeWithDevTools({ realtime: true, port: 8000 });

export const store = configureStore({
  reducer: {
    [backendApi.reducerPath]: backendApi.reducer,
    userSlice,
    userIdSlice,
    questionSlice,
    participatingSlice,
    quizCreationSlice,
  },

  devTools: process.env.NODE_ENV !== 'production',

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      backendApi.middleware
    ),

  // composeEnhancers,
  // enhancers: (getDefaultEnhancers) =>
  //   getDefaultEnhancers({
  //     autoBatch: false,
  //   }),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
