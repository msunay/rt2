import { AppData, Device, RtpCapabilities, Transport } from 'mediasoup-client/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { MediaStream } from 'react-native-webrtc';
import {
    setConsumer,
    setConsumerConnectionError,
    setConsumerIsConnecting,
    setConsumerStreamActive,
    setConsumerTransport,
} from '../features/mediaStreamSlice';
import { MediaStreamBroadcaster } from '../services/mediaStreamBroadcaster';
import { useAppDispatch, useAppSelector } from './reduxHooks';

/**
 * Hook to use and manage media streaming for participants (consumers).
 */
export function useMediasoupConsumer() {
    const dispatch = useAppDispatch();
    const { consumer, consumerTransport, consumerIsConnecting, consumerIsReceivingStream } = useAppSelector(
        (state) => state.mediaStreamSlice
    );

    const [device, setDevice] = useState<Device | null>(null);

    const [receivedMediaStream, setReceivedMediaStream] = useState<MediaStream | null>(null);

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
        if (consumerTransport && !consumerTransport.closed && consumer && !consumer.closed) {
            mediaStreamManager.setupProducerClosedListener(consumerTransport, consumer);
        }

        return () => {
            mediaStreamManager.removeProducerClosedListener();
        };
    }, [consumerTransport, consumer, mediaStreamManager]);

    // Cleanup mediasoup Resources on Unmount ---
    useEffect(() => {
        return () => {
            console.log('useMediaStream unmounting: Cleaning up resources...');
            if (consumer && !consumer.closed) {
                consumer.close();
                // dispatching here might cause warnings if component is already unmounted
                // see if these dispatches are strictly necessary on unmount.
                // dispatch(setConsumer(null));
            }
            if (consumerTransport && !consumerTransport.closed) {
                consumerTransport.close();
                // dispatch(setConsumerTransport(null));
            }
            if (receivedMediaStream) {
                receivedMediaStream.getTracks().forEach((track) => track.stop());
            }
            setDevice(null);
        };
    }, [consumer, consumerTransport, receivedMediaStream]);

    // --- Connection Logic ---

    /**
     * Connect the receive transport and start consuming media.
     * This is now primarily called by the useEffect hook below.
     */
    const connectReceiveTransport = useCallback(
        async (transport: Transport<AppData>, device: Device) => {
            // Prevent multiple connection attempts
            if (consumerIsConnecting || consumer) {
                console.log('connectReceiveTransport: Already connecting or connected, skipping.');
                return;
            }

            console.log('connectReceiveTransport: Attempting to consume...');
            dispatch(setConsumerIsConnecting(true));

            try {
                mediaStreamManager.consumeAndManageStream(
                    transport,
                    device,
                    (consumer) => dispatch(setConsumer(consumer)),
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
                    dispatch(setConsumerTransport(null));
                }
                // dispatch(setConsumerStreamActive(false));
            }
        },
        [dispatch, mediaStreamManager, consumerIsConnecting, consumer]
    );

    /**
     * Create a WebRTC transport for receiving media.
     * This is called after the device is created.
     */
    const createReceiveTransport = useCallback(
        (device: Device) => {
            // Prevent creating transport if one already exists and isn't closed
            if (consumerTransport && !consumerTransport.closed) {
                console.log('createReceiveTransport: Transport already exists.');
                if (!consumer && device && device.loaded) {
                    connectReceiveTransport(consumerTransport, device);
                }
                return;
            }

            console.log('createReceiveTransport: Creating consumer transport...');
            try {
                if (!device || !device.loaded) {
                    throw new Error('No device available or not loaded for creating transport');
                }

                mediaStreamManager.createConsumerTransport((transport) => {
                    console.log('Consumer transport created, dispatching to Redux.');
                    dispatch(setConsumerTransport(transport));
                }, device);
            } catch (err) {
                console.error('Error creating receive transport:', err);
                // dispatch(setConsumerIsConnecting(false));
                dispatch(setConsumerConnectionError(err instanceof Error ? err.message : 'Transport creation failed'));
                Alert.alert('Connection Error', 'Failed to establish streaming connection');
            }
        },
        [dispatch, mediaStreamManager, consumerTransport, consumer, connectReceiveTransport]
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

                // Automatically try to create the transport once the device is ready
                // createReceiveTransport(newDevice);
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
        [dispatch, createReceiveTransport]
    );

    /**
     * Start the overall consumption process.
     */
    const startConsuming = useCallback(() => {
        if (consumerIsConnecting || consumer || consumerIsReceivingStream) {
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
        consumer,
        consumerIsReceivingStream,
    ]);

    // Effect to create transport when device is ready
    useEffect(() => {
        if (
            device &&
            device.loaded &&
            !consumerTransport && // Only if no transport yet
            !consumer // And no consumer yet
        ) {
            console.log('useEffect: Device ready, creating receive transport...');
            createReceiveTransport(device);
        }
    }, [device, consumerTransport, consumer, createReceiveTransport]);

    // --- Effect to Connect Transport when Ready ---
    useEffect(() => {
        // Pre-Conditions:
        // 1. We have a transport object from Redux.
        // 2. The transport is not closed.
        // 3. We have a device object in local state.
        // 4. We don't already have an active consumer from Redux.
        if (consumerTransport && !consumerTransport.closed && device && !consumer) {
            console.log('useEffect: Consumer transport ready, attempting to connect/consume...');
            connectReceiveTransport(consumerTransport, device);
        }
        // Intentionally check only these dependencies. connectReceiveTransport is stable via useCallback.
    }, [consumerTransport, device, consumer, connectReceiveTransport, consumerIsReceivingStream]);

    /**
     * Disconnect function.
     * Note: Unmount cleanup handles resource release automatically.
     */
    const disconnect = useCallback(() => {
        console.log('disconnect: Manually closing resources...');
        if (consumer && !consumer.closed) {
            consumer.close();
            dispatch(setConsumer(null));
        }
        if (consumerTransport && !consumerTransport.closed) {
            consumerTransport.close();
            dispatch(setConsumerTransport(null));
        }
        if (receivedMediaStream) {
            receivedMediaStream.getTracks().forEach((track) => track.stop());
            setReceivedMediaStream(null); // Clear local stream state
        }
        // reset device and connection state
        dispatch(setConsumerStreamActive({ isActive: false }));
        setDevice(null);
        dispatch(setConsumerIsConnecting(false));
        dispatch(setConsumerConnectionError(null));
    }, [consumer, consumerTransport, receivedMediaStream, dispatch]);

    return {
        // mediaStreamManager,
        startConsuming,
        disconnect,
        receivedMediaStream,
        isConnected: consumerIsReceivingStream,
        isConnecting: consumerIsConnecting,
    };
}
