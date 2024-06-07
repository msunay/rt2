import type { QuizClientToServerEvents, QuizServerToClientEvents } from "@/types/QuizSocketTypes";
import type { Dispatch } from "react";
import { io, type Socket } from "socket.io-client";

const BASE_URL: string =
  process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL || ''
    : process.env.EXPO_PUBLIC_LOCAL_IP || '';

export class SocketManager {

  private socket: Socket<QuizServerToClientEvents, QuizClientToServerEvents>;

  constructor(namespace: string) {
    this.socket = io(`${BASE_URL}${namespace}`, {
      // reconnectionAttempts: 3, // Limit reconnection attempts
      // reconnectionDelay: 1000, // Delay between reconnections
      reconnection: true,
      reconnectionAttempts: 5, // Number of reconnection attempts
      reconnectionDelay: 1000, // Time between reconnection attempts
      reconnectionDelayMax: 5000, // Maximum delay between reconnections
      randomizationFactor: 0.5 // Randomization factor for reconnection delay
    });
  }

  public getSocket = () => this.socket;

  disconnect = () => {
    console.log('disconnecting...');
    this.socket.disconnect()
  };
}