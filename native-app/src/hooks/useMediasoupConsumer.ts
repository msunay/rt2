import { Consumer, Device, RtpCapabilities, Transport } from 'mediasoup-client/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { MediaStream } from 'react-native-webrtc';
import {
    setConsumerConnectionError,
    setConsumerID,
    setConsumerIsConnecting,
    setConsumerStreamActive,
} from '../features/mediaStreamSlice';
import { MediaStreamBroadcaster } from '../services/mediaStreamBroadcaster';
import { useAppDispatch, useAppSelector } from './reduxHooks';

/**
 * Hook to use and manage media streaming for participants (consumers).
 */
export function useMediasoupConsumer() {
    const dispatch = useAppDispatch();
    const { consumerID, consumerIsConnecting, consumerIsReceivingStream } = useAppSelector(
        (state) => state.mediaStreamSlice
    );

    const [device, setDevice] = useState<Device | null>(null);

    const [receivedMediaStream, setReceivedMediaStream] = useState<MediaStream | null>(null);
    const consumerTransportRef = useRef<Transport | null>(null);
    const consumerRef = useRef<Consumer | null>(null);

    const mediaStreamManager = useMemo(() => new MediaStreamBroadcaster(), []);

    // Setup/Teardown of Listeners & Manager ---
    useEffect(() => {
        mediaStreamManager.setupConnectionListener();

        return () => {
            mediaStreamManager.removeConnectionListener();
            mediaStreamManager.disconnect();
        };
    }, [mediaStreamManager]);

    // Setup/Teardown Producer Closed Listener ---
    useEffect(() => {
        if (
            consumerTransportRef.current &&
            !consumerTransportRef.current.closed &&
            consumerRef.current &&
            !consumerRef.current.closed
        ) {
            mediaStreamManager.setupProducerClosedListener(consumerTransportRef.current, consumerRef.current);
        }

        return () => {
            mediaStreamManager.removeProducerClosedListener();
        };
    }, [mediaStreamManager]);

    // Cleanup mediasoup Resources on Unmount ---
    useEffect(() => {
        return () => {
            console.log('useMediaStream unmounting: Cleaning up resources...');
            if (consumerRef.current && !consumerRef.current.closed) {
                consumerRef.current.close();
            }
            if (consumerTransportRef.current && !consumerTransportRef.current.closed) {
                consumerTransportRef.current.close();
                consumerTransportRef.current = null;
            }
            if (receivedMediaStream) {
                receivedMediaStream.getTracks().forEach((track) => track.stop());
            }
            setDevice(null);
        };
    }, []);

    // --- Connection Logic ---

    /**
     * Connect the receive transport and start consuming media.
     * This is now primarily called by the useEffect hook below.
     */
    const connectReceiveTransport = useCallback(
        async (device: Device) => {
            const transport = consumerTransportRef.current;

            // Check ref existence and state
            if (!transport || transport.closed) {
                console.error('connectReceiveTransport: Transport ref is null or closed.');
                dispatch(setConsumerIsConnecting(false)); // Ensure loading stops
                dispatch(setConsumerConnectionError('Transport not available.'));
                return;
            }

            // Prevent multiple connection attempts
            if (consumerRef.current && !consumerRef.current.closed) {
                console.log('connectReceiveTransport: Consumer ref already exists, skipping.');
                return;
            }

            console.log('connectReceiveTransport: Attempting to consume...');

            try {
                mediaStreamManager.consume(
                    transport,
                    device,
                    (newConsumer) => {
                        console.log('connectReceiveTransport: Mediasoup Consumer object created:', newConsumer.id);
                        consumerRef.current = newConsumer;

                        dispatch(setConsumerID(newConsumer.id));
                    },
                    (stream) => {
                        setReceivedMediaStream(stream);
                        dispatch(setConsumerStreamActive({ isActive: true }));
                    }
                );

                // dispatch(setConsumerIsConnecting(false));
                console.log('connectReceiveTransport: Consumption initiated successfully.');
            } catch (err) {
                console.error('Error connecting receive transport or consuming:', err);
                dispatch(setConsumerIsConnecting(false));
                dispatch(setConsumerConnectionError(err instanceof Error ? err.message : 'Connection failed'));
                Alert.alert('Connection Error', 'Failed to connect to stream');
                if (transport && !transport.closed) {
                    transport.close();
                    consumerTransportRef.current = null;
                }
                if (consumerRef.current) {
                    consumerRef.current.close(); // Ensure it's closed if partially created
                    consumerRef.current = null;
                }
                dispatch(setConsumerID(null));
            }
        },
        [dispatch, mediaStreamManager]
    );

    /**
     * Create a WebRTC transport for receiving media.
     * This is called after the device is created.
     */
    const createReceiveTransport = useCallback(
        (device: Device) => {
            // Prevent creating transport if one already exists and isn't closed
            if (consumerTransportRef.current && !consumerTransportRef.current.closed) {
                console.log('createReceiveTransport: Transport ref already exists and is open');
                if (!consumerRef.current && device && device.loaded && !consumerIsReceivingStream) {
                    console.log('createReceiveTransport: Existing transport ref, calling connectReceiveTransport.');
                    connectReceiveTransport(device);
                } else {
                    console.log('createReceiveTransport: Existing transport ref, but conditions not met for connect.', {
                        hasConsumer: !!consumerRef.current,
                        isConnecting: consumerIsConnecting,
                        isReceiving: consumerIsReceivingStream,
                    });
                }
                return;
            }

            console.log('createReceiveTransport: Creating consumer transport...');
            try {
                if (!device || !device.loaded) {
                    throw new Error('No device available or not loaded for creating transport');
                }

                mediaStreamManager.createConsumerTransport((transport) => {
                    console.log('Consumer transport created, storing in ref');
                    consumerTransportRef.current = transport;

                    // Check conditions again *inside* the callback, as state might have changed
                    if (device && device.loaded && !consumerRef.current) {
                        console.log(
                            'createReceiveTransport (callback): Transport ref set, conditions met, calling connectReceiveTransport.'
                        );
                        connectReceiveTransport(device);
                    } else {
                        console.log('createReceiveTransport (callback): Conditions not met for immediate connect.', {
                            deviceLoaded: device?.loaded,
                            hasConsumer: !!consumerRef.current,
                            _currentConsumerIsConnectingState: consumerIsConnecting, // Check current Redux state
                            _currentConsumerIsReceivingStreamState: consumerIsReceivingStream, // Check current Redux state
                        });
                    }
                }, device);
            } catch (err) {
                console.error('Error creating receive transport:', err);
                dispatch(setConsumerConnectionError(err instanceof Error ? err.message : 'Transport creation failed'));
                Alert.alert('Connection Error', 'Failed to establish streaming connection');
                dispatch(setConsumerIsConnecting(false));
            }
        },
        [dispatch, mediaStreamManager, connectReceiveTransport, consumerIsConnecting, consumerIsReceivingStream]
    );

    /**
     * Create a MediaSoup device with received RTP capabilities.
     * This is the callback for mediaStreamManager.createRoom.
     */
    const createDevice = useCallback(
        async (rtpCapabilities: RtpCapabilities) => {
            console.log('createDevice: Received RTP capabilities.');
            try {
                const newDevice = new Device();
                await newDevice.load({ routerRtpCapabilities: rtpCapabilities });

                console.log('Device created successfully:', newDevice.rtpCapabilities);
                setDevice(newDevice);
            } catch (err) {
                console.error('Error creating device:', err);
                dispatch(setConsumerIsConnecting(false));
                dispatch(setConsumerConnectionError(err instanceof Error ? err.message : 'Device creation failed'));
                const error = err as Error;
                if (error.name === 'UnsupportedError') {
                    Alert.alert('Error', "Your device doesn't support WebRTC");
                } else {
                    Alert.alert('Connection Error', 'Failed to set up stream connection');
                }
            }
        },
        [dispatch]
    );

    /**
     * Start the overall consumption process.
     */
    const startConsuming = useCallback(() => {
        if (consumerIsConnecting || (consumerRef.current && !consumerRef.current.closed) || consumerIsReceivingStream) {
            console.log('startConsuming: Already connecting or connected.');
            return;
        }

        console.log('startConsuming: Initiating connection process...');
        dispatch(setConsumerIsConnecting(true));

        try {
            if (!device || !device.loaded) {
                console.log('startConsuming: No device found or not loaded, creating room...');
                mediaStreamManager.createRoom(createDevice);
            } else {
                console.log('startConsuming: Device found, creating transport...');
                createReceiveTransport(device);
            }
        } catch (err) {
            console.error('Error starting consumption:', err);
            dispatch(setConsumerIsConnecting(false));
            dispatch(setConsumerConnectionError(err instanceof Error ? err.message : 'Unknown error'));
            Alert.alert('Connection Error', 'Failed to connect to stream');
        }
    }, [
        device,
        dispatch,
        mediaStreamManager,
        createDevice,
        createReceiveTransport,
        consumerIsConnecting,
        consumerIsReceivingStream,
    ]);

    // Effect to create transport when device is ready
    useEffect(() => {
        if (device && device.loaded && !consumerTransportRef.current && !(consumerRef.current && !consumerRef.current.closed) && !consumerIsReceivingStream) {
            console.log('useEffect [device ready]: Device ready, calling createReceiveTransport.');
            createReceiveTransport(device);
        } else {
            console.log('useEffect [device ready]: Conditions NOT met.', {
                device: !!device,
                deviceLoaded: device?.loaded,
                transportRefExists: !!consumerTransportRef.current,
                hasConsumer: !!consumerRef.current,
                _consumerIsConnectingState: consumerIsConnecting,
                _consumerIsReceivingStreamState: consumerIsReceivingStream,
            });
        }
    }, [device, createReceiveTransport, consumerIsConnecting, consumerIsReceivingStream]);

    // --- Effect to Connect Transport when Ready ---
    useEffect(() => {
        // Fallback to check if we need to connect the transport
        // This is a general check to ensure we connect the transport when all conditions are met.

        // Pre-Conditions:
        // 1. We have a transport object from Redux.
        // 2. The transport is not closed.
        // 3. We have a device object in local state.
        // 4. We don't already have an active consumer from Redux.
        const transport = consumerTransportRef.current;

        console.log(
            'useEffect [connect trigger check]: transport?',
            !!transport,
            'transport closed?',
            transport?.closed,
            'device?',
            !!device,
            'device loaded?',
            device?.loaded,
            'consumer?',
            !!(consumerRef.current && !consumerRef.current.closed),
            'receivingStream?',
            consumerIsReceivingStream,
            'isConnecting?',
            consumerIsConnecting
        );

        if (
            transport &&
            !transport.closed &&
            device &&
            device.loaded &&
            !(consumerRef.current && !consumerRef.current.closed) &&
            !consumerIsReceivingStream && // Not already marked as receiving
            !consumerIsConnecting
        ) {
            console.log('useEffect [general check]: Conditions met, calling connectReceiveTransport.');
            connectReceiveTransport(device);
        } else {
            console.log('useEffect [general check]: Conditions NOT met.');
        }
    }, [device, consumerIsReceivingStream, consumerIsConnecting, connectReceiveTransport]);

    /**
     * Disconnect function.
     * Note: Unmount cleanup handles resource release automatically.
     */
    const disconnect = useCallback(() => {
        console.log('disconnect: Manually closing resources...');
        if (consumerRef.current && !consumerRef.current.closed) {
            consumerRef.current.close();
            dispatch(setConsumerID(null));
        }
        if (consumerTransportRef.current && !consumerTransportRef.current.closed) {
            consumerTransportRef.current.close();
            consumerTransportRef.current = null;
        }
        if (receivedMediaStream) {
            receivedMediaStream.getTracks().forEach((track) => track.stop());
            setReceivedMediaStream(null);
        }
        // reset device and connection state
        dispatch(setConsumerStreamActive({ isActive: false }));
        setDevice(null);
        dispatch(setConsumerIsConnecting(false));
        dispatch(setConsumerConnectionError(null));
    }, [receivedMediaStream, dispatch]);

    return {
        // mediaStreamManager,
        startConsuming,
        disconnect,
        receivedMediaStream,
        isConnected: consumerIsReceivingStream,
        isConnecting: consumerIsConnecting,
    };
}
