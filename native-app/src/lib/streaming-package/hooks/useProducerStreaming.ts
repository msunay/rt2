import { Logger, LogLevel } from '@/src/utils/logger';
import { useCallback, useEffect, useState } from 'react';
import { StreamingRole, TurnCredentials } from '../core/types';
import { useStreaming } from './useStreaming';

export interface UseProducerStreamingOptions {
    turnCredentials: TurnCredentials | null;
    autoConnect?: boolean;
    autoStartVideo?: boolean;
    onError?: (error: Error) => void;
    onStreamStarted?: () => void;
    onStreamStopped?: () => void;
    useIce: boolean;
}

export function useProducerStreaming(options: UseProducerStreamingOptions) {
    const { logInfo, logError, logDebug } = new Logger('useProducerStreaming', { minLevel: LogLevel.DEBUG });
    const [hasLocalMedia, setHasLocalMedia] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const { connectionState, isStreaming, localStream, error, connect, disconnect, stopStream, getLocalMedia } =
        useStreaming({
            role: StreamingRole.PRODUCER,
            turnCredentials: options.turnCredentials,
            autoConnect: options.autoConnect,
            onError: options.onError,
            useIce: options.useIce,
            onStreamStarted: options.onStreamStarted,
        });

    // Get local media
    const startVideo = useCallback(async () => {
        logDebug('Starting video...');
        try {
            const stream = await getLocalMedia();
            setHasLocalMedia(true);
            return stream;
        } catch (error) {
            setHasLocalMedia(false);
            options.onError?.(error as Error);
            throw error;
        }
    }, [getLocalMedia, options]);

    // Connect and start streaming
    const startStreaming = useCallback(async () => {
        logDebug('Starting streaming...');
        if (isStreaming) return;

        setIsConnecting(true);

        try {
            // Ensure we have video first
            if (!hasLocalMedia) {
                await startVideo();
            }

            // Connect and start stream
            await connect();
        } catch (error) {
            options.onError?.(error as Error);
        } finally {
            setIsConnecting(false);
        }
    }, [isStreaming, hasLocalMedia, connectionState, startVideo, connect, options]);

    // Stop streaming
    const stopStreaming = useCallback(() => {
        logDebug('Stopping streaming...');
        if (!isStreaming) return;
        stopStream();
        setHasLocalMedia(false);
        options.onStreamStopped?.();
    }, [stopStream, options]);

    // Auto start video if requested
    useEffect(() => {
        if (options.autoStartVideo && !hasLocalMedia) {
            startVideo();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isStreaming) {
                stopStreaming();
            }
            disconnect();
        };
    }, []);

    return {
        // State
        hasLocalMedia,
        isConnecting,
        isStreaming,
        connectionState,
        localStream,
        error,

        // Actions
        startVideo,
        startStreaming,
        stopStreaming,
        disconnect,
    };
}
