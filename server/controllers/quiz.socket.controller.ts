import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '../Types/QuizSocketTypes';
import { Socket } from 'socket.io';

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
      quiz.broadcast.emit('reveal_answers');
    }, 7000);
  });

  quiz.on('next_question', () => {
    quiz.broadcast.emit('start_question_timer');
    console.log('next qqq')

    quiz.broadcast.emit('reveal_answers');
    setTimeout(() => {
    }, 7000);
  });
};

export default quizSocketInit;
