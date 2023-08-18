export interface QuizClientToServerEvents {

}

export interface QuizServerToClientEvents {
  connection_success: ({ socketId }: { socketId: string }) => void;

}