import type { Quiz } from '@/types/Types';
import { sortQuizzes } from '@/utils/helpers';
import { createSlice } from '@reduxjs/toolkit';

interface quizzesState {
  allQuizzes: Quiz[];
  privateQuizzes: Quiz[];
  publicQuizzes: Quiz[];
  isFetchingQuizzes: boolean;
}

const initialState: quizzesState = {
  allQuizzes: [],
  publicQuizzes: [],
  privateQuizzes: [],
  isFetchingQuizzes: false,
};

export const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    setQuizzes: (state, { payload }: { payload: Quiz[] }) => {
      const sortedQuizList = sortQuizzes(payload);
      state.allQuizzes = sortedQuizList;
      state.publicQuizzes = sortedQuizList.filter(quiz => !quiz.isPrivate);
      state.privateQuizzes = sortedQuizList.filter(quiz => quiz.isPrivate);
    },
    addQuiz: (state, { payload }: { payload: Quiz }) => {
      const sortedNewQuizList = sortQuizzes([...state.allQuizzes, payload]);
      state.allQuizzes = sortedNewQuizList;
      state.publicQuizzes = sortedNewQuizList.filter(quiz => !quiz.isPrivate);
      state.privateQuizzes = sortedNewQuizList.filter(quiz => quiz.isPrivate);
    },
    removeQuiz: (state, { payload }: { payload: string }) => {
      const newQuizList = state.allQuizzes.filter(quiz => quiz.id !== payload);
      state.allQuizzes = newQuizList;
      state.publicQuizzes = newQuizList.filter(quiz => !quiz.isPrivate);
      state.privateQuizzes = newQuizList.filter(quiz => quiz.isPrivate);
    },
    // setRefetch: (state, { payload }: { payload: RefetchQuizzes }) => {
    //   state.refetchAllQuizzes = payload;
    // },
    setIsFetching: (state, { payload }: { payload: boolean }) => {
      state.isFetchingQuizzes = payload;
    },
  },
});

export const { setQuizzes, addQuiz, removeQuiz, /* setRefetch, */ setIsFetching } =
  quizzesSlice.actions;

export default quizzesSlice.reducer;
