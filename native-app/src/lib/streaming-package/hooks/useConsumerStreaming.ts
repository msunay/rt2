import { Logger, LogLevel } from '@/src/utils/logger';
import { useCallback, useEffect, useState } from 'react';
import { ConnectionState, StreamingRole, TurnCredentials } from '../core/types';
import { toMediasoupStream } from '../core/utils';
import { useStreaming } from './useStreaming';

export interface UseConsumerStreamingOptions {
    turnCredentials: TurnCredentials | null;
    autoConnect?: boolean;
    autoStartConsuming?: boolean;
    onError?: (error: Error) => void;
    onStreamReceived?: (stream: MediaStream) => void;
    onStreamLost?: () => void;
    useIce: boolean;
}

export function useConsumerStreaming(options: UseConsumerStreamingOptions) {
    const { logInfo, logError, logDebug } = new Logger('useConsumerStreaming', { minLevel: LogLevel.DEBUG });

    const [isConnecting, setIsConnecting] = useState(false);
    const [viewKey, setViewKey] = useState(0); // For forcing RTCView re-render

    const { connectionState, isStreaming, remoteStream, error, connect, disconnect, stopStream } =
        useStreaming({
            role: StreamingRole.CONSUMER,
            turnCredentials: options.turnCredentials,
            autoConnect: options.autoConnect,
            onRemoteStreamReady: (stream) => {
                options.onStreamReceived?.(toMediasoupStream(stream));
                // Force RTCView re-render
                setTimeout(() => setViewKey((prev) => prev + 1), 100);
            },
            onError: options.onError,
            useIce: options.useIce,
        });

    // Start consuming
    const startConsuming = useCallback(async () => {
        logDebug('Starting consuming...');
        if (isStreaming) return;

        setIsConnecting(true);

        try {
            // Connect and start stream
            await connect();
        } catch (error) {
            options.onError?.(error as Error);
        } finally {
            setIsConnecting(false);
        }
    }, [isStreaming, connectionState, connect, options]);

    // Stop consuming
    const stopConsuming = useCallback(() => {
        logDebug('Stopping consuming...');
        stopStream();
        options.onStreamLost?.();
    }, [stopStream, options]);

    // Auto start if requested
    useEffect(() => {
        if (options.autoStartConsuming && connectionState === 'CONNECTED' && !isStreaming) {
            startConsuming();
        }
    }, [connectionState, options.autoStartConsuming]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isStreaming) {
                stopConsuming();
            }
            disconnect();
        };
    }, []);

    return {
        // State
        isConnecting,
        isStreaming,
        isConnected: connectionState === 'CONNECTED',
        connectionState,
        remoteStream,
        error,
        viewKey, // For RTCView re-render

        // Actions
        startConsuming,
        stopConsuming,
        disconnect,
    };
}
