import { useGetOneParticipationByPartIdQuery, useGetOneQuizQuestionAnswerQuery } from '@/src/api/backendApi';
import FinalScore from '@/src/components/finalScore';
import PlayerQuestion from '@/src/components/playerQuestion';
import Winners from '@/src/components/winners';
import { useQuizSocket } from '@/src/hooks/broadcastHooks';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useAppSelector } from '../hooks/reduxHooks';
import { useMediasoupConsumer } from '../hooks/useMediasoupConsumer';

/**
 * Loading screen component
 */
const LoadingScreen = () => {
    return (
        <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
    );
};

/**
 * Error screen component
 */
const ErrorScreen = ({ message }: { message: string }) => {
    return (
        <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{message}</Text>
        </View>
    );
};

/**
 * Waiting screen when quiz hasn't started yet
 */
const WaitingScreen = () => {
    return (
        <View style={styles.centerContainer}>
            <Text style={styles.waitingText}>Waiting for the host to start the quiz...</Text>
            <Text style={styles.subtleText}>Get ready to answer questions!</Text>
        </View>
    );
};

/**
 * Stream Control Button
 */
const StreamControlButton = ({ onPress }: { onPress: () => void }) => {
    const { consumerIsConnecting, consumerIsReceivingStream } = useAppSelector((state) => state.mediaStreamSlice);

    const buttonStyle = useCallback(
        ({ pressed }: { pressed: boolean }) => {
            return {
                ...styles.streamButton,
                backgroundColor: pressed ? '#ffb296' : '#FF7F50',
                opacity: consumerIsConnecting ? 0.7 : 1,
            };
        },
        [consumerIsConnecting]
    );

    return (
        <Pressable
            style={buttonStyle}
            onPress={onPress}
            disabled={consumerIsConnecting || consumerIsReceivingStream}
            accessibilityLabel="Join stream"
        >
            <Text style={styles.buttonText}>
                {consumerIsConnecting ? 'Connecting...' : consumerIsReceivingStream ? 'Connected' : 'Join Stream'}
            </Text>
        </Pressable>
    );
};

/**
 * Component for quiz participants
 */
export default function ParticipantStream({ partId }: { partId: string }) {
    const { consumerConnectionError } = useAppSelector((state) => state.mediaStreamSlice);

    const { quizStarted, currentQuestionNumber, questionHidden } = useAppSelector((state) => state.quizSlice);

    const {
        data: participation,
        error: participationError,
        isLoading: participationLoading,
    } = useGetOneParticipationByPartIdQuery(partId);

    // Initialize hooks for socket connection and media consumption
    useQuizSocket(participation?.QuizId);
    const { startConsuming, receivedMediaStream /*, disconnect, isConnected: consumerIsConnected */ } = useMediasoupConsumer();

    // Fetch quiz details based on participation data
    const {
        data: quiz,
        error: quizError,
        isLoading: quizLoading,
    } = useGetOneQuizQuestionAnswerQuery(participation?.QuizId || '');

    // Determine loading and error states
    const isLoading = participationLoading || quizLoading;
    const error = participationError || quizError || consumerConnectionError;

    // Log errors to console
    useEffect(() => {
        if (participationError) {
            console.error('Error fetching participation:', participationError);
        }
        if (quizError) {
            console.error('Error fetching quiz:', quizError);
        }
    }, [participationError, quizError]);

    // Render loading state
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Render error state
    if (error) {
        const errorMessage =
            typeof error === 'string' ? error : error instanceof Error ? error.message : 'An error occurred';

        return <ErrorScreen message={errorMessage} />;
    }

    // Render content based on quiz state
    let content;
    if (!quizStarted) {
        content = <WaitingScreen />;
    } else if (currentQuestionNumber < 11) {
        // Show current question
        content =
            participation && quiz ? (
                <PlayerQuestion
                    participation={participation}
                    currentQuestionNumber={currentQuestionNumber}
                    hidden={questionHidden}
                    quiz={quiz}
                    quizError={null}
                    quizIsLoading={false}
                />
            ) : (
                <ErrorScreen message="Quiz data is unavailable" />
            );
    } else if (currentQuestionNumber === 11) {
        // Show final score
        content = participation ? (
            <FinalScore userParticipation={participation} />
        ) : (
            <ErrorScreen message="Participation data is unavailable" />
        );
    } else {
        // Show winners
        content = participation?.QuizId ? (
            <Winners quizId={participation.QuizId} />
        ) : (
            <ErrorScreen message="Quiz ID is unavailable" />
        );
    }

    return (
        <View style={styles.container}>
            {/* Remote video stream from the host */}
            {receivedMediaStream && <RTCView streamURL={receivedMediaStream.toURL()} objectFit="cover" style={styles.videoStream} />}

            <View style={styles.contentContainer}>
                <View style={styles.questionContainer}>{content}</View>

                <View style={styles.buttonContainer}>
                    <StreamControlButton onPress={startConsuming} />
                </View>

                {__DEV__ && <Text style={styles.debugText}>Question: {currentQuestionNumber}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    questionContainer: {
        flex: 1,
        marginBottom: 16,
    },
    videoStream: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    streamButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 200,
        borderRadius: 10,
        zIndex: 10,
    },
    buttonText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#fff',
    },
    loadingText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 18,
        textAlign: 'center',
    },
    errorText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    waitingText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtleText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    debugText: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        fontSize: 12,
        color: 'gray',
    },
});
