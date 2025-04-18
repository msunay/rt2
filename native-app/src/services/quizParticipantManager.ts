import { AppDispatch } from '@/src/store';
import { QuizSocketBase, LegacyDispatch } from '@/src/services/quizSocketBase';
import {
  setQuizStarted,
  setQuestionHidden,
  incrementQuestionNumber,
  incrementTrigger
} from '@/src/features/quizSlice';

/**
 * Socket manager for quiz participants
 */
export class QuizParticipantManager extends QuizSocketBase {
  private static readonly ROLE = 'Participant';
  
  /** 
   * Time in milliseconds that each question is displayed for
   * @default 7000
   */
  static QUESTION_TIME = 7000;

  /**
   * Sets up connection success listener and automatically joins the specified room
   * @param quizId Quiz ID to join
   */
  public setupConnectionListeners(quizId: string): void {
    super.setupConnectionListeners(quizId, QuizParticipantManager.ROLE);
  }

  /**
   * Removes connection success listener
   */
  public removeConnectionListeners(): void {
    super.removeConnectionListeners(QuizParticipantManager.ROLE);
  }

  /**
   * Sets up quiz start listener
   */
  public setupQuizStartListener(): void {
    this.addListener('start_quiz', () => {
      console.log('Quiz start received');
      this.dispatchAction({ type: 'SET_US_QUIZ_STARTED', payload: true });
    }, `${QuizParticipantManager.ROLE} quiz start`);
  }

  /**
   * Removes quiz start listener
   */
  public removeQuizStartListener(): void {
    this.removeListener('start_quiz', null, `${QuizParticipantManager.ROLE} quiz start`);
  }

  /**
   * Sets up question timer listener
   */
  public setupQuestionTimerListener(): void {
    super.setupQuestionTimerListener(
      () => this.dispatchAction({ type: 'SET_US_Q_HIDDEN', payload: false }),
      QuizParticipantManager.ROLE
    );
  }

  /**
   * Removes question timer listener
   */
  public removeQuestionTimerListener(): void {
    super.removeQuestionTimerListener(QuizParticipantManager.ROLE);
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
    }, `${QuizParticipantManager.ROLE} answer reveal`);
  }

  /**
   * Removes answer reveal listener
   */
  public removeAnswerRevealListener(): void {
    this.removeListener('reveal_answers', null, `${QuizParticipantManager.ROLE} answer reveal`);
  }

  /**
   * Sets up winners display listener
   */
  public setupWinnersListener(): void {
    this.addListener('player_winners', () => {
      console.log(`${QuizParticipantManager.ROLE} winners received`);
      this.dispatchAction({ type: 'INCREMENT_US_CURRENT_Q_NUM' });
    }, `${QuizParticipantManager.ROLE} winners`);
  }

  /**
   * Removes winners display listener
   */
  public removeWinnersListener(): void {
    this.removeListener('player_winners', null, `${QuizParticipantManager.ROLE} winners`);
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
    const dispatchAdapter: LegacyDispatch = QuizSocketBase.createReduxAdapter(
      dispatch, 
      QuizSocketBase.standardReduxActionMap
    );

    return new QuizParticipantManager(dispatchAdapter);
  }
}