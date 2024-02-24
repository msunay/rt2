import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { composeWithDevTools } from '@redux-devtools/remote';

import { backendApi } from '@/services/backendApi';
import userSlice from '@/features/userSlice';
import userIdSlice from '@/features/userIdSlice';
import questionSlice from '@/features/questionSlice';
import participatingSlice from '@/features/participatingSlice';
import quizCreationSlice from '@/features/quizCreationSlice';

const composeEnhancers = composeWithDevTools({ realtime: true, port: 8000 });

// Define the action type for resetting the store
const RESET_ACTION_TYPE = 'logout';

const appReducer = combineReducers({
  [backendApi.reducerPath]: backendApi.reducer,
  userSlice,
  userIdSlice,
  questionSlice,
  participatingSlice,
  quizCreationSlice,
})

// This is the wrapper reducer that checks for the reset action
const rootReducer = (state: any, action: any) => {
  if (action.type === RESET_ACTION_TYPE) {
    // If the reset action is dispatched, return the initial state
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,

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
