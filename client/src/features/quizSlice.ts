import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Interface for quiz state
 * Responsible for quiz flow and game state
 */
export interface QuizState {
  quizId: string | null;
  quizStarted: boolean;
  currentQuestionNumber: number;
  questionHidden: boolean;
  trigger: number;
}

/**
 * Initial quiz state
 */
const initialState: QuizState = {
  quizId: null,
  quizStarted: false,
  currentQuestionNumber: 1,
  questionHidden: true,
  trigger: 0
};

/**
 * Quiz slice for Redux
 * Handles actions related to quiz flow and game state
 */
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    // Set quiz ID
    setQuizId: (state, action: PayloadAction<string | null>) => {
      state.quizId = action.payload;
    },
    
    // Set quiz started status
    setQuizStarted: (state, action: PayloadAction<boolean>) => {
      state.quizStarted = action.payload;
    },
    
    // Question navigation
    incrementQuestionNumber: (state) => {
      state.currentQuestionNumber += 1;
    },
    setCurrentQuestionNumber: (state, action: PayloadAction<number>) => {
      state.currentQuestionNumber = action.payload;
    },
    
    // Question visibility
    setQuestionHidden: (state, action: PayloadAction<boolean>) => {
      state.questionHidden = action.payload;
    },
    
    // Trigger updates (for forcing re-renders)
    incrementTrigger: (state) => {
      state.trigger += 1;
    },
    
    // Reset quiz state
    resetQuizState: () => initialState
  }
});

// Export actions
export const {
  setQuizId,
  setQuizStarted,
  incrementQuestionNumber,
  setCurrentQuestionNumber,
  setQuestionHidden,
  incrementTrigger,
  resetQuizState
} = quizSlice.actions;

// Export reducer
export default quizSlice.reducer;