import type { HostVideoStreamStateAction } from '@/reducers/hostVideoStreamStateReducer';
import type { UserStreamStateAction } from '@/reducers/userStreamStateReducer';
import type {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '@/types/QuizSocketTypes';
import type { Dispatch } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

export const QUESTION_TIME = process.env.NODE_ENV === 'test' ? 0 : 7000;

const BASE_URL: string =
  process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL || ''
    : process.env.EXPO_PUBLIC_LOCAL_IP || '';

const quiz: Socket<QuizServerToClientEvents, QuizClientToServerEvents> = io(
  `${BASE_URL}quizspace`,
);

export const quizSocketService = {
  successListener: (quizId: string) =>
    quiz.on('connection_success', ({ socketId }) => {
      console.log('quiz socket connected: ', socketId);
      quiz.emit('join_room', { roomId: quizId });
      console.log('client roomId:', quizId);
    }),

  successListenerOff: () =>
    quiz.off('connection_success', () => {
      console.log('quiz socket connection_success listener off');
    }),

  startTimerListener: (
    dispatchState?: Dispatch<HostVideoStreamStateAction>,
    dispatchUserState?: Dispatch<UserStreamStateAction>,
  ) =>
    quiz.on('start_question_timer', () => {
      if (dispatchState) dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: false });
      if (dispatchUserState) {
        dispatchUserState({ type: 'SET_US_Q_HIDDEN', payload: false });
      }
    }),

  startTimerListenerOff: () => quiz.off('start_question_timer', () => {
    console.log('quiz socket start_question_timer listener off');
  }),

  startQuizListener: (dispatchState: Dispatch<UserStreamStateAction>) =>
    quiz.on('start_quiz', () => {
      console.log('start_quiz listener!!!!!!!!!!');
      dispatchState({ type: 'SET_US_QUIZ_STARTED', payload: true });
    }),

  startQuizListenerOff: () =>
    quiz.off('start_quiz', () => {
      console.log('quiz socket start_quiz listener off');
    }),

  revealListener: (dispatchState: Dispatch<UserStreamStateAction>) => {
    quiz.on('reveal_answers', () => {
      setTimeout(() => {
        dispatchState({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
        dispatchState({ type: 'SET_US_Q_HIDDEN', payload: true });
      }, 2000);
    });
  },

  revealListenerOff: () =>
    quiz.off('reveal_answers', () => {
      console.log('quiz socket reveal_answers listener off');
    }),

  emitNextQ: (roomId: string) => quiz.emit('next_question', { roomId }),

  emitHostStartQuiz: (roomId: string) => {console.log('roomId client::', roomId); quiz.emit('host_start_quiz', { roomId })},

  emitShowWinners: (roomId: string) => quiz.emit('show_winners', { roomId }),

  revealAnswerHostListener: (dispatchState: Dispatch<HostVideoStreamStateAction>) => {
    quiz.on('reveal_answers_host', () => {
      setTimeout(() => {
        dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: true });
      }, 2000);
    });
  },

  revealAnswerHostListenerOff: () =>
    quiz.off('reveal_answers_host', () => {
      console.log('quiz socket reveal_answers_host listener off');
    }),

  hostWinnersListener: (dispatchState: Dispatch<HostVideoStreamStateAction>) => {
    quiz.on('host_winners', () => {
      console.log('HOST WINNERS RECEIVED');
      dispatchState({ type: 'INCREMENT_HVS_TRIGGER', payload: undefined });
    });
  },

  hostWinnersListenerOff: () =>
    quiz.off('host_winners', () => {
      console.log('quiz socket host_winners listener off');
    }),

  playerWinnersListener: (dispatchState: Dispatch<UserStreamStateAction>) => {
    quiz.on('player_winners', () => {
      console.log('PLAYER WINNERS RECEIVED');
      dispatchState({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
    });
  },

  playerWinnersListenerOff: () =>
    quiz.off('player_winners', () => {
      console.log('quiz socket player_winners listener off');
    }),

};
