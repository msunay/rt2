import type {
    PeersClientToServerEvents,
    PeersServerToClientEvents,
  } from './PeerSocketTypes';
  import type {
    QuizClientToServerEvents,
    QuizServerToClientEvents,
  } from './QuizSocketTypes';
  import { type Socket } from 'socket.io-client';

  /**
   * Event map for socket.io namespaces
   */
  export type NamespaceEventMap = {
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
  export type NamespaceSocket<Namespace extends keyof NamespaceEventMap> = Socket<
    NamespaceEventMap[Namespace]["serverToClient"],
    NamespaceEventMap[Namespace]["clientToServer"]
  >;