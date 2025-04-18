import type { UserStreamStateAction } from '@/reducers/userStreamStateReducer';
import type { Dispatch } from 'react';
import { WebSocketManager } from './webSocketManager';

/**
 * Socket manager for quiz players
 */
export class QuizParticipantManager extends WebSocketManager<'quizspace'> {
  private dispatchState: Dispatch<UserStreamStateAction>;
  
  /**
   * Creates a new quiz player socket manager
   * @param dispatchState Dispatch function for user stream state
   */
  constructor(dispatchState: Dispatch<UserStreamStateAction>) {
    super('quizspace');
    this.dispatchState = dispatchState;
  }

  /**
   * Sets up connection success listener and automatically joins the specified room
   * @param quizId Quiz ID to join
   */
  public setupConnectionListeners(quizId: string): void {
    this.addListener('connection_success', ({ socketId }) => {
      console.log('Quiz player socket connected:', socketId);
      this.getSocket().emit('join_room', { roomId: quizId });
      console.log('Player socket ID:', this.getSocket().id);
    }, 'Player connection');
  }

  /**
   * Removes connection success listener
   */
  public removeConnectionListeners(): void {
    this.removeListener('connection_success', null, 'Player connection');
  }

  /**
   * Sets up quiz start listener
   */
  public setupQuizStartListener(): void {
    this.addListener('start_quiz', () => {
      console.log('Quiz start received');
      this.dispatchState({ type: 'SET_US_QUIZ_STARTED', payload: true });
    }, 'Player quiz start');
  }

  /**
   * Removes quiz start listener
   */
  public removeQuizStartListener(): void {
    this.removeListener('start_quiz', null, 'Player quiz start');
  }

  /**
   * Sets up question timer listener
   */
  public setupQuestionTimerListener(): void {
    this.addListener('start_question_timer', () => {
      this.dispatchState({ type: 'SET_US_Q_HIDDEN', payload: false });
    }, 'Player question timer');
  }

  /**
   * Removes question timer listener
   */
  public removeQuestionTimerListener(): void {
    this.removeListener('start_question_timer', null, 'Player question timer');
  }

  /**
   * Sets up answer reveal listener
   */
  public setupAnswerRevealListener(): void {
    this.addListener('reveal_answers', () => {
      setTimeout(() => {
        this.dispatchState({ type: 'SET_US_Q_HIDDEN', payload: true });
        this.dispatchState({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
      }, 2000);
    }, 'Player answer reveal');
  }

  /**
   * Removes answer reveal listener
   */
  public removeAnswerRevealListener(): void {
    this.removeListener('reveal_answers', null, 'Player answer reveal');
  }

  /**
   * Sets up winners display listener
   */
  public setupWinnersListener(): void {
    this.addListener('player_winners', () => {
      console.log('Player winners received');
      this.dispatchState({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
    }, 'Player winners');
  }

  /**
   * Removes winners display listener
   */
  public removeWinnersListener(): void {
    this.removeListener('player_winners', null, 'Player winners');
  }

  /**
   * Sets up all listeners for the quiz player
   * @param quizId Quiz ID
   */
  public setupAllListeners(quizId: string): void {
    this.setupConnectionListeners(quizId);
    this.setupQuizStartListener();
    this.setupQuestionTimerListener();
    this.setupAnswerRevealListener();
    this.setupWinnersListener();
  }

  /**
   * Removes all listeners for the quiz player
   */
  public removeAllListeners(): void {
    this.removeConnectionListeners();
    this.removeQuizStartListener();
    this.removeQuestionTimerListener();
    this.removeAnswerRevealListener();
    this.removeWinnersListener();
  }
}