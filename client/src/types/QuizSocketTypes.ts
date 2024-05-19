export interface QuizClientToServerEvents {
  next_question: ({ roomId }: { roomId: string }) => void;
  host_start_quiz: ({ roomId }: { roomId: string }) => void;
  show_winners: ({ roomId }: { roomId: string }) => void;
  join_room: ({ roomId }: { roomId: string }) => void;
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
