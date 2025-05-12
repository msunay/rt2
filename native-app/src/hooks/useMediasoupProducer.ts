import { router } from 'expo-router';
import { AppData, Device, Producer, RtpCapabilities, Transport } from 'mediasoup-client/types';
import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { mediaDevices, MediaStream } from 'react-native-webrtc';
import {
    setProducerConnectionError,
    setProducerHasLocalMedia,
    setProducerIsConnecting,
    setProducerStreamingStatus,
} from '../features/mediaStreamSlice';
import type { MediaStreamBroadcaster } from '../services/mediaStreamBroadcaster';
import { useAppDispatch } from './reduxHooks';

const MEDIA_CONSTRAINTS: {
    audio: boolean;
    video: {
        facingMode: string;
        width: {
            min: number;
            max: number;
        };
        height: {
            min: number;
            max: number;
        };
    };
} = {
    audio: true,
    video: {
        facingMode: 'user',
        width: {
            min: 640,
            max: 1920,
        },
        height: {
            min: 400,
            max: 1080,
        },
    },
};

const DEFAULT_ENCODING_PARAMS: AppData = {
    encodings: [
        {
            rid: 'r0',
            maxBitrate: 100000,
            scalabilityMode: 'S1T3',
        },
        {
            rid: 'r1',
            maxBitrate: 300000,
            scalabilityMode: 'S1T3',
        },
        {
            rid: 'r2',
            maxBitrate: 900000,
            scalabilityMode: 'S1T3',
        },
    ],
    codecOptions: {
        videoGoogleStartBitrate: 1000,
    },
};

/**
 * Hook for mediasoup WebRTC functionality
 */
