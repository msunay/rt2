import { incrementQuestionNumber } from '@/src/features/questionSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks/reduxHooks';
import {
    setQuizStarted,
    setQuestionHidden,
    incrementTrigger
} from '@/src/features/quizSlice';
import {
    setMediaStream,
    setIsConnecting,
    setConnectionError
} from '@/src/features/mediaStreamSlice';
import { QuizBroadcasterManager } from '@/src/services/quizBroadcasterManager';
import { MediaStreamBroadcaster } from '@/src/services/mediaStreamBroadcaster';
import { router } from 'expo-router';
import * as mediasoupClient from 'mediasoup-client';
import type { types as mediasoupTypes } from 'mediasoup-client';
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { RTCView, mediaDevices, registerGlobals } from 'react-native-webrtc';
import type { MediaStream } from 'react-native-webrtc';
import HostQuestion from '@/src/components/hostQuestion';

// Media stream configuration
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

// Question timer duration
export const QUESTION_TIME = process.env.NODE_ENV === 'test' ? 0 : 7000;

// Default encoding parameters for video streaming
const DEFAULT_ENCODING_PARAMS: mediasoupClient.types.AppData = {
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
 * Custom hook for mediasoup WebRTC functionality
 */
function useMediasoup(streamSocketManager: MediaStreamBroadcaster) {
    const dispatch = useAppDispatch();
    const mediaStream = useAppSelector(state => state.mediaStreamSlice.mediaStream);

    // Device and transport refs to persist across renders
    const deviceRef = useRef<mediasoupTypes.Device>(null);
    const producerTransportRef = useRef<mediasoupTypes.Transport>(null);
    const producerRef = useRef<mediasoupTypes.Producer>(null);
    const paramsRef = useRef<mediasoupClient.types.AppData>(DEFAULT_ENCODING_PARAMS);

    /**
     * Gets local user media stream
     */
    const getLocalStream = useCallback(async () => {
        try {
            if (!mediaStream) {
                const stream = await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
                streamSuccess(stream);
            }
        } catch (err) {
            console.error('Failed to get media stream:', err);
            Alert.alert('Camera Error', 'Unable to access camera and microphone.');
        }
    }, [mediaStream]);

    /**
     * Handles successful stream acquisition
     */
    const streamSuccess = useCallback((stream: MediaStream) => {
        dispatch(setMediaStream(stream));

        const track = stream.getVideoTracks()[0];
        paramsRef.current = {
            track,
            ...paramsRef.current,
        };
    }, [dispatch]);

    /**
     * Start connection process
     */
    const connect = useCallback(() => {
        dispatch(setIsConnecting(true));

        if (!deviceRef.current) {
            getRtpCapabilities();
        } else {
            createSendTransport();
        }
    }, [dispatch]);

    /**
     * Get RTP capabilities from server
     */
    const getRtpCapabilities = useCallback(() => {
        streamSocketManager.createRoom(createDevice);
    }, [streamSocketManager]);

    /**
     * Create mediasoup device with router capabilities
     */
    const createDevice = useCallback(async (rtpCapabilities: mediasoupTypes.RtpCapabilities) => {
        try {
            const device = new mediasoupClient.Device();
            await device.load({
                routerRtpCapabilities: rtpCapabilities,
            });

            console.log('Device RTP Capabilities', device.rtpCapabilities);
            deviceRef.current = device;
            createSendTransport();
        } catch (err) {
            console.error('Failed to create device:', err);
            dispatch(setIsConnecting(false));
            dispatch(setConnectionError(err instanceof Error ? err.message : 'Unknown error'));

            const error = err as Error;
            if (error.name === 'UnsupportedError') {
                Alert.alert('Error', 'Browser not supported for WebRTC.');
            }
        }
    }, [dispatch]);

    /**
     * Create transport for sending media
     */
    const createSendTransport = useCallback(() => {
        if (!deviceRef.current) {
            console.error('Device not initialized');
            dispatch(setIsConnecting(false));
            dispatch(setConnectionError('Device not initialized'));
            return;
        }

        try {
            streamSocketManager.createProducerTransport(
                (transport) => {
                    producerTransportRef.current = transport;
                    return connectSendTransport(transport);
                },
                deviceRef.current,
                connectSendTransport
            );
        } catch (err) {
            console.error('Failed to create send transport:', err);
            dispatch(setIsConnecting(false));
            dispatch(setConnectionError(err instanceof Error ? err.message : 'Transport creation failed'));
        }
    }, [dispatch, streamSocketManager]);

    /**
     * Connect the send transport
     */
    const connectSendTransport = useCallback(async (producerTransport: mediasoupTypes.Transport) => {
        try {
            if (!paramsRef.current.track) {
                console.error('No track available to produce');
                dispatch(setIsConnecting(false));
                dispatch(setConnectionError('No track available'));
                return;
            }

            const producer = await producerTransport.produce(paramsRef.current);
            producerRef.current = producer;

            producer.on('trackended', () => {
                console.log('Track ended');
                if (mediaStream) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    dispatch(setMediaStream(null));
                }
            });

            producer.on('transportclose', () => {
                console.log('Transport ended');
                if (mediaStream) {
                    mediaStream.getTracks().forEach(track => track.stop());
                    dispatch(setMediaStream(null));
                }
            });

            // Connection successful
            dispatch(setIsConnecting(false));
        } catch (err) {
            console.error('Failed to connect send transport:', err);
            dispatch(setIsConnecting(false));
            dispatch(setConnectionError(err instanceof Error ? err.message : 'Connection failed'));
            Alert.alert('Connection Error', 'Failed to establish streaming connection.');
        }
    }, [dispatch, mediaStream]);

    /**
     * End streaming and clean up resources
     */
    const endStream = useCallback(() => {
        if (producerRef.current) {
            producerRef.current.close();
            producerRef.current = null;
        }

        if (producerTransportRef.current) {
            producerTransportRef.current.close();
            producerTransportRef.current = null;
        }

        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            dispatch(setMediaStream(null));
        }

        router.navigate('/');
    }, [dispatch, mediaStream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (producerRef.current) {
                producerRef.current.close();
            }

            if (producerTransportRef.current) {
                producerTransportRef.current.close();
            }

            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                dispatch(setMediaStream(null));
            }
        };
    }, [dispatch, mediaStream]);

    return {
        getLocalStream,
        connect,
        endStream
    };
}

