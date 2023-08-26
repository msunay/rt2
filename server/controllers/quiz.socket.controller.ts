import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '../Types/QuizSocketTypes';
import { Socket } from 'socket.io';

const QUESTION_TIME = 7000;

const quizSocketInit = (
  quiz: Socket<QuizClientToServerEvents, QuizServerToClientEvents>
) => {
  console.log('quiz ID: ', quiz.id);

  quiz.emit('connection_success', {
    socketId: quiz.id,
  });

  quiz.on('host_start_quiz', () => {
    quiz.broadcast.emit('start_quiz');

    setTimeout(() => {
      quiz.emit('reveal_answers_host');
      quiz.broadcast.emit('reveal_answers');
    }, QUESTION_TIME);
  });

  quiz.on('next_question', () => {
    quiz.broadcast.emit('start_question_timer');

    setTimeout(() => {
      quiz.emit('reveal_answers_host');
      quiz.broadcast.emit('reveal_answers');
    }, QUESTION_TIME);
  });
};

export default quizSocketInit;
