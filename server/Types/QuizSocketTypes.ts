export interface QuizClientToServerEvents {
  next_question: () => void;
}

export interface QuizServerToClientEvents {
  connection_success: ({ socketId }: { socketId: string }) => void;
  start_question_timer: () => void;
  reveal_answers: () => void;
}