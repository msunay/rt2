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
  successListener: () =>
    quiz.on('connection_success', ({ socketId }) => {
      console.log('quiz socket connected: ', socketId);
    }),

  startTimerListener: (
    dispatchState?: Dispatch<HostVideoStreamStateAction>,
    dispatchUserState?: Dispatch<UserStreamStateAction>
  ) =>
    quiz.on('start_question_timer', () => {
      if (dispatchState) dispatchState({type: 'SET_HVS_Q_HIDDEN', payload: false})
      if (dispatchUserState) dispatchUserState({type: 'SET_US_Q_HIDDEN', payload: false})
      // setQuestionHidden(false);
      // document.getElementById('countdown-canvas')!.hidden = false;
      startTimer();
    }),
  startQuizListener: (dispatchState: Dispatch<UserStreamStateAction>) =>
    quiz.on('start_quiz', () => {
      dispatchState({type: 'SET_US_QUIZ_STARTED', payload: true})
      // setQuizStarted(true);
      // document.getElementById('countdown-canvas')!.hidden = false;
      startTimer();
    }),

  revealListener: (
    dispatchState: Dispatch<UserStreamStateAction>
  ) => {
    quiz.on('reveal_answers', () => {
      console.log('reveal');
      // document
      //   .querySelectorAll('button[name="a"]')
      //   //@ts-ignore
      //   .forEach((btn, i) => (btn.disabled = true));

      setTimeout(() => {
        dispatchState({type: 'INCREMENT_US_TRIGGER'})
        dispatchState({type: 'SET_US_Q_HIDDEN', payload: true})
        // setTrigger(trigger => trigger + 1);
        // setQuestionHidden(true);
        // document.getElementById('countdown-canvas')!.hidden = true;
      }, 2000);
    });
  },

  emitNextQ: () => quiz.emit('next_question'),

  emitHostStartQuiz: () => quiz.emit('host_start_quiz'),

  emitShowWinners: () => quiz.emit('show_winners'),

  revealAnswerHostListener: (
    dispatchState: Dispatch<HostVideoStreamStateAction>,
  ) => {
    quiz.on('reveal_answers_host', () => {
      console.log('reveal');

      setTimeout(() => {
        dispatchState({type: 'SET_HVS_Q_HIDDEN', payload: true})
        // setQuestionHidden(true);
        // document.getElementById('countdown-canvas')!.hidden = true;
      }, 2000);
    });
  },

  hostWinnersListener: (dispatchState: Dispatch<HostVideoStreamStateAction>) => {
    quiz.on('host_winners', () => {
      console.log('HOST WINNERS RECEIVED');
      dispatchState({type: 'INCREMENT_HVS_TRIGGER', payload: undefined})
      // setTrigger(num => num + 1);
    });
  },

  playerWinnersListener: (dispatchState: Dispatch<UserStreamStateAction>) => {
    quiz.on('player_winners', () => {
      console.log('PLAYER WINNERS RECEIVED');
      dispatchState({ type: 'INCREMENT_US_TRIGGER' })
      // setTrigger(num => {
      //   console.log('TRIGGER BEFORE +1::', num);
      //   return num + 1;
      // });
    });
  },
};

export function startTimer() {
  // const pickColorByPercentage = (percentage: any, time: any) => {
  //   switch (true) {
  //     case percentage >= 75:
  //       return '#28a745'; // green
  //     case percentage >= 50 && percentage < 75:
  //       return '#17a2b8'; // blue
  //     case percentage >= 25 && percentage < 50:
  //       return '#ffc107'; // orange
  //     default:
  //       return '#dc3545'; // red
  //   }
  // };
  // new CanvasCircularCountdown(document.getElementById('countdown-canvas'), {
  //   duration: QUESTION_TIME,
  //   radius: 40,
  //   clockwise: true,
  //   captionColor: pickColorByPercentage,
  //   progressBarWidth: 15,
  //   progressBarOffset: 0,
  //   circleBackgroundColor: '#f5f5f5',
  //   emptyProgressBarBackgroundColor: '#b9c1c7',
  //   filledProgressBarBackgroundColor: '#17a2b8',
  //   captionFont: '22px serif',
  //   showCaption: true,
  // }).start();
}