export const useMediasoupProducer = (streamSocketManager: MediaStreamBroadcaster) => {
    const dispatch = useAppDispatch();
    // const mediaStream = useAppSelector(
    //   (state) => state.mediaStreamSlice.mediaStream
    // );

    // Device and transport refs to persist across renders
    const localStreamRef = useRef<MediaStream | null>(null);
    const deviceRef = useRef<Device>(null);
    const producerTransportRef = useRef<Transport>(null);
    const producerRef = useRef<Producer>(null);
    const paramsRef = useRef<AppData>(DEFAULT_ENCODING_PARAMS);

    /**
     * Handles successful stream acquisition
     */
    const streamSuccess = useCallback(
        (stream: MediaStream) => {
            localStreamRef.current = stream;
            dispatch(setProducerHasLocalMedia(true));

            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                paramsRef.current = {
                    track: videoTrack,
                    ...paramsRef.current,
                };
            } else {
                console.warn('No video track found in the stream.');
                paramsRef.current = { ...DEFAULT_ENCODING_PARAMS, track: undefined };
            }
        },
        [dispatch]
    );

    /**
     * Gets local user media stream
     */
    const getLocalStream = useCallback(async () => {
        try {
            if (!localStreamRef.current) {
                const stream = await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
                streamSuccess(stream);
            }
        } catch (err) {
            console.error('Failed to get media stream:', err);
            Alert.alert('Camera Error', 'Unable to access camera and microphone.');
            dispatch(setProducerHasLocalMedia(false));
            dispatch(setProducerConnectionError('Failed to access camera/microphone.'));
        }
    }, [streamSuccess, dispatch]);

    /**
     * Create transport for sending media
     */
    const createSendTransport = useCallback(() => {
        if (!deviceRef.current) {
            console.error('Device not initialized');
            dispatch(setProducerIsConnecting(false));
            dispatch(setProducerConnectionError('Device not initialized'));
            return;
        }

        if (!paramsRef.current.track) {
            console.error('Track not available for createSendTransport');
            dispatch(setProducerIsConnecting(false));
            dispatch(setProducerConnectionError('Video track not available. Start video.'));
            return;
        }

        try {
            streamSocketManager.createProducerTransport((transport) => {
                console.log('createSendTransport (callback): Transport created by manager, storing in ref.');
                producerTransportRef.current = transport;

                if (transport && !transport.closed && !producerRef.current) {
                    console.log(
                        'createSendTransport (callback): Transport ref set, directly calling connectSendTransport.'
                    );
                    connectSendTransport(transport);
                } else {
                    console.log('createSendTransport (callback): Conditions not met for immediate connect.', {
                        transportClosed: transport?.closed,
                        hasProducer: !!producerRef.current,
                    });
                }
            }, deviceRef.current);
        } catch (err) {
            console.error('Failed to create send transport:', err);
            dispatch(setProducerIsConnecting(false));
            dispatch(setProducerConnectionError(err instanceof Error ? err.message : 'Transport creation failed'));
        }
    }, [dispatch, streamSocketManager]);

    /**
     * Create mediasoup device with router capabilities
     */
    const createDevice = useCallback(
        async (rtpCapabilities: RtpCapabilities) => {
            try {
                const device = new Device();
                await device.load({
                    routerRtpCapabilities: rtpCapabilities,
                });

                console.log('Device RTP Capabilities', device.rtpCapabilities);
                deviceRef.current = device;

                console.log('createDevice: Device created, now calling createSendTransport.');
                createSendTransport();
            } catch (err) {
                console.error('Failed to create device:', err);
                dispatch(setProducerIsConnecting(false));
                dispatch(setProducerConnectionError(err instanceof Error ? err.message : 'Unknown error'));

                const error = err as Error;
                if (error.name === 'UnsupportedError') {
                    Alert.alert('Error', 'Browser not supported for WebRTC.');
                }
            }
        },
        [dispatch, createSendTransport]
    );

    /**
     * Get RTP capabilities from server
     */
    const getRtpCapabilities = useCallback(() => {
        streamSocketManager.createRoom(createDevice);
    }, [streamSocketManager, createDevice]);

    /**
     * Start connection process
     */
    const connect = useCallback(() => {
        dispatch(setProducerIsConnecting(true));
        if (!localStreamRef.current) {
            console.error('No media stream available');
            dispatch(setProducerIsConnecting(false));
            dispatch(setProducerConnectionError('No media stream available'));
            return;
        }
        if (!deviceRef.current || !deviceRef.current.loaded) {
            getRtpCapabilities();
        } else {
            console.log('connect: Device already ready, calling createSendTransport...');
            createSendTransport();
        }
    }, [dispatch, getRtpCapabilities, createSendTransport]);

    /**
     * End streaming and clean up resources
     */
    const endStream = useCallback(
        ({ redirect = true }: { redirect?: boolean }) => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
                localStreamRef.current = null;
            }
            dispatch(setProducerHasLocalMedia(false));

            if (producerRef.current) {
                producerRef.current.close();
                producerRef.current = null;
            }

            if (producerTransportRef.current) {
                producerTransportRef.current.close();
                producerTransportRef.current = null;
            }

            dispatch(setProducerStreamingStatus({ isActive: false }));

            if (redirect) router.navigate('/');
        },
        [dispatch]
    );

    /**
     * Connect the send transport
     */
    const connectSendTransport = useCallback(
        async (producerTransport: Transport) => {
            try {
                if (!paramsRef.current.track) {
                    console.error('No track available to produce');
                    throw new Error('No track available');
                }

                const producer = await producerTransport.produce(paramsRef.current);
                producerRef.current = producer;

                producer.on('trackended', () => {
                    console.log('Track ended');
                    dispatch(setProducerStreamingStatus({ isActive: false }));
                });

                producer.on('transportclose', () => {
                    console.log('Transport ended');
                    producerRef.current = null; // Clear stale refs
                    producerTransportRef.current = null;
                    dispatch(setProducerStreamingStatus({ isActive: false }));
                });

                // Connection successful
                dispatch(setProducerStreamingStatus({ isActive: true }));
            } catch (err) {
                console.error('Failed to connect send transport:', err);
                dispatch(setProducerStreamingStatus({ isActive: false }));
                dispatch(setProducerConnectionError(err instanceof Error ? err.message : 'Connection failed'));
                Alert.alert('Connection Error', 'Failed to establish streaming connection.');
            }
        },
        [dispatch]
    );

    // Effect to connect transport once it's created
    // useEffect(() => {
    //     const transport = producerTransportRef.current;
    //     console.log(
    //         'useEffect [producer transport check]: transport?',
    //         !!transport,
    //         'transport closed?',
    //         transport?.closed,
    //         'producer?',
    //         !!producerRef.current
    //     );
    //     if (transport && !transport.closed && !producerRef.current) {
    //         console.log('useEffect [producer transport check]: Conditions met, calling connectSendTransport.'); // <<<< AND THIS
    //         connectSendTransport(transport);
    //     } else {
    //         console.log('useEffect [producer transport check]: Conditions NOT met.');
    //     }
    // }, [producerTransportRef.current, connectSendTransport]);

    // Cleanup on unmount
    useEffect(() => {
        return () => endStream({});
    }, [endStream]);

    return {
        getLocalStream,
        connect,
        endStream,
        localStreamRef,
    };
};
