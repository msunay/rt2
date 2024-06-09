import type { UserStreamStateAction } from '@/reducers/userStreamStateReducer';
import type { Dispatch } from 'react';
import { SocketManager } from './socketManager';

export class QuizPlayerSocketManager extends SocketManager<'quizspace'> {
  private dispatchState: Dispatch<UserStreamStateAction>;

  constructor(dispatchState: Dispatch<UserStreamStateAction>) {
    super('quizspace');
    this.dispatchState = dispatchState;
  }

  successListener = (quizId: string) => {
    console.log('\n setting up client connection_success listener');
    this.getSocket().on('connection_success', ({ socketId }) => {
      console.log('quiz client socket connected: ', socketId);
      this.getSocket().emit('join_room', { roomId: quizId });
      console.log('client socket id: ', this.getSocket().id);
    });
  };

  successListenerOff = () => {
    console.log('\n removing client connection_success listener');
    this.getSocket().off('connection_success', () => {
      console.log('quiz socket connection_success listener off');
    });
  };

  startTimerListener = () => {
    console.log('\n setting up client start_question_timer listener');
    this.getSocket().on('start_question_timer', () => {
      this.dispatchState({ type: 'SET_US_Q_HIDDEN', payload: false });
    });
  };

  startTimerListenerOff = () => {
    console.log('\n removing client start_question_timer listener');
    this.getSocket().off('start_question_timer', () => {
      console.log('quiz socket start_question_timer listener off');
    });
  };

  startQuizListener = () => {
    console.log('\n setting up client start_quiz listener');
    this.getSocket().on('start_quiz', () => {
      console.log('start_quiz listener!!!!!!!!!!');
      this.dispatchState({ type: 'SET_US_QUIZ_STARTED', payload: true });
    });
  };

  startQuizListenerOff = () => {
    console.log('\n removing client start_quiz listener');
    this.getSocket().off('start_quiz', () => {
      console.log('quiz socket start_quiz listener off');
    });
  };

  revealListener = () => {
    console.log('\n setting up client reveal_answers listener');
    this.getSocket().on('reveal_answers', () => {
      setTimeout(() => {
        this.dispatchState({ type: 'SET_US_Q_HIDDEN', payload: true });
        this.dispatchState({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
      }, 2000);
    });
  };

  revealListenerOff = () => {
    console.log('\n removing client reveal_answers listener');
    this.getSocket().off('reveal_answers', () => {
      console.log('quiz socket reveal_answers listener off');
    });
  };

  playerWinnersListener = () => {
    console.log('\n setting up client player_winners listener');
    this.getSocket().on('player_winners', () => {
      console.log('PLAYER WINNERS RECEIVED');
      this.dispatchState({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
    });
  };

  playerWinnersListenerOff = () => {
    console.log('\n removing client player_winners listener');
    this.getSocket().off('player_winners', () => {
      console.log('quiz socket player_winners listener off');
    });
  };
}
