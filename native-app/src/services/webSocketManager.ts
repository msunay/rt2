import type {
  PeersClientToServerEvents,
  PeersServerToClientEvents,
} from '@/src/types/PeerSocketTypes';
import type {
  QuizClientToServerEvents,
  QuizServerToClientEvents,
} from '@/src/types/QuizSocketTypes';
import { type Socket, io } from 'socket.io-client';

const BASE_URL: string = process.env.EXPO_PUBLIC_SERVER_IP || '';

/**
 * Event map for socket.io namespaces
 */
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

/**
 * Type for a socket with a specific namespace
 */
type NamespaceSocket<Namespace extends keyof NamespaceEventMap> = Socket<
  NamespaceEventMap[Namespace]['serverToClient'],
  NamespaceEventMap[Namespace]['clientToServer']
>;

/**
 * Base socket manager class that handles connection to a namespace
 */
export class WebSocketManager<Namespace extends keyof NamespaceEventMap> {
  private socket: NamespaceSocket<Namespace>;

  /**
   * Creates a new socket manager for the specified namespace
   * @param namespace The socket.io namespace
   */
  constructor(namespace: Namespace) {
    this.socket = io(`${BASE_URL}/${namespace}`, {
      reconnection: true,
      reconnectionAttempts: 5, // Number of reconnection attempts
      reconnectionDelay: 1000, // Time between reconnection attempts
      reconnectionDelayMax: 5000, // Maximum delay between reconnections
      randomizationFactor: 0.5, // Randomization factor for reconnection delay
    }) as NamespaceSocket<Namespace>;
    
    this.socket.on('connect', () => {
      console.log(`Socket connected to ${namespace} namespace`);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected from ${namespace} namespace: ${reason}`);
    });
  }

  /**
   * Gets the socket instance
   * @returns The socket instance
   */
  protected getSocket(): NamespaceSocket<Namespace> {
    return this.socket;
  }

  /**
   * Adds an event listener to the socket
   * @param event Event name
   * @param callback Event callback
   */
  protected addListener<E extends keyof NamespaceEventMap[Namespace]['serverToClient']>(
    event: E,
    callback: (data: NamespaceEventMap[Namespace]['serverToClient'][E] extends (data: infer T) => void ? T : never) => void,
    logMessage?: string
  ): void {
    if (logMessage) {
      console.log(`Setting up ${String(event)} listener: ${logMessage}`);
    }
    this.socket.on(event as any, callback);
  }

  /**
   * Removes an event listener from the socket
   * @param event Event name
   * @param callback Event callback
   */
  protected removeListener<E extends keyof NamespaceEventMap[Namespace]['serverToClient']>(
    event: E,
    callback: ((data: NamespaceEventMap[Namespace]['serverToClient'][E] extends (data: infer T) => void ? T : never) => void) | null,
    logMessage?: string
  ): void {
    if (logMessage) {
      console.log(`Removing ${String(event)} listener: ${logMessage}`);
    }
    
    if (callback) {
      this.socket.off(event as any, callback);
    } else {
      this.socket.off(event as any);
    }
  }

  /**
   * Disconnects the socket
   */
  public disconnect(): void {
    console.log('Disconnecting socket...');
    this.socket.disconnect();
  }
}