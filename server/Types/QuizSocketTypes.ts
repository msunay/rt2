export interface QuizClientToServerEvents {
  next_question: ({ currentQuestionNumber }: { currentQuestionNumber: number }) => void;
  host_start_quiz: () => void;
}

export interface QuizServerToClientEvents {
  connection_success: ({ socketId }: { socketId: string }) => void;
  start_question_timer: () => void;
  reveal_answers: () => void;
  set_question: ({ currentQuestionNumber }: { currentQuestionNumber: number }) => void;
  start_quiz: () => void;
}