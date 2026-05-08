export interface QuizListenEvents {
  next_question: ({ roomId }: { roomId: string }) => void;
  host_start_quiz: ({ roomId }: { roomId: string }) => void;
  show_winners: ({ roomId }: { roomId: string }) => void;
  join_room: ({ roomId }: { roomId: string }) => void;
}

export interface QuizEmitEvents {
  start_quiz: () => void;
  connection_success: ({ socketId }: { socketId: string }) => void;
  start_question_timer: () => void;
  reveal_answers: () => void;
  reveal_answers_host: () => void;
  host_winners: () => void;
  player_winners: () => void;
}
