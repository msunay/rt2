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
 * Socket manager for quiz participants
 */
export class QuizParticipantManager extends WebSocketManager<'quizspace'> {
  private dispatchAction: LegacyDispatch;
  
  /**
   * Creates a new quiz participant socket manager
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
      console.log('Quiz participant socket connected:', socketId);
      this.getSocket().emit('join_room', { roomId: quizId });
      console.log('Participant socket ID:', this.getSocket().id);
    }, 'Participant connection');
  }

  /** 
   * Time in milliseconds that each question is displayed for
   * @default 7000
   */
  static QUESTION_TIME = 7000;

  /**
   * Removes connection success listener
   */
  public removeConnectionListeners(): void {
    this.removeListener('connection_success', null, 'Participant connection');
  }

  /**
   * Sets up quiz start listener
   */
  public setupQuizStartListener(): void {
    this.addListener('start_quiz', () => {
      console.log('Quiz start received');
      this.dispatchAction({ type: 'SET_US_QUIZ_STARTED', payload: true });
    }, 'Participant quiz start');
  }

  /**
   * Removes quiz start listener
   */
  public removeQuizStartListener(): void {
    this.removeListener('start_quiz', null, 'Participant quiz start');
  }

  /**
   * Sets up question timer listener
   */
  public setupQuestionTimerListener(): void {
    this.addListener('start_question_timer', () => {
      this.dispatchAction({ type: 'SET_US_Q_HIDDEN', payload: false });
    }, 'Participant question timer');
  }

  /**
   * Removes question timer listener
   */
  public removeQuestionTimerListener(): void {
    this.removeListener('start_question_timer', null, 'Participant question timer');
  }

  /**
   * Sets up answer reveal listener
   */
  public setupAnswerRevealListener(): void {
    this.addListener('reveal_answers', () => {
      setTimeout(() => {
        this.dispatchAction({ type: 'SET_US_Q_HIDDEN', payload: true });
        this.dispatchAction({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
      }, 2000);
    }, 'Participant answer reveal');
  }

  /**
   * Removes answer reveal listener
   */
  public removeAnswerRevealListener(): void {
    this.removeListener('reveal_answers', null, 'Participant answer reveal');
  }

  /**
   * Sets up winners display listener
   */
  public setupWinnersListener(): void {
    this.addListener('player_winners', () => {
      console.log('Participant winners received');
      this.dispatchAction({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
    }, 'Participant winners');
  }

  /**
   * Removes winners display listener
   */
  public removeWinnersListener(): void {
    this.removeListener('player_winners', null, 'Participant winners');
  }

  /**
   * Sets up all listeners for the quiz participant
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
   * Removes all listeners for the quiz participant
   */
  public removeAllListeners(): void {
    this.removeConnectionListeners();
    this.removeQuizStartListener();
    this.removeQuestionTimerListener();
    this.removeAnswerRevealListener();
    this.removeWinnersListener();
  }

  /**
   * Create a version with Redux dispatch
   * @param dispatch Redux dispatch function
   */
  public static withReduxDispatch(dispatch: AppDispatch): QuizParticipantManager {
    const dispatchAdapter: LegacyDispatch = (action) => {
      switch (action.type) {
        case 'SET_US_QUIZ_STARTED':
          dispatch(setQuizStarted(action.payload));
          break;
        case 'SET_US_Q_HIDDEN':
          dispatch(setQuestionHidden(action.payload));
          break;
        case 'INCREMENT_US_CURRENT_Q_NUM':
          dispatch(incrementQuestionNumber());
          break;
        case 'INCREMENT_US_TRIGGER':
          dispatch(incrementTrigger());
          break;
        default:
          console.warn('Unknown action type in QuizParticipantManager:', action.type);
      }
    };

    return new QuizParticipantManager(dispatchAdapter);
  }
}