import { AppData, Device, RtpCapabilities, Transport } from 'mediasoup-client/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { setConnectionError, setConsumer, setConsumerTransport, setIsConnecting, setMediaStream } from '../features/mediaStreamSlice';
import { MediaStreamBroadcaster } from '../services/mediaStreamBroadcaster';
import { useAppDispatch, useAppSelector } from './reduxHooks';

/**
 * Hook to use and manage media streaming for participants (consumers).
 */
export function useMediasoupConsumer() {
    const dispatch = useAppDispatch();
    const { mediaStream, consumer, consumerTransport, isConnecting } = useAppSelector((state) => state.mediaStreamSlice);

    const [device, setDevice] = useState<Device | null>(null);

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
            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => track.stop());
                // dispatch(setMediaStream(null));
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
        async (transport: Transport<AppData>, deviceToUse: Device) => {
            // Prevent multiple connection attempts
            if (isConnecting || consumer) {
                console.log('connectReceiveTransport: Already connecting or connected, skipping.');
                return;
            }

            console.log('connectReceiveTransport: Attempting to consume...');
            dispatch(setIsConnecting(true));

            try {
                await mediaStreamManager.consumeWithRedux(dispatch, transport, deviceToUse);

                dispatch(setIsConnecting(false));
                console.log('connectReceiveTransport: Consumption initiated successfully.');
            } catch (err) {
                console.error('Error connecting receive transport or consuming:', err);
                dispatch(setIsConnecting(false));
                dispatch(setConnectionError(err instanceof Error ? err.message : 'Connection failed'));
                Alert.alert('Connection Error', 'Failed to connect to stream');
                if (transport && !transport.closed) {
                    transport.close();
                    dispatch(setConsumerTransport(null));
                }
            }
        },
        [dispatch, mediaStreamManager, isConnecting, consumer]
    );

    /**
     * Create a WebRTC transport for receiving media.
     * This is called after the device is created.
     */
    const createReceiveTransport = useCallback(
        (deviceToUse: Device) => {
            // Prevent creating transport if one already exists and isn't closed
            if (consumerTransport && !consumerTransport.closed) {
                console.log('createReceiveTransport: Transport already exists.');
                if (!consumer) {
                    connectReceiveTransport(consumerTransport, deviceToUse);
                }
                return;
            }

            console.log('createReceiveTransport: Creating consumer transport...');
            try {
                if (!deviceToUse) {
                    throw new Error('No device available for creating transport');
                }

                mediaStreamManager.createConsumerTransport((transport) => {
                    console.log('Consumer transport created, dispatching to Redux.');
                    dispatch(setConsumerTransport(transport));
                }, deviceToUse);
            } catch (err) {
                console.error('Error creating receive transport:', err);
                dispatch(setIsConnecting(false));
                dispatch(setConnectionError(err instanceof Error ? err.message : 'Transport creation failed'));
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
                createReceiveTransport(newDevice);
            } catch (err) {
                console.error('Error creating device:', err);
                dispatch(setIsConnecting(false));
                dispatch(setConnectionError(err instanceof Error ? err.message : 'Device creation failed'));
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
        if (isConnecting || consumer) {
            console.log('startConsuming: Already connecting or connected.');
            return;
        }

        console.log('startConsuming: Initiating connection process...');
        dispatch(setIsConnecting(true));

        try {
            if (!device) {
                console.log('startConsuming: No device found, creating room...');
                mediaStreamManager.createRoom(createDevice);
            } else {
                console.log('startConsuming: Device found, creating transport...');
                createReceiveTransport(device);
            }
        } catch (err) {
            console.error('Error starting consumption:', err);
            dispatch(setIsConnecting(false));
            dispatch(setConnectionError(err instanceof Error ? err.message : 'Unknown error'));
            Alert.alert('Connection Error', 'Failed to connect to stream');
        }
    }, [device, dispatch, mediaStreamManager, createDevice, createReceiveTransport, isConnecting, consumer]);

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
    }, [consumerTransport, device, consumer, connectReceiveTransport]);

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
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            dispatch(setMediaStream(null));
        }
        // reset device and connection state
        setDevice(null);
        dispatch(setIsConnecting(false));
        dispatch(setConnectionError(null));
    }, [consumer, consumerTransport, mediaStream, dispatch]);

    return {
        // mediaStreamManager,
        startConsuming,
        disconnect,
        isConnected: !!consumer && !!mediaStream,
        isConnecting,
    };
}
