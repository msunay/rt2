import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { Action, EnhancedStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import participatingSlice from '@/src/features/participatingSlice';
import questionSlice from '@/src/features/questionSlice';
import quizCreationSlice from '@/src/features/quizCreationSlice';
import quizzesSlice from '@/src/features/quizzesSlice';
import userIdSlice from '@/src/features/userIdSlice';
import userSlice from '@/src/features/userSlice';
import mediaStreamSlice from '@/src/features/mediaStreamSlice';
import quizSlice from '@/src/features/quizSlice';
import { backendApi } from '@/src/api/backendApi';

// Define the action type for resetting the store
const RESET_ACTION_TYPE = 'logout';

const appReducer = combineReducers({
  [backendApi.reducerPath]: backendApi.reducer,
  userSlice,
  userIdSlice,
  questionSlice,
  participatingSlice,
  quizCreationSlice,
  quizzesSlice,
  mediaStreamSlice,
  quizSlice,
});

// This is the wrapper reducer that checks for the reset action
const rootReducer = (state: ReturnType<typeof store.getState>, action: Action) => {
  if (action.type === RESET_ACTION_TYPE) {
    // If the reset action is dispatched, return the initial state

    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store: EnhancedStore = configureStore({
  reducer: rootReducer,

  devTools: process.env.NODE_ENV !== 'production',

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(backendApi.middleware),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself.
export type RootState = ReturnType<typeof rootReducer>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
