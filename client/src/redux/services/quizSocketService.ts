import { Socket, io } from 'socket.io-client';
import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '@/Types/QuizSocketTypes';
import CanvasCircularCountdown from 'canvas-circular-countdown';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001/';
const quiz: Socket<QuizServerToClientEvents, QuizClientToServerEvents> = io(
  `${BASE_URL}quizspace`
);

export const quizSocketService = {
  successListener: () =>
    quiz.on('connection_success', ({ socketId }) => {
      console.log(socketId);
    }),

  startTimerListener: () =>
    quiz.on('start_question_timer', () => {
      startTimer();
    }),

  revealListener: (setQuestionHidden: React.Dispatch<React.SetStateAction<boolean>>, setTrigger: React.Dispatch<React.SetStateAction<number>>) => {
    quiz.on('reveal_answers', () => {
      console.log('reveal');
      //@ts-ignore
      document.querySelectorAll('button[name="a"]').forEach((btn, i) => btn.disabled = true)

      setTimeout(() => {
        setQuestionHidden(true);
        document.getElementById('countdown-canvas')!.hidden = true
        setTrigger((trigger) => trigger + 1);
      }, 2000)
    })
  },

  emitNextQ: () => quiz.emit('next_question'),

  emitHostStartQuiz: () => quiz.emit('host_start_quiz'),

  

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
  new CanvasCircularCountdown(document.getElementById('countdown-canvas'), {
    duration: 7 * 1000,
    radius: 150,
    clockwise: true,
    captionColor: pickColorByPercentage,
    progressBarWidth: 20,
    progressBarOffset: 0,
    circleBackgroundColor: '#f5f5f5',
    emptyProgressBarBackgroundColor: '#b9c1c7',
    filledProgressBarBackgroundColor: '#17a2b8',
    captionFont: '22px serif',
    showCaption: true,
  }).start();
}
