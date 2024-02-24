import { FullQuizState } from '@/types/Types';
import { createSlice } from '@reduxjs/toolkit';
import { formatISO } from 'date-fns';

const initialState: FullQuizState = {
  quizName: '',
  quizOwner: '',
  category: '',
  dateTime: formatISO(new Date()),
  isPrivate: true,
  Questions: [],
};

export const quizCreationSlice = createSlice({
  name: 'quizCreation',
  initialState,
  reducers: {
    addQuizData: (
      state,
      {
        payload,
      }: {
        payload: {
          quizName: string;
          quizOwner: string;
          category: string;
          dateTime: string;
          isPrivate: boolean;
          pin?: string;
        };
      }
    ) => {
      state.quizName = payload.quizName;
      state.quizOwner = payload.quizOwner;
      state.category = payload.category;
      state.dateTime = payload.dateTime;
      state.isPrivate = payload.isPrivate;
      if (payload.pin) state.pin = payload.pin;
    },
    addQuestionWithAnswers: (
      state,
      {
        payload,
      }: {
        payload: {
          questionText: string;
          positionInQuiz: number;
          Answers: {
            answerText: string;
            isCorrect: boolean;
          }[];
        };
      }
    ) => {
      state.Questions = [...state.Questions, payload];
    },
    resetQuizStore: (state => {
      state = initialState;
    })
  },
});

export const { addQuestionWithAnswers, addQuizData, resetQuizStore } =
  quizCreationSlice.actions;

export default quizCreationSlice.reducer;
