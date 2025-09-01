import { Logger, LogLevel } from '@/src/utils/logger';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { mediaDevices, MediaStream } from 'react-native-webrtc';
import { MediaSoupClient } from '../core/mediasoupClient';
import { StreamingConfiguration } from '../core/stremingConfig';
import { ConnectionState, IStreamingProvider, StreamingConfig, StreamingEvents, StreamingState } from '../core/types';

export interface UseStreamingOptions extends StreamingConfig {
    autoConnect?: boolean;
    onConnectionStateChange?: (state: ConnectionState) => void;
    onError?: (error: Error) => void;
    onLocalStreamReady?: (stream: MediaStream) => void;
    onRemoteStreamReady?: (stream: MediaStream) => void;
    onStats?: (stats: any) => void;
    useIce: boolean;
    onStreamStarted?: () => void;
}

export interface UseStreamingReturn {
    // State
    connectionState: ConnectionState;
    isStreaming: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    error: Error | null;

    // Actions
    connect: () => Promise<void>;
    disconnect: () => void;
    stopStream: () => void;
    getLocalMedia: () => Promise<MediaStream>;
}

export function useStreaming(options: UseStreamingOptions): UseStreamingReturn {
    const { logInfo, logError, logDebug } = new Logger('useStreaming', { minLevel: LogLevel.DEBUG });
    const [state, setState] = useState<StreamingState>({
        connectionState: ConnectionState.IDLE,
        isStreaming: false,
        error: null,
    });

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const clientRef = useRef<IStreamingProvider | null>(null);
    const optionsRef = useRef(options);

    // Update options ref when they change
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    // Initialize client
    useEffect(() => {
        if (!clientRef.current && (!options.useIce || (options.useIce && options.turnCredentials))) {
            clientRef.current = new MediaSoupClient(options);

            // Setup event handlers
            const events: StreamingEvents = {
                onConnectionStateChange: (connectionState) => {
                    setState((prev) => ({ ...prev, connectionState }));
                    optionsRef.current.onConnectionStateChange?.(connectionState);
                },
                onError: (error) => {
                    setState((prev) => ({ ...prev, error }));
                    optionsRef.current.onError?.(error);
                },
                onLocalStreamReady: (stream) => {
                    setLocalStream(stream);
                    optionsRef.current.onLocalStreamReady?.(stream);
                },
                onRemoteStreamReady: (stream) => {
                    setRemoteStream(stream);
                    optionsRef.current.onRemoteStreamReady?.(stream);
                },
                onStats: (stats) => {
                    optionsRef.current.onStats?.(stats);
                },
            };

            Object.entries(events).forEach(([event, handler]) => {
                clientRef.current!.on(event as keyof StreamingEvents, handler as any);
            });
        }

        // Auto-connect if requested
        if (options.autoConnect && state.connectionState === ConnectionState.IDLE) {
            connect();
        }

        // Cleanup
        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect();
                clientRef.current = null;
            }
        };
    }, [options.turnCredentials]);

    useEffect(() => {
        if (state.connectionState === ConnectionState.CONNECTED && !state.isStreaming) {
            logDebug('Connection state changed to CONNECTED');
            startStream();
        }
    }, [state.connectionState, state.isStreaming]);

    const connect = useCallback(async (): Promise<void> => {
        if (!clientRef.current) {
            logError('Streaming client not initialized');
            return;
        }

        if (state.connectionState === ConnectionState.CONNECTED) {
            logDebug('Already connected.');
            return;
        }

        logDebug('Attempting to establish connection...');
        setState((prev) => ({ ...prev, connectionState: ConnectionState.CONNECTING }));

        try {
            await clientRef.current.connect();
            setState((prev) => ({ ...prev, connectionState: ConnectionState.CONNECTED }));
            logDebug('Connection successfully established');
            return;
        } catch (error) {
            logError('Failed to connect:', error);
            setState((prev) => ({
                ...prev,
                connectionState: ConnectionState.FAILED,
                error: error as Error,
            }));
            return;
        }
    }, []);

    const disconnect = useCallback(() => {
        if (!clientRef.current) return;

        clientRef.current.disconnect();
        setState({
            connectionState: ConnectionState.DISCONNECTED,
            isStreaming: false,
            error: null,
        });
        setLocalStream(null);
        setRemoteStream(null);
    }, []);

    const getLocalMedia = useCallback(async (): Promise<MediaStream> => {
        try {
            const constraints = options.mediaConstraints || StreamingConfiguration.getMediaConstraints();
            const stream = await mediaDevices.getUserMedia(constraints);

            logInfo('Got media stream:', {
                tracks: stream.getTracks().map((t) => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState,
                })),
            });

            return stream;
        } catch (error) {
            logError('Failed to get user media:', error);
            Alert.alert('Media Error', 'Unable to access camera and microphone');
            throw error;
        }
    }, [options.mediaConstraints]);

    const startStream = useCallback(async () => {
        logDebug('Starting stream...');
        if (!clientRef.current) {
            throw new Error('Client not initialized');
        }

        logDebug('Connection state:', state.connectionState);
        if (state.connectionState !== ConnectionState.CONNECTED) {
            throw new Error('Not connected. Call connect() first');
        }

        try {
            if (options.role === 'PRODUCER') {
                const stream = localStream || (await getLocalMedia());
                setLocalStream(stream);
                await clientRef.current.startProducing(stream);
            } else {
                await clientRef.current.startConsuming();
            }

            setState((prev) => ({ ...prev, isStreaming: true }));
            logDebug('Streaming started');
            options.onStreamStarted?.();
        } catch (error) {
            logError('Failed to start stream:', error);
            setState((prev) => ({ ...prev, error: error as Error }));
            throw error;
        }
    }, [state.connectionState, localStream, options.role, getLocalMedia, options.onStreamStarted]);

    const stopStream = useCallback(() => {
        if (!clientRef.current) return;

        if (options.role === 'PRODUCER') {
            clientRef.current.stopProducing();
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
                setLocalStream(null);
            }
        } else {
            clientRef.current.stopConsuming();
            setRemoteStream(null);
        }

        setState((prev) => ({ ...prev, isStreaming: false }));
    }, [options.role, localStream]);

    return {
        connectionState: state.connectionState,
        isStreaming: state.isStreaming,
        localStream,
        remoteStream,
        error: state.error,
        connect,
        disconnect,
        stopStream,
        getLocalMedia,
    };
}
