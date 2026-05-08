import { AppDispatch } from "@/src/store";
import { QuizSocketBase, LegacyDispatch } from "@/src/services/quizSocketBase";

/**
 * Socket manager for quiz hosts/broadcasters
 */
export class QuizBroadcasterManager extends QuizSocketBase {
  private static readonly ROLE = "Broadcaster";

  /**
   * Sets up connection success listener and automatically joins the specified room
   * @param quizId Quiz ID to join
   */
  public setupConnectionListeners(quizId: string): void {
    super.setupConnectionListeners(quizId, QuizBroadcasterManager.ROLE);
  }

  /**
   * Removes connection success listener
   */
  public removeConnectionListeners(): void {
    super.removeConnectionListeners(QuizBroadcasterManager.ROLE);
  }

  /**
   * Sets up question timer listener
   */
  public setupQuestionTimerListener(): void {
    super.setupQuestionTimerListener(
      () => this.dispatchAction({ type: "SET_HVS_Q_HIDDEN", payload: false }),
      QuizBroadcasterManager.ROLE
    );
  }

  /**
   * Removes question timer listener
   */
  public removeQuestionTimerListener(): void {
    super.removeQuestionTimerListener(QuizBroadcasterManager.ROLE);
  }

  /**
   * Sets up answer reveal listener
   */
  public setupAnswerRevealListener(): void {
    this.addListener(
      "reveal_answers_host",
      () => {
        setTimeout(() => {
          this.dispatchAction({ type: "SET_HVS_Q_HIDDEN", payload: true });
        }, 2000);
      },
      `${QuizBroadcasterManager.ROLE} answer reveal`
    );
  }

  /**
   * Removes answer reveal listener
   */
  public removeAnswerRevealListener(): void {
    this.removeListener(
      "reveal_answers_host",
      null,
      `${QuizBroadcasterManager.ROLE} answer reveal`
    );
  }

  /**
   * Sets up winners display listener
   */
  public setupWinnersListener(): void {
    this.addListener(
      "host_winners",
      () => {
        console.log(`${QuizBroadcasterManager.ROLE} winners received`);
        this.dispatchAction({
          type: "INCREMENT_HVS_TRIGGER",
          payload: undefined,
        });
      },
      `${QuizBroadcasterManager.ROLE} winners`
    );
  }

  /**
   * Removes winners display listener
   */
  public removeWinnersListener(): void {
    this.removeListener(
      "host_winners",
      null,
      `${QuizBroadcasterManager.ROLE} winners`
    );
  }

  /**
   * Emits event to start the quiz
   * @param quizId Quiz ID
   */
  public startQuiz(quizId: string): void {
    this.getSocket().emit("host_start_quiz", { roomId: quizId });
  }

  /**
   * Emits event to proceed to the next question
   * @param quizId Quiz ID
   */
  public nextQuestion(quizId: string): void {
    this.getSocket().emit("next_question", { roomId: quizId });
  }

  /**
   * Emits event to show winners
   * @param quizId Quiz ID
   */
  public showWinners(quizId: string): void {
    this.getSocket().emit("show_winners", { roomId: quizId });
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
  public static withReduxDispatch(
    dispatch: AppDispatch
  ): QuizBroadcasterManager {
    // Create an adapter that translates legacy actions to Redux actions
    const dispatchAdapter: LegacyDispatch = QuizSocketBase.createReduxAdapter(
      dispatch,
      QuizSocketBase.standardReduxActionMap
    );

    return new QuizBroadcasterManager(dispatchAdapter);
  }
}
