import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useGetCoturnCredentialsQuery } from '../api/backendApi';
import { useProducerStreaming } from '../lib/streaming-package/hooks/useProducerStreaming';
import { Logger, LogLevel } from '../utils/logger';
import { HostQuestion } from './hostQuestion';

interface HostStreamProps {
    useIce: boolean;
    // Quiz-related props
    quizId: string;
    quizStarted: boolean;
    currentQuestionNumber: number;
    questionHidden: boolean;
    onStartQuiz: () => void;
    onNextQuestion: () => void;
    onShowWinners: () => void;
}

export function HostStream({
    quizId,
    quizStarted,
    currentQuestionNumber,
    questionHidden,
    onStartQuiz,
    onNextQuestion,
    onShowWinners,
    useIce,
}: HostStreamProps) {
    const { logInfo, logError, logDebug } = new Logger('HostStream', { minLevel: LogLevel.DEBUG });
    const { data: coturnCreds } = useGetCoturnCredentialsQuery(undefined, { skip: !useIce });

    const { hasLocalMedia, isConnecting, isStreaming, localStream, error, startVideo, startStreaming, stopStreaming } =
        useProducerStreaming({
            turnCredentials: coturnCreds ?? null,
            autoConnect: false,
            autoStartVideo: false,
            useIce,
        });

    const handleStartVideo = async () => {
        logDebug('Starting video...');
        if (useIce && !coturnCreds) {
            logError('No TURN credentials available');
            return;
        }
        await startVideo();
    };

    const handleStartStreaming = async () => {
        if (useIce && !coturnCreds) {
            console.error('No TURN credentials available');
            return;
        }
        await startStreaming();
    };

    const renderQuizControl = () => {
        if (!quizStarted) {
            return (
                <Pressable style={styles.actionButton} onPress={onStartQuiz}>
                    <Text style={styles.buttonText}>Start Quiz</Text>
                </Pressable>
            );
        }

        if (currentQuestionNumber === 10) {
            return (
                <Pressable style={styles.actionButton} onPress={onShowWinners}>
                    <Text style={styles.buttonText}>Reveal Winners</Text>
                </Pressable>
            );
        }

        return (
            <Pressable style={styles.actionButton} onPress={onNextQuestion}>
                <Text style={styles.buttonText}>Next Question</Text>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {localStream && (
                <RTCView
                    streamURL={localStream.toURL()}
                    mirror={true}
                    objectFit="cover"
                    style={styles.videoBackground}
                />
            )}

            <View style={styles.contentContainer}>
                <View style={styles.questionContainer}>
                    {quizStarted && (
                        <HostQuestion quizId={quizId} trigger={currentQuestionNumber} hidden={questionHidden} />
                    )}
                </View>

                <View style={styles.controlsContainer}>
                    <View style={styles.quizControls}>{renderQuizControl()}</View>

                    <View style={styles.streamControls}>
                        <Pressable
                            style={[
                                styles.actionButton,
                                (hasLocalMedia || (useIce && !coturnCreds)) && styles.disabledButton,
                            ]}
                            onPress={handleStartVideo}
                            disabled={hasLocalMedia || (useIce && !coturnCreds)}
                        >
                            <Text style={styles.buttonText}>{hasLocalMedia ? 'Video Started' : 'Start Video'}</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.actionButton,
                                (!hasLocalMedia || isConnecting || isStreaming) && styles.disabledButton,
                            ]}
                            onPress={handleStartStreaming}
                            disabled={!hasLocalMedia || isConnecting || isStreaming}
                        >
                            <Text style={styles.buttonText}>
                                {isConnecting ? 'Connecting...' : isStreaming ? 'Streaming' : 'Stream'}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[styles.actionButton, !isStreaming && styles.disabledButton]}
                            onPress={stopStreaming}
                            disabled={!isStreaming}
                        >
                            <Text style={styles.buttonText}>End Stream</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error.message}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
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
    controlsContainer: {
        alignItems: 'center',
        marginTop: 20,
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
        backgroundColor: '#FF7F50',
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#fff',
    },
    errorContainer: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 0, 0, 0.9)',
        padding: 10,
        borderRadius: 5,
    },
    errorText: {
        color: '#fff',
        textAlign: 'center',
    },
});
