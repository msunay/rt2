import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useGetCoturnCredentialsQuery } from '../api/backendApi';
import { useConsumerStreaming } from '../lib/streaming-package/hooks/useConsumerStreaming';
import { Participation, QuizQuestionAnswer } from '../types/Types';
import FinalScore from './finalScore';
import PlayerQuestion from './playerQuestion';
import Winners from './winners';

interface ParticipantStreamProps {
    participation: Participation;
    quiz: QuizQuestionAnswer;
    quizStarted: boolean;
    currentQuestionNumber: number;
    questionHidden: boolean;
    useIce: boolean;
}

export function ParticipantStream({
    participation,
    quiz,
    quizStarted,
    currentQuestionNumber,
    questionHidden,
    useIce,
}: ParticipantStreamProps) {
    const { data: coturnCreds } = useGetCoturnCredentialsQuery(undefined, { skip: !useIce });

    const { isConnecting, isStreaming, remoteStream, error, viewKey, startConsuming } = useConsumerStreaming({
        turnCredentials: coturnCreds ?? null,
        autoConnect: false,
        autoStartConsuming: false,
        useIce,
    });

    const handleJoinStream = async () => {
        if (useIce && !coturnCreds) {
            console.error('No TURN credentials available');
            return;
        }
        await startConsuming();
    };

    const renderQuizContent = () => {
        if (!quizStarted) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.waitingText}>Waiting for the host to start the quiz...</Text>
                    <Text style={styles.subtleText}>Get ready to answer questions!</Text>
                </View>
            );
        }

        if (currentQuestionNumber < 11) {
            return (
                <PlayerQuestion
                    participation={participation}
                    currentQuestionNumber={currentQuestionNumber}
                    hidden={questionHidden}
                    quiz={quiz}
                    quizError={null}
                    quizIsLoading={false}
                />
            );
        }

        if (currentQuestionNumber === 11) {
            return <FinalScore userParticipation={participation} />;
        }

        return <Winners quizId={participation.QuizId ?? ''} />;
    };

    return (
        <View style={styles.container}>
            {remoteStream && (
                <RTCView
                    key={`rtcview-${viewKey}`}
                    streamURL={remoteStream.toURL()}
                    objectFit="cover"
                    style={styles.videoBackground}
                />
            )}

            <View style={styles.contentContainer}>
                <View style={styles.questionContainer}>{renderQuizContent()}</View>

                <View style={styles.controlsContainer}>
                    <Pressable
                        style={[
                            styles.actionButton,
                            ((useIce && !coturnCreds) || isConnecting || isStreaming) && styles.disabledButton,
                        ]}
                        onPress={handleJoinStream}
                        disabled={(useIce && !coturnCreds) || isConnecting || isStreaming}
                    >
                        <Text style={styles.buttonText}>
                            {isConnecting ? 'Connecting...' : isStreaming ? 'Connected' : 'Join Stream'}
                        </Text>
                    </Pressable>
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
