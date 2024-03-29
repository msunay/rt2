import { Socket, io } from 'socket.io-client';
import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '@/types/QuizSocketTypes';
import CanvasCircularCountdown from 'canvas-circular-countdown';


export const QUESTION_TIME = process.env.NODE_ENV === 'test' ? 0 : 2000;

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL
    : 'http://192.168.0.215:3001/';

const quiz: Socket<QuizServerToClientEvents, QuizClientToServerEvents> = io(
  `${BASE_URL}quizspace`
);

export const quizSocketService = {
  successListener: () =>
    quiz.on('connection_success', ({ socketId }) => {
      console.log('quiz socket connected: ', socketId);
    }),

  startTimerListener: (
    setQuestionHidden: React.Dispatch<React.SetStateAction<boolean>>
  ) =>
    quiz.on('start_question_timer', () => {
      setQuestionHidden(false);
      // document.getElementById('countdown-canvas')!.hidden = false;
      startTimer();
    }),
  startQuizListener: (
    setQuizStarted: React.Dispatch<React.SetStateAction<boolean>>
  ) =>
    quiz.on('start_quiz', () => {
      setQuizStarted(true);
      // document.getElementById('countdown-canvas')!.hidden = false;
      startTimer();
    }),

  revealListener: (
    setQuestionHidden: React.Dispatch<React.SetStateAction<boolean>>,
    setTrigger: React.Dispatch<React.SetStateAction<number>>
  ) => {
    quiz.on('reveal_answers', () => {
      console.log('reveal');
      // document
      //   .querySelectorAll('button[name="a"]')
      //   //@ts-ignore
      //   .forEach((btn, i) => (btn.disabled = true));

      setTimeout(() => {
        setTrigger((trigger) => trigger + 1);
        setQuestionHidden(true);
        // document.getElementById('countdown-canvas')!.hidden = true;
      }, 2000);
    });
  },

  emitNextQ: () => quiz.emit('next_question'),

  emitHostStartQuiz: () => quiz.emit('host_start_quiz'),

  emitShowWinners: () => quiz.emit('show_winners'),

  revealAnswerHostListener: (
    setQuestionHidden: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    quiz.on('reveal_answers_host', () => {
      console.log('reveal');

      setTimeout(() => {
        setQuestionHidden(true);
        // document.getElementById('countdown-canvas')!.hidden = true;
      }, 2000);
    });
  },

  hostWinnersListener: (
    setTrigger: React.Dispatch<React.SetStateAction<number>>
  ) => {
    quiz.on('host_winners', () => {
      console.log('HOST WINNERS RECEIVED');
      setTrigger((num) => num + 1);
    });
  },

  playerWinnersListener: (
    setTrigger: React.Dispatch<React.SetStateAction<number>>
  ) => {
    quiz.on('player_winners', () => {
      console.log('PLAYER WINNERS RECEIVED');
      setTrigger((num) => {
        console.log('TRIGGER BEFORE +1::', num);
        return num + 1;
      });
    });
  },
};

export function startTimer() {
  const pickColorByPercentage = (percentage: any, time: any) => {
    switch (true) {
      case percentage >= 75:
        return '#28a745'; // green
      case percentage >= 50 && percentage < 75:
        return '#17a2b8'; // blue
      case percentage >= 25 && percentage < 50:
        return '#ffc107'; // orange
      default:
        return '#dc3545'; // red
    }
  };
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
