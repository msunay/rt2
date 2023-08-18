import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '../Types/QuizSocketTypes';
import { Socket } from 'socket.io';

const quizSocketInit = (
  quiz: Socket<QuizClientToServerEvents, QuizServerToClientEvents>
) => {
  console.log(quiz.id);

  quiz.emit('connection_success', {
    socketId: quiz.id
  })

  quiz.on('next_question', () => {
    quiz.emit('start_question_timer')
    setTimeout(() => {
      quiz.emit('reveal_answers')
    }, 7000)
  })
};

export default quizSocketInit;