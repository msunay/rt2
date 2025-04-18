import type { Dispatch } from 'react';
import { WebSocketManager } from '@/src/services/webSocketManager';
import { AppDispatch } from '@/src/store';
import {
  setQuizStarted,
  setQuestionHidden,
  incrementQuestionNumber,
  incrementTrigger
} from '@/src/features/quizSlice';

/**
 * Type for legacy action dispatch function
 * Used for backward compatibility with existing code
 */
type LegacyDispatch = Dispatch<{
  type: string;
  payload?: any;
}>;

/**
 * Socket manager for quiz hosts/broadcasters
 */
export class QuizBroadcasterManager extends WebSocketManager<'quizspace'> {
  private dispatchAction: LegacyDispatch;
  
  /**
   * Creates a new quiz broadcaster socket manager
   * @param dispatchAction Dispatch function for actions
   */
  constructor(dispatchAction: LegacyDispatch) {
    super('quizspace');
    this.dispatchAction = dispatchAction;
  }

  /**
   * Sets up connection success listener and automatically joins the specified room
   * @param quizId Quiz ID to join
   */
  public setupConnectionListeners(quizId: string): void {
    this.addListener('connection_success', ({ socketId }) => {
      console.log('Quiz broadcaster socket connected:', socketId);
      this.getSocket().emit('join_room', { roomId: quizId });
      console.log('Broadcaster socket ID:', this.getSocket().id);
    }, 'Broadcaster connection');
  }

  /**
   * Removes connection success listener
   */
  public removeConnectionListeners(): void {
    this.removeListener('connection_success', null, 'Broadcaster connection');
  }

  /**
   * Sets up question timer listener
   */
  public setupQuestionTimerListener(): void {
    this.addListener('start_question_timer', () => {
      this.dispatchAction({ type: 'SET_HVS_Q_HIDDEN', payload: false });
    }, 'Broadcaster question timer');
  }

  /**
   * Removes question timer listener
   */
  public removeQuestionTimerListener(): void {
    this.removeListener('start_question_timer', null, 'Broadcaster question timer');
  }

  /**
   * Sets up answer reveal listener
   */
  public setupAnswerRevealListener(): void {
    this.addListener('reveal_answers_host', () => {
      setTimeout(() => {
        this.dispatchAction({ type: 'SET_HVS_Q_HIDDEN', payload: true });
      }, 2000);
    }, 'Broadcaster answer reveal');
  }

  /**
   * Removes answer reveal listener
   */
  public removeAnswerRevealListener(): void {
    this.removeListener('reveal_answers_host', null, 'Broadcaster answer reveal');
  }

  /**
   * Sets up winners display listener
   */
  public setupWinnersListener(): void {
    this.addListener('host_winners', () => {
      console.log('Broadcaster winners received');
      this.dispatchAction({ type: 'INCREMENT_HVS_TRIGGER', payload: undefined });
    }, 'Broadcaster winners');
  }

  /**
   * Removes winners display listener
   */
  public removeWinnersListener(): void {
    this.removeListener('host_winners', null, 'Broadcaster winners');
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
   * Sets up all listeners for the quiz broadcaster
   * @param quizId Quiz ID
   */
  public setupAllListeners(quizId: string): void {
    this.setupConnectionListeners(quizId);
    this.setupQuestionTimerListener();
    this.setupAnswerRevealListener();
    this.setupWinnersListener();
  }

  /**
   * Removes all listeners for the quiz broadcaster
   */
  public removeAllListeners(): void {
    this.removeConnectionListeners();
    this.removeQuestionTimerListener();
    this.removeAnswerRevealListener();
    this.removeWinnersListener();
  }

  /**
   * Create a version with Redux dispatch
   * This maps the host broadcast state actions to Redux actions
   * @param dispatch Redux dispatch function
   */
  public static withReduxDispatch(dispatch: AppDispatch): QuizBroadcasterManager {
    // Create an adapter that translates legacy actions to Redux actions
    const dispatchAdapter: LegacyDispatch = (action) => {
      switch (action.type) {
        case 'SET_HVS_QUIZ_STARTED':
          dispatch(setQuizStarted(action.payload));
          break;
        case 'SET_HVS_Q_HIDDEN':
          dispatch(setQuestionHidden(action.payload));
          break;
        case 'INCREMENT_HVS_CURRENT_Q_NUM':
          dispatch(incrementQuestionNumber());
          break;
        case 'INCREMENT_HVS_TRIGGER':
          dispatch(incrementTrigger());
          break;
        default:
          console.warn('Unknown action type in QuizBroadcasterManager:', action.type);
      }
    };

    return new QuizBroadcasterManager(dispatchAdapter);
  }
}