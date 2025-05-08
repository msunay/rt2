import { HostQuestion } from '@/src/components/hostQuestion';
import { incrementQuestionNumber } from '@/src/features/questionSlice';
import { incrementTrigger, setQuestionHidden, setQuizStarted } from '@/src/features/quizSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks/reduxHooks';
import { MediaStreamBroadcaster } from '@/src/services/mediaStreamBroadcaster';
import { QuizBroadcasterManager } from '@/src/services/quizBroadcasterManager';
import { useCallback, useEffect, useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useMediasoupProducer } from '../hooks/useMediasoupProducer';

// Question timer duration
export const QUESTION_TIME = process.env.NODE_ENV === 'test' ? 0 : 7000;

/**
 * Host video streaming component
 */
export default function HostStream({ quizId }: { quizId: string }) {
    // Redux state and dispatch
    const dispatch = useAppDispatch();
    const currentQuestionNumber = useAppSelector((state) => state.questionSlice.value);
    const { quizStarted, questionHidden, trigger } = useAppSelector((state) => state.quizSlice);
    const { producerHasLocalMedia, producerIsConnecting, producerIsStreaming, producerConnectionError } = useAppSelector(
        (state) => state.mediaStreamSlice
    );

    // Socket managers - use Redux dispatch
    const quizSocketManager = useMemo(() => QuizBroadcasterManager.withReduxDispatch(dispatch), [dispatch]);

    const streamSocketManager = useMemo(() => new MediaStreamBroadcaster(), []);

    // Initialize mediasoup functionality
    const { getLocalStream, connect, endStream, localStreamRef } = useMediasoupProducer(streamSocketManager);

    // Set up socket listeners
    useEffect(() => {
        // Set up all quiz host listeners
        quizSocketManager.setupAllListeners(quizId);

        // Set up streaming socket listeners
        streamSocketManager.setupConnectionListener();

        // Get media permissions as soon as component mounts
        // getLocalStream().catch((err) => {
        //     console.error('Error getting local stream on mount:', err);
        // });

        // Cleanup function
        return () => {
            // Clean up socket listeners
            quizSocketManager.removeAllListeners();
            quizSocketManager.disconnect();

            streamSocketManager.removeConnectionListener();
            streamSocketManager.disconnect();

            // Ensure media streams are stopped - cleanup handled in useMediasoup hook
        };
    }, [quizId, quizSocketManager, streamSocketManager]);

    useEffect(() => {
        console.log('quizStarted:', quizStarted);
    }, [quizStarted]);

    // Display connection error if any
    useEffect(() => {
        if (producerConnectionError) {
            Alert.alert('Streaming Error', producerConnectionError);
            // clear the error after showing it
            // dispatch(setConnectionError(null));
        }
    }, [producerConnectionError, dispatch]);

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
        <View style={styles.outerContainer}>
            <RTCView
                streamURL={localStreamRef.current?.toURL()}
                mirror={true}
                objectFit="cover"
                style={styles.rtcViewBackground}
            />

            <View style={styles.container}>
                <View style={styles.videoContainer}>
                    <View style={styles.questionComponentContainer}>
                        {quizStarted && <HostQuestion quizId={quizId} trigger={trigger} hidden={questionHidden} />}
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
                        <Pressable style={pressableStyle} onPress={getLocalStream} disabled={producerHasLocalMedia}>
                            <Text style={styles.buttonText}>{producerHasLocalMedia ? 'Video Started' : 'Start Video'}</Text>
                        </Pressable>
                        <Pressable
                            style={pressableStyle}
                            onPress={connect}
                            disabled={!producerHasLocalMedia || producerIsConnecting || producerIsStreaming}
                        >
                            <Text style={styles.buttonText}>
                                {producerIsConnecting ? 'Connecting...' : producerIsStreaming ? 'Streaming' : 'Stream'}
                            </Text>
                        </Pressable>
                        <Pressable
                            style={pressableStyle}
                            onPress={() => endStream({})}
                            disabled={!producerHasLocalMedia && !producerIsStreaming}
                        >
                            <Text style={styles.buttonText}>End Stream</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        // backgroundColor: 'red',
    },
    rtcViewBackground: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        // zIndex: 1, // Optionally, ensure this is on top. Usually not needed if rendered after RTCView.
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
        // zIndex: 10,
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
