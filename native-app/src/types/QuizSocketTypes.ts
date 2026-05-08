import {
  CommonSocketClientToServerEvents,
  CommonSocketServerToClientEvents,
} from "./CommonSocketTypes";

/**
 * Events sent from client to server for quiz functionality
 */
export interface QuizClientToServerEvents
  extends CommonSocketClientToServerEvents {
  // Move to the next question in the quiz
  next_question: ({ roomId }: { roomId: string }) => void;

  // Host starts the quiz
  host_start_quiz: ({ roomId }: { roomId: string }) => void;

  // Show winners screen
  show_winners: ({ roomId }: { roomId: string }) => void;

  // Join a quiz room
  join_room: ({ roomId }: { roomId: string }) => void;
}

export interface QuizServerToClientEvents
  extends CommonSocketServerToClientEvents {
  // Connection established successfully
  connection_success: ({ socketId }: { socketId: string }) => void;

  // Start the timer for the current question
  start_question_timer: () => void;

  // Set the current question
  set_question: ({
    currentQuestionNumber,
  }: {
    currentQuestionNumber: number;
  }) => void;

  // Quiz has started
  start_quiz: () => void;

  // Reveal answers to all players
  reveal_answers: () => void;

  // Reveal answers specifically for the host (may include additional data)
  reveal_answers_host: () => void;

  // Display winners screen for the host
  host_winners: () => void;

  // Display winners screen for players
  player_winners: () => void;
}
