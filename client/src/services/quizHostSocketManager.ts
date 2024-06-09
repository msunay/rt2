import type { HostVideoStreamStateAction } from '@/reducers/hostVideoStreamStateReducer';
import type { Dispatch } from 'react';
import { SocketManager } from './socketManager';

export class QuizHostSocketManager extends SocketManager<'quizspace'> {
  private dispatchState: Dispatch<HostVideoStreamStateAction>;

  constructor(dispatchState: Dispatch<HostVideoStreamStateAction>) {
    super('quizspace');
    this.dispatchState = dispatchState;
  }

  successListener = (quizId: string) => {
    console.log('\n setting up host connection_success listener');
    this.getSocket().on('connection_success', ({ socketId }) => {
      console.log('quiz host socket connected: ', socketId);
      this.getSocket().emit('join_room', { roomId: quizId });
      console.log('host socket id: ', this.getSocket().id);
    });
  };
  successListenerOff = () => {
    console.log('\n removing host connection_success listener');
    this.getSocket().off('connection_success', () => {
      console.log('quiz socket connection_success listener off');
    });
  };
  startTimerListener = () => {
    console.log('\n setting up host start_question_timer listener');
    this.getSocket().on('start_question_timer', () => {
      this.dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: false });
    });
  };
  startTimerListenerOff = () => {
    console.log('\n removing host start_question_timer listener');
    this.getSocket().off('start_question_timer', () => {
      console.log('quiz socket start_question_timer listener off');
    });
  };

  emitHostStartQuiz = (quizId: string) => {
    this.getSocket().emit('host_start_quiz', { roomId: quizId });
  };

  emitNextQ = (quizId: string) => {
    this.getSocket().emit('next_question', { roomId: quizId });
  };

  emitShowWinners = (quizId: string) => {
    this.getSocket().emit('show_winners', { roomId: quizId });
  };

  revealAnswerHostListener = () => {
    console.log('\n setting up host reveal_answers_host listener');
    this.getSocket().on('reveal_answers_host', () => {
      setTimeout(() => {
        this.dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: true });
      }, 2000);
    });
  };

  revealAnswerHostListenerOff = () => {
    console.log('\n removing host reveal_answers_host listener');
    this.getSocket().off('reveal_answers_host', () => {
      console.log('quiz socket reveal_answers_host listener off');
    });
  };

  hostWinnersListener = () => {
    console.log('\n setting up host_winners listener');
    this.getSocket().on('host_winners', () => {
      console.log('host_winners listener');
      this.dispatchState({ type: 'INCREMENT_HVS_TRIGGER', payload: undefined });
    });
  };

  hostWinnersListenerOff = () => {
    console.log('\n removing host_winners listener');
    this.getSocket().off('host_winners', () => {
      console.log('quiz socket host_winners listener off');
    });
  };
}
