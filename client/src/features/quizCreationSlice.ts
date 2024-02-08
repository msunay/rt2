import { QuizQuestionAnswer, FullQuizState } from '@/types/Types';
import { createSlice } from '@reduxjs/toolkit';
import { formatISO } from 'date-fns';

const initialState: FullQuizState = {
  quizName: '',
  quizOwner: '',
  category: '',
  dateTime: formatISO(new Date()),
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
          dateTime: Date;
        };
      }
    ) => {
      state.quizName = payload.quizName;
      state.quizOwner = payload.quizOwner;
      state.category = payload.category;
      state.dateTime = formatISO(payload.dateTime);
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
  },
});

export const { addQuestionWithAnswers, addQuizData } =
  quizCreationSlice.actions;

export default quizCreationSlice.reducer;
