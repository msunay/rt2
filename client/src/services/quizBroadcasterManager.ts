import type { HostVideoStreamStateAction } from '@/reducers/hostVideoStreamStateReducer';
import type { Dispatch } from 'react';
import { WebSocketManager } from './webSocketManager';

/**
 * Socket manager for quiz hosts
 */
export class QuizBroadcasterManager extends WebSocketManager<'quizspace'> {
  private dispatchState: Dispatch<HostVideoStreamStateAction>;
  
  /**
   * Creates a new quiz host socket manager
   * @param dispatchState Dispatch function for host video stream state
   */
  constructor(dispatchState: Dispatch<HostVideoStreamStateAction>) {
    super('quizspace');
    this.dispatchState = dispatchState;
  }

  /**
   * Sets up connection success listener and automatically joins the specified room
   * @param quizId Quiz ID to join
   */
  public setupConnectionListeners(quizId: string): void {
    this.addListener('connection_success', ({ socketId }) => {
      console.log('Quiz host socket connected:', socketId);
      this.getSocket().emit('join_room', { roomId: quizId });
      console.log('Host socket ID:', this.getSocket().id);
    }, 'Host connection');
  }

  /**
   * Removes connection success listener
   */
  public removeConnectionListeners(): void {
    this.removeListener('connection_success', null, 'Host connection');
  }

  /**
   * Sets up question timer listener
   */
  public setupQuestionTimerListener(): void {
    this.addListener('start_question_timer', () => {
      this.dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: false });
    }, 'Host question timer');
  }

  /**
   * Removes question timer listener
   */
  public removeQuestionTimerListener(): void {
    this.removeListener('start_question_timer', null, 'Host question timer');
  }

  /**
   * Sets up answer reveal listener
   */
  public setupAnswerRevealListener(): void {
    this.addListener('reveal_answers_host', () => {
      setTimeout(() => {
        this.dispatchState({ type: 'SET_HVS_Q_HIDDEN', payload: true });
      }, 2000);
    }, 'Host answer reveal');
  }

  /**
   * Removes answer reveal listener
   */
  public removeAnswerRevealListener(): void {
    this.removeListener('reveal_answers_host', null, 'Host answer reveal');
  }

  /**
   * Sets up winners display listener
   */
  public setupWinnersListener(): void {
    this.addListener('host_winners', () => {
      console.log('Host winners received');
      this.dispatchState({ type: 'INCREMENT_HVS_TRIGGER', payload: undefined });
    }, 'Host winners');
  }

  /**
   * Removes winners display listener
   */
  public removeWinnersListener(): void {
    this.removeListener('host_winners', null, 'Host winners');
  }

  /**
   * Emits event to start the quiz
   * @param quizId Quiz ID
   */
  public startQuiz(quizId: string): void {
    this.getSocket().emit('host_start_quiz', { roomId: quizId });
  }

  /**
   * Emits event to proceed to the next question
   * @param quizId Quiz ID
   */
  public nextQuestion(quizId: string): void {
    this.getSocket().emit('next_question', { roomId: quizId });
  }

  /**
   * Emits event to show winners
   * @param quizId Quiz ID
   */
  public showWinners(quizId: string): void {
    this.getSocket().emit('show_winners', { roomId: quizId });
  }

  /**
   * Sets up all listeners for the quiz host
   * @param quizId Quiz ID
   */
  public setupAllListeners(quizId: string): void {
    this.setupConnectionListeners(quizId);
    this.setupQuestionTimerListener();
    this.setupAnswerRevealListener();
    this.setupWinnersListener();
  }

  /**
   * Removes all listeners for the quiz host
   */
  public removeAllListeners(): void {
    this.removeConnectionListeners();
    this.removeQuestionTimerListener();
    this.removeAnswerRevealListener();
    this.removeWinnersListener();
  }
}