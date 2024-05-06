import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { Action, EnhancedStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { backendApi } from '@/services/backendApi';
import userSlice from '@/features/userSlice';
import userIdSlice from '@/features/userIdSlice';
import questionSlice from '@/features/questionSlice';
import participatingSlice from '@/features/participatingSlice';
import quizCreationSlice from '@/features/quizCreationSlice';
import quizzesSlice from './features/quizzesSlice';


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
});

// export type RootState;
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
    getDefaultMiddleware().concat(
      backendApi.middleware,
    ),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
