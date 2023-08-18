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

  quiz.on('host_start_quiz', () => {
    console.log('Is this working???');
    quiz.broadcast.emit('start_quiz')
  })
  quiz.on('next_question', () => {
    quiz.broadcast.emit('start_question_timer')
    // quiz.broadcast.emit('set_question', {
    //   currentQuestionNumber
    // })
    setTimeout(() => {
      quiz.broadcast.emit('reveal_answers')
    }, 7000)
  })
};

export default quizSocketInit;