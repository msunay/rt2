/**
 * Socket.IO built-in events sent from server to client
 */
export interface CommonSocketServerToClientEvents {
    // Connection established successfully
    connect: () => void;

    // Connection error
    connect_error: (error: Error) => void;

    // Socket disconnection
    disconnect: (reason: string) => void;

  }

  /**
   * Socket.IO built-in events sent from client to server
   */
  export interface CommonSocketClientToServerEvents {
    // Disconnect request
    disconnect: () => void;
  }

  /**
   * Connection state enum
   */
  export enum ConnectionState {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    ERROR = "error",
  }