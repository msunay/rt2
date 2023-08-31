import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '../Types/QuizSocketTypes';
import { Socket } from 'socket.io';

const QUESTION_TIME = process.env.NODE_ENV === 'test' ? 0 : 2000;

const quizSocketInit = (
  quiz: Socket<QuizClientToServerEvents, QuizServerToClientEvents>
) => {
  console.log('quiz ID: ', quiz.id);

  quiz.emit('connection_success', {
    socketId: quiz.id,
  });

  quiz.on('host_start_quiz', () => {
    console.log('Emitted host_start_quiz event');
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

  quiz.on('show_winners', () => {
    quiz.emit('host_winners');
    quiz.broadcast.emit('player_winners');
  });
};

export default quizSocketInit;
