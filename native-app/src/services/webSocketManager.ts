import { io } from "socket.io-client";
import { NamespaceEventMap, NamespaceSocket } from "../types/NamespaceEventMap";
import { ConnectionState } from "../types/CommonSocketTypes";

const BASE_URL: string = process.env.EXPO_PUBLIC_SERVER_IP || "";

/**
 * Base socket manager class that handles connection to a namespace
 */
export class WebSocketManager<Namespace extends keyof NamespaceEventMap> {
  private socket: NamespaceSocket<Namespace>;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private connectionError: Error | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;

  /**
   * Creates a new socket manager for the specified namespace
   * @param namespace The socket.io namespace
   */
  constructor(namespace: Namespace) {
    this.socket = io(`${BASE_URL}/${namespace}`, {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 10000, // Connection timeout in ms
      autoConnect: true,
    }) as NamespaceSocket<Namespace>;

    this.setupSocketStateHandlers(namespace);
  }

  /**
   * Set up handlers for socket connection state changes
   * @param namespace The socket.io namespace (for logging)
   * @private
   */
  private setupSocketStateHandlers(namespace: Namespace): void {
    // Connection successful
    this.socket.on("connect", () => {
      this.connectionState = ConnectionState.CONNECTED;
      this.connectionError = null;
      this.reconnectAttempts = 0;
      this.log(`Socket connected to ${namespace} namespace`);
    });

    // Connection error
    this.socket.on("connect_error", (error) => {
      this.connectionState = ConnectionState.ERROR;
      this.connectionError = error;
      this.log(
        `Socket connection error for ${namespace} namespace: ${error.message}`,
        "error"
      );
    });

    // Disconnection
    this.socket.on("disconnect", (reason) => {
      this.connectionState = ConnectionState.DISCONNECTED;
      this.log(`Socket disconnected from ${namespace} namespace: ${reason}`);

      // Handle various disconnect reasons
      if (reason === "io server disconnect") {
        // Server disconnected us, we need to manually reconnect
        this.socket.connect();
      }
      // For 'io client disconnect', the socket won't auto reconnect
    });

    // Reconnection attempt
    // @ts-expect-error: this built-in event isn't in our type map
    this.socket.on("reconnect_attempt", (attemptNumber) => {
      this.connectionState = ConnectionState.CONNECTING;
      this.reconnectAttempts = attemptNumber;
      this.log(
        `Socket reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts} for ${namespace} namespace`
      );
    });

    // Reconnection error
    // @ts-expect-error: this built-in event isn't in our type map
    this.socket.on("reconnect_error", (error) => {
      this.connectionState = ConnectionState.ERROR;
      this.connectionError = error;
      this.log(
        `Socket reconnection error for ${namespace} namespace: ${error.message}`,
        "error"
      );
    });

    // Reconnection failed after all attempts
    // @ts-expect-error: this built-in event isn't in our type map
    this.socket.on("reconnect_failed", () => {
      this.connectionState = ConnectionState.ERROR;
      this.connectionError = new Error("Maximum reconnection attempts reached");
      this.log(
        `Socket reconnection failed after ${this.maxReconnectAttempts} attempts for ${namespace} namespace`,
        "error"
      );
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
   * Gets the current connection state
   * @returns The connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Gets the current connection error, if any
   * @returns The connection error or null if none
   */
  public getConnectionError(): Error | null {
    return this.connectionError;
  }

  /**
   * Adds an event listener to the socket
   * @param event Event name
   * @param callback Event callback
   * @param logMessage Optional log message
   */
  protected addListener<
    E extends keyof NamespaceEventMap[Namespace]["serverToClient"]
  >(
    event: E,
    callback: (
      data: NamespaceEventMap[Namespace]["serverToClient"][E] extends (
        data: infer T
      ) => void
        ? T
        : never
    ) => void,
    logMessage?: string
  ): void {
    if (logMessage) {
      this.log(`Setting up ${String(event)} listener: ${logMessage}`);
    }

    try {
      this.socket.on(event as any, (data: any) => {
        try {
          callback(data);
        } catch (error) {
          this.log(
            `Error in ${String(event)} callback: ${(error as Error).message}`,
            "error"
          );
        }
      });
    } catch (error) {
      this.log(
        `Error setting up ${String(event)} listener: ${(error as Error).message
        }`,
        "error"
      );
    }
  }

  /**
   * Removes an event listener from the socket
   * @param event Event name
   * @param callback Event callback
   * @param logMessage Optional log message
   */
  protected removeListener<
    E extends keyof NamespaceEventMap[Namespace]["serverToClient"]
  >(
    event: E,
    callback:
      | ((
        data: NamespaceEventMap[Namespace]["serverToClient"][E] extends (
          data: infer T
        ) => void
          ? T
          : never
      ) => void)
      | null,
    logMessage?: string
  ): void {
    if (logMessage) {
      this.log(`Removing ${String(event)} listener: ${logMessage}`);
    }

    try {
      if (callback) {
        this.socket.off(event as any, callback);
      } else {
        this.socket.off(event as any);
      }
    } catch (error) {
      this.log(
        `Error removing ${String(event)} listener: ${(error as Error).message}`,
        "error"
      );
    }
  }

  /**
   * Emits an event to the socket with error handling
   * @param event Event name
   * @param data Event data
   * @param callback Callback function
   */
  protected emitWithErrorHandling<
    E extends keyof NamespaceEventMap[Namespace]["clientToServer"],
    D extends NamespaceEventMap[Namespace]["clientToServer"][E] extends (data: infer T) => any ? T : never
  >(
    event: E,
    data: D,
    callback?: (...args: any[]) => void
  ): void {
    try {
      if (callback) {
        this.socket.emit(event as any, data, (...args: any[]) => {
          try {
            callback(...args);
          } catch (error) {
            this.log(
              `Error in emit callback for ${String(event)}: ${
                (error as Error).message
              }`,
              "error"
            );
          }
        });
      } else {
        this.socket.emit(event as any, data);
      }
    } catch (error) {
      this.log(
        `Error emitting ${String(event)}: ${(error as Error).message}`,
        "error"
      );
    }
  }

  /**
   * Forcefully connect the socket if not already connected
   */
  public connect(): void {
    if (this.connectionState !== ConnectionState.CONNECTED) {
      this.socket.connect();
    }
  }

  /**
   * Disconnects the socket
   */
  public disconnect(): void {
    this.log("Disconnecting socket...");
    this.socket.disconnect();
  }

  /**
   * Logs a message with optional level
   * @param message The message to log
   * @param level Log level (default: info)
   * @private
   */
  protected log(
    message: string,
    level: "info" | "warn" | "error" = "info"
  ): void {
    switch (level) {
      case "warn":
        console.warn(`[WebSocketManager] ${message}`);
        break;
      case "error":
        console.error(`[WebSocketManager] ${message}`);
        break;
      default:
        console.log(`[WebSocketManager] ${message}`);
    }
  }
}
