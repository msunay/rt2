import { AppData, RtpCapabilities } from 'mediasoup-client/types';
import { MediaStream } from 'react-native-webrtc';
import { Constraints } from 'react-native-webrtc/lib/typescript/getUserMedia';

export enum ConnectionState {
    IDLE = 'IDLE',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    FAILED = 'FAILED',
    CLOSED = 'CLOSED',
}

export enum StreamingRole {
    PRODUCER = 'PRODUCER',
    CONSUMER = 'CONSUMER',
}

export interface TurnCredentials {
    username: string;
    credential: string;
}

export interface StreamingConfig {
    role: StreamingRole;
    turnCredentials: TurnCredentials | null;
    mediaConstraints?: Constraints;
    encodingParams?: AppData;
    serverUrl?: string;
    useIce: boolean;
}

export interface ProducerConfig {
    localStream: MediaStream;
    encodingParams?: AppData;
}

export interface ConsumerConfig {
    rtpCapabilities: RtpCapabilities;
}

export interface StreamingState {
    connectionState: ConnectionState;
    isStreaming: boolean;
    error: Error | null;
    localStream?: MediaStream;
    remoteStream?: MediaStream;
    stats?: StreamingStats;
}

export interface StreamingStats {
    bytesSent?: number;
    bytesReceived?: number;
    packetsSent?: number;
    packetsReceived?: number;
    bitrate?: number;
    latency?: number;
}

export interface StreamingEvents {
    onConnectionStateChange?: (state: ConnectionState) => void;
    onLocalStreamReady?: (stream: MediaStream) => void;
    onRemoteStreamReady?: (stream: MediaStream) => void;
    onError?: (error: Error) => void;
    onStats?: (stats: StreamingStats) => void;
    onProducerClosed?: () => void;
    onConsumerClosed?: () => void;
}

export interface IStreamingProvider {
    connect(): Promise<void>;
    disconnect(): void;

    // Producer methods
    startProducing(stream: MediaStream): Promise<void>;
    stopProducing(): void;

    // Consumer methods
    startConsuming(): Promise<void>;
    stopConsuming(): void;

    // State and events
    getState(): StreamingState;
    on<K extends keyof StreamingEvents>(event: K, handler: StreamingEvents[K]): void;
    off<K extends keyof StreamingEvents>(event: K, handler?: StreamingEvents[K]): void;
}

export interface ISocketManager {
    connect(): void;
    disconnect(): void;
    emit<T = any>(event: string, data?: any): Promise<T>;
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler?: (...args: any[]) => void): void;
    isConnected(): boolean;
}
