import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '../Types/QuizSocketTypes';
import { Socket } from 'socket.io';

const quizSocketInit = (
  quiz: Socket<QuizClientToServerEvents, QuizServerToClientEvents>
) => {
  quiz.emit('connection_success', {
    socketId: quiz.id
  })
};

export default quizSocketInit;
