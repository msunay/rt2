export interface QuizClientToServerEvents {
  next_question: () => void;
  host_start_quiz: () => void;
  show_winners: () => void;
}

export interface QuizServerToClientEvents {
  connection_success: ({ socketId }: { socketId: string }) => void;
  start_question_timer: () => void;
  set_question: ({
    currentQuestionNumber,
  }: {
    currentQuestionNumber: number;
  }) => void;
  start_quiz: () => void;
  reveal_answers: () => void;
  reveal_answers_host: () => void;
  host_winners: () => void;
  player_winners: () => void;
}

interface nextQuestion {
  currentQuestionNumber: number;
  quizStarted: boolean;
}
