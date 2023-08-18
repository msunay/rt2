export interface QuizClientToServerEvents {
  next_question: () => void;
}

export interface QuizServerToClientEvents {
  connection_success: ({ socketId }: { socketId: string }) => void;
}