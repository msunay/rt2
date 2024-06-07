import type { UserStreamStateAction } from '@/reducers/userStreamStateReducer';
import { SocketManager } from './socketManager';
import type { Dispatch } from 'react';


export class QuizPlayerSocketManager extends SocketManager {

  private dispatchState: Dispatch<UserStreamStateAction>;

  constructor(dispatchState: Dispatch<UserStreamStateAction>) {
    super('quizspace');
    this.dispatchState = dispatchState;
  }

  successListener = (quizId: string) =>
    this.getSocket().on('connection_success', ({ socketId }) => {
      console.log('quiz socket connected: ', socketId);
        this.getSocket().emit('join_room', { roomId: quizId });
      console.log('socket id: ', this.getSocket().id);
    });

  successListenerOff = () =>
    this.getSocket().off('connection_success', () => {
      console.log('quiz socket connection_success listener off');
    });

  startTimerListener = (/* dispatchUserState: Dispatch<UserStreamStateAction> */) =>
    this.getSocket().on('start_question_timer', () => {
      this.dispatchState({ type: 'SET_US_Q_HIDDEN', payload: false });
    });

  startTimerListenerOff = () =>
    this.getSocket().off('start_question_timer', () => {
      console.log('quiz socket start_question_timer listener off');
    });

  startQuizListener = (/* dispatchState: Dispatch<UserStreamStateAction> */) =>
    this.getSocket().on('start_quiz', () => {
      console.log('start_quiz listener!!!!!!!!!!');
      this.dispatchState({ type: 'SET_US_QUIZ_STARTED', payload: true });
    });

  startQuizListenerOff = () =>
    this.getSocket().off('start_quiz', () => {
      console.log('quiz socket start_quiz listener off');
    });


  revealListener = (/* dispatchState: Dispatch<UserStreamStateAction> */) => {
    console.log('Is this working???');
    this.getSocket().on('reveal_answers', () => {
      setTimeout(() => {
        this.dispatchState({ type: 'SET_US_Q_HIDDEN', payload: true });
        this.dispatchState({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
      }, 2000);
    });
  }

  revealListenerOff = () =>
    this.getSocket().off('reveal_answers', () => {
      console.log('quiz socket reveal_answers listener off');
    });

  playerWinnersListener = (/* dispatchState: Dispatch<UserStreamStateAction> */) =>
    this.getSocket().on('player_winners', () => {
      console.log('PLAYER WINNERS RECEIVED');
      this.dispatchState({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
    });

  playerWinnersListenerOff = () =>
    this.getSocket().off('player_winners', () => {
      console.log('quiz socket player_winners listener off');
    });

}