/**
 * Host video streaming component
 */
export default function HostStream({ quizId }: { quizId: string }) {
    // Register WebRTC globals for Mediasoup
    registerGlobals();

    // Redux state and dispatch
    const dispatch = useAppDispatch();
    const currentQuestionNumber = useAppSelector(state => state.questionSlice.value);
    const { quizStarted, questionHidden, trigger } = useAppSelector(state => state.quizSlice);
    const { mediaStream, isConnecting } = useAppSelector(state => state.mediaStreamSlice);

    // Socket managers - use Redux dispatch
    const quizSocketManager = useMemo(() =>
        QuizBroadcasterManager.withReduxDispatch(dispatch),
        [dispatch]);

    const streamSocketManager = useMemo(() =>
        new MediaStreamBroadcaster(),
        []);

    // Initialize mediasoup functionality
    const { getLocalStream, connect, endStream } = useMediasoup(streamSocketManager);

    // Set up socket listeners
    useEffect(() => {
        // Set up all quiz host listeners
        quizSocketManager.setupAllListeners(quizId);

        // Set up streaming socket listeners
        streamSocketManager.setupConnectionListener();

        // Get media permissions as soon as component mounts
        getLocalStream().catch(err => {
            console.error('Error getting local stream on mount:', err);
        });

        // Cleanup function
        return () => {
            // Clean up socket listeners
            quizSocketManager.removeAllListeners();
            quizSocketManager.disconnect();

            streamSocketManager.removeConnectionListener();
            streamSocketManager.disconnect();

            // Ensure media streams are stopped - cleanup handled in useMediasoup hook
        };
    }, [quizId, quizSocketManager, streamSocketManager, getLocalStream]);

    /**
     * Start the quiz
     */
    const startQuiz = useCallback(() => {
        dispatch(setQuizStarted(true));
        quizSocketManager.startQuiz(quizId);
        dispatch(incrementQuestionNumber());
    }, [dispatch, quizId, quizSocketManager]);

    /**
     * Proceed to next question
     */
    const nextQuestion = useCallback(() => {
        dispatch(incrementQuestionNumber());
        dispatch(incrementTrigger());
        quizSocketManager.nextQuestion(quizId);
        dispatch(setQuestionHidden(false));

        // Optional: Add timer for auto-progression if needed
        // if (currentQuestionNumber < 9) {
        //   setTimeout(() => {
        //     // Auto-progress logic
        //   }, QUESTION_TIME + 2000);
        // }
    }, [dispatch, quizId, quizSocketManager]);

    /**
     * Show winners screen
     */
    const handleWinners = useCallback(() => {
        console.log('Showing winners');
        quizSocketManager.showWinners(quizId);
    }, [quizId, quizSocketManager]);

    /**
     * Button style with pressed state
     */
    const pressableStyle = useCallback(({ pressed }: { pressed: boolean }) => {
        return pressed
            ? {
                ...styles.actionButton,
                backgroundColor: '#ffb296',
            }
            : {
                ...styles.actionButton,
                backgroundColor: '#FF7F50',
            };
    }, []);

    return (
        <RTCView
            streamURL={mediaStream?.toURL()}
            mirror={true}
            objectFit='cover'
            style={styles.rtcView}
        >
            <View style={styles.container}>
                <View style={styles.videoContainer}>
                    <View style={styles.questionComponentContainer}>
                        {quizStarted && (
                            <HostQuestion
                                quizId={quizId}
                                trigger={trigger}
                                hidden={questionHidden}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <View style={styles.quizControls}>
                        {quizStarted ? (
                            currentQuestionNumber === 10 ? (
                                <Pressable
                                    style={pressableStyle}
                                    onPress={() => {
                                        handleWinners();
                                        dispatch(incrementQuestionNumber());
                                    }}
                                >
                                    <Text style={styles.buttonText}>Reveal Winners</Text>
                                </Pressable>
                            ) : (
                                <Pressable onPress={nextQuestion} style={pressableStyle}>
                                    <Text style={styles.buttonText}>Next Question</Text>
                                </Pressable>
                            )
                        ) : (
                            <Pressable style={pressableStyle} onPress={startQuiz}>
                                <Text style={styles.buttonText}>Start Quiz</Text>
                            </Pressable>
                        )}
                    </View>

                    <View style={styles.streamControls}>
                        <Pressable
                            style={pressableStyle}
                            onPress={getLocalStream}
                            disabled={!!mediaStream}
                        >
                            <Text style={styles.buttonText}>Start Video</Text>
                        </Pressable>
                        <Pressable
                            style={pressableStyle}
                            onPress={connect}
                            disabled={!mediaStream || isConnecting}
                        >
                            <Text style={styles.buttonText}>
                                {isConnecting ? 'Connecting...' : 'Stream'}
                            </Text>
                        </Pressable>
                        <Pressable
                            style={pressableStyle}
                            onPress={endStream}
                            disabled={!mediaStream}
                        >
                            <Text style={styles.buttonText}>End Stream</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </RTCView>
    );
}

const styles = StyleSheet.create({
    rtcView: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    videoContainer: {
        flex: 1,
    },
    questionComponentContainer: {
        height: 170,
    },
    buttonContainer: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    quizControls: {
        alignItems: 'center',
        marginBottom: 10,
    },
    streamControls: {
        alignItems: 'center',
    },
    actionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 200,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
    },
});