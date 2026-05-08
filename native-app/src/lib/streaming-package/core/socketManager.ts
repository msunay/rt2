import { io, Socket } from 'socket.io-client';
import { ISocketManager } from './types';
import { Logger } from '@/src/utils/logger';

/**
 * Type for socket responses that can include errors
 */
type SocketResponse<T> = T | { error: string };

export class SocketManager extends Logger implements ISocketManager {
    private socket: Socket | null = null;
    private readonly namespace: string;
    private readonly serverUrl: string;
    private eventHandlers: Map<string, Set<Function>> = new Map();

    constructor(namespace: 'mediasoup' | 'quizspace', serverUrl: string) {
        super('SocketManager');
        this.namespace = namespace;
        this.serverUrl = serverUrl;
    }

    connect(): void {
        if (this.socket?.connected) {
            this.logInfo(`Already connected to ${this.namespace}`);
            return;
        }

        this.socket = io(`${this.serverUrl}/${this.namespace}`, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5,
            timeout: 10000,
            autoConnect: true,
        });

        this.setupInternalHandlers();
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.eventHandlers.clear();
    }

    emit<T = any>(event: string, data?: any): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Socket not connected'));
                return;
            }

            // For events with callbacks
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout waiting for ${event} acknowledgment`));
            }, 10000);

            // Events that don't expect any response
            if (event === 'transport_connect' || event === 'transport_recv_connect' || event === 'consumer_resume') {
                clearTimeout(timeout);
                this.socket.emit(event, data);
                resolve(undefined as T);
                return;
            }

            // Events that only take a callback (no data parameter)
            if (event === 'create_room' || event === 'getRtpCapabilities') {
                this.socket.emit(event, (response: SocketResponse<T>) => {
                    clearTimeout(timeout);

                    if (response && typeof response === 'object' && 'error' in response) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response as T);
                    }
                });
                return;
            }

            // Events that take data and callback
            this.socket.emit(event, data || {}, (response: SocketResponse<T>) => {
                clearTimeout(timeout);

                if (response && typeof response === 'object' && 'error' in response) {
                    reject(new Error(response.error));
                } else {
                    resolve(response as T);
                }
            });
        });
    }

    on(event: string, handler: (...args: any[]) => void): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }

        this.eventHandlers.get(event)!.add(handler);

        if (this.socket) {
            this.socket.on(event, handler);
        }
    }

    off(event: string, handler?: (...args: any[]) => void): void {
        if (handler) {
            this.eventHandlers.get(event)?.delete(handler);
            this.socket?.off(event, handler);
        } else {
            this.eventHandlers.delete(event);
            this.socket?.off(event);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    private setupInternalHandlers(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.logInfo(`Socket connected to ${this.namespace}`);
            // Re-attach all event handlers
            this.eventHandlers.forEach((handlers, event) => {
                handlers.forEach((handler) => {
                    this.socket!.on(event, handler as any);
                });
            });
        });

        this.socket.on('disconnect', (reason) => {
            this.logInfo(`Socket disconnected from ${this.namespace}reason`, reason);
        });

        this.socket.on('connect_error', (error) => {
            this.logError(`Socket connection error for ${this.namespace}`, error);
        });
    }
}
