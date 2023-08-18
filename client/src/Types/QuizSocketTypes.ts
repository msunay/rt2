export interface QuizClientToServerEvents {
  host_start_quiz: () => void;
  next_question: () => void;
}

export interface QuizServerToClientEvents {
  connection_success: ({ socketId }: { socketId: string }) => void;
  start_question_timer: () => void;
  set_question: ({ currentQuestionNumber }: { currentQuestionNumber: number }) => void;
  start_quiz: () => void;
}


interface nextQuestion {
  currentQuestionNumber: number;
  quizStarted: boolean;
}