import {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '../Types/QuizSocketTypes';
import type { Socket } from 'socket.io';
import { io } from '../index';
import { quizNamespace } from '../index';

const QUESTION_TIME = process.env.NODE_ENV === 'test' ? 0 : 7000;

const quizSocketInit = (
  quizSocket: Socket<QuizClientToServerEvents, QuizServerToClientEvents>
) => {
  setTimeout(() => console.log('\tquiz ID : ', quizSocket.id), 100);

  quizSocket.emit('connection_success', {
    socketId: quizSocket.id,
  });

  quizSocket.on('join_room', ({ roomId }) => {
    console.log(`\nClient ${quizSocket.id} joining room ${roomId}`);
    quizSocket.join(roomId);

    // Verify room membership
    const room = quizNamespace.adapter.rooms.get(roomId);
    // const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      console.log(`\nRoom ${roomId} now has ${room.size} client(s).`);
    } else {
      console.log(`\nRoom ${roomId} does not exist.`);
    }
  });


  quizSocket.on('host_start_quiz', ({ roomId }) => {
    // console.log('\nroom id: ', roomId);

    quizNamespace.to(roomId).emit('start_quiz');

    setTimeout(() => {
      quizSocket.to(roomId).emit('reveal_answers_host');
      quizSocket.to(roomId).emit('reveal_answers');
    }, QUESTION_TIME);
  });

  quizSocket.on('next_question', ({ roomId }) => {
    quizSocket.to(roomId).emit('start_question_timer');
    setTimeout(() => {
      quizSocket.emit('reveal_answers_host');
      quizSocket.broadcast.emit('reveal_answers');
    }, QUESTION_TIME);
  });

  quizSocket.on('show_winners', ({ roomId }) => {
    console.log('I MADE IT TO THE BACK!');
    quizSocket.to(roomId).emit('host_winners');
    quizSocket.to(roomId).emit('player_winners');
  });

  quizSocket.on('disconnect', () => console.log('quiz socket disconnected'))
};

export default quizSocketInit;
