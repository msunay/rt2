import type {
  QuizListenEvents,
  QuizEmitEvents,
} from '@/Types/QuizSocketTypes';
import type { Socket } from 'socket.io';
import { quizNamespace } from '@/index';

const QUESTION_TIME = process.env.NODE_ENV === 'test' ? 0 : 7000;

/**
 * Socket controller for quiz functionality
 * @param quizSocket Socket instance for the quiz namespace
 */
const quizSocketInit = (
  quizSocket: Socket<QuizListenEvents, QuizEmitEvents>
) => {
  setTimeout(() => console.log('\tquiz ID : ', quizSocket.id), 100);

  // Send connection success event with socket ID
  setTimeout(() => {
    quizSocket.emit('connection_success', {
      socketId: quizSocket.id,
    });
  }, 200);

  // Handle room joining
  quizSocket.on('join_room', ({ roomId }) => {
    console.log(`\nClient ${quizSocket.id} joining room ${roomId}`);
    quizSocket.join(roomId);

    // Verify room membership
    const room = quizNamespace.adapter.rooms.get(roomId);
    if (room) {
      console.log(`\nRoom ${roomId} now has ${room.size} client(s).`);
    } else {
      console.log(`\nRoom ${roomId} does not exist.`);
    }
  });

  // Handle quiz starting by host
  quizSocket.on('host_start_quiz', ({ roomId }) => {
    quizNamespace.to(roomId).emit('start_quiz');

    // After question time, reveal answers
    setTimeout(() => {
      quizSocket.to(roomId).emit('reveal_answers_host');
      quizSocket.to(roomId).emit('reveal_answers');
    }, QUESTION_TIME);
  });

  // Handle moving to next question
  quizSocket.on('next_question', ({ roomId }) => {
    quizSocket.to(roomId).emit('start_question_timer');

    // After question time, reveal answers
    setTimeout(() => {
      quizSocket.emit('reveal_answers_host');
      quizSocket.broadcast.emit('reveal_answers');
    }, QUESTION_TIME);
  });

  // Handle showing winners screen
  quizSocket.on('show_winners', ({ roomId }) => {
    console.log('Showing winners for room:', roomId);
    quizSocket.to(roomId).emit('host_winners');
    quizSocket.to(roomId).emit('player_winners');
  });

  // Handle socket disconnection
  quizSocket.on('disconnect', () => {
    console.log('Quiz socket disconnected:', quizSocket.id);
  });
};

export default quizSocketInit;