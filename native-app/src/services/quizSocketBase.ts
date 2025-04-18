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
export type LegacyDispatch = Dispatch<{
  type: string;
  payload?: any;
}>;

/**
 * Base class for quiz socket managers (both broadcaster and participant)
 * Provides common functionality and type definitions
 */
export abstract class QuizSocketBase extends WebSocketManager<'quizspace'> {
  protected dispatchAction: LegacyDispatch;
  
  /**
   * Creates a new quiz socket manager
   * @param dispatchAction Dispatch function for actions
   */
  constructor(dispatchAction: LegacyDispatch) {
    super('quizspace');
    this.dispatchAction = dispatchAction;
  }

  /**
   * Sets up connection success listener and automatically joins the specified room
   * @param quizId Quiz ID to join
   * @param role Role identifier for logging (e.g., "Broadcaster", "Participant")
   */
  public setupConnectionListeners(quizId: string, role: string): void {
    this.addListener('connection_success', ({ socketId }) => {
      console.log(`Quiz ${role} socket connected:`, socketId);
      this.getSocket().emit('join_room', { roomId: quizId });
      console.log(`${role} socket ID:`, this.getSocket().id);
    }, `${role} connection`);
  }

  /**
   * Removes connection success listener
   * @param role Role identifier for logging
   */
  public removeConnectionListeners(role: string): void {
    this.removeListener('connection_success', null, `${role} connection`);
  }

  /**
   * Sets up question timer listener with custom handler
   * @param handler Function to handle the question timer event
   * @param role Role identifier for logging
   */
  public setupQuestionTimerListener(handler: () => void, role: string): void {
    this.addListener('start_question_timer', handler, `${role} question timer`);
  }

  /**
   * Removes question timer listener
   * @param role Role identifier for logging
   */
  public removeQuestionTimerListener(role: string): void {
    this.removeListener('start_question_timer', null, `${role} question timer`);
  }

  /**
   * Create a version with Redux dispatch
   * This maps the legacy actions to Redux actions
   * @param dispatch Redux dispatch function
   * @param actionMap Map of legacy action types to Redux action creators
   */
  protected static createReduxAdapter(
    dispatch: AppDispatch,
    actionMap: Record<string, (payload?: any) => any>
  ): LegacyDispatch {
    return (action) => {
      const actionCreator = actionMap[action.type];
      if (actionCreator) {
        dispatch(actionCreator(action.payload));
      } else {
        console.warn('Unknown action type in QuizSocketBase:', action.type);
      }
    };
  }

  /**
   * Standard Redux action map used by both broadcaster and participant
   */
  protected static standardReduxActionMap = {
    'SET_HVS_QUIZ_STARTED': setQuizStarted,
    'SET_US_QUIZ_STARTED': setQuizStarted,
    'SET_HVS_Q_HIDDEN': setQuestionHidden,
    'SET_US_Q_HIDDEN': setQuestionHidden,
    'INCREMENT_HVS_CURRENT_Q_NUM': () => incrementQuestionNumber(),
    'INCREMENT_US_CURRENT_Q_NUM': () => incrementQuestionNumber(),
    'INCREMENT_HVS_TRIGGER': () => incrementTrigger(),
    'INCREMENT_US_TRIGGER': () => incrementTrigger()
  };
}