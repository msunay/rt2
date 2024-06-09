import type {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from '@/types/PeerSocketTypes';
import type {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '@/types/QuizSocketTypes';
import { type Socket, io } from 'socket.io-client';

const BASE_URL: string =
  process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL || ''
    : process.env.EXPO_PUBLIC_LOCAL_IP || '';

// Conditional typing for socket.io-client
type NamespaceEventMap = {
  quizspace: {
    serverToClient: QuizServerToClientEvents;
    clientToServer: QuizClientToServerEvents;
  };
  mediasoup: {
    serverToClient: PeersServerToClientEvents;
    clientToServer: PeersClientToServerEvents;
  };
};

type NamespaceSocket<Namespace extends keyof NamespaceEventMap> = Socket<
  NamespaceEventMap[Namespace]['serverToClient'],
  NamespaceEventMap[Namespace]['clientToServer']
>;

export class SocketManager<Namespace extends keyof NamespaceEventMap> {
  private socket: NamespaceSocket<Namespace>;

  constructor(namespace: string) {
    this.socket = io(`${BASE_URL}${namespace}`, {
      reconnection: true,
      reconnectionAttempts: 5, // Number of reconnection attempts
      reconnectionDelay: 1000, // Time between reconnection attempts
      reconnectionDelayMax: 5000, // Maximum delay between reconnections
      randomizationFactor: 0.5, // Randomization factor for reconnection delay
    });
  }

  public getSocket = () => this.socket;

  disconnect = () => {
    console.log('disconnecting...');
    this.socket.disconnect();
  };
}
