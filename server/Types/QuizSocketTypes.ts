export interface QuizClientToServerEvents {
  next_question: () => void;
  host_start_quiz: () => void;
}

export interface QuizServerToClientEvents {
  connection_success: ({ socketId }: { socketId: string }) => void;
  start_question_timer: () => void;
  reveal_answers: () => void;
  start_quiz: () => void;
  reveal_answers_host: () => void;

}