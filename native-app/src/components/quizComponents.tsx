import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import type { MediaStream } from 'react-native-webrtc';
import { useAppSelector } from '@/src/hooks/reduxHooks';
import PlayerQuestion from '@/src/components/playerQuestion';
import FinalScore from '@/src/components/finalScore';
import Winners from '@/src/components/winners';

/**
 * Loading screen component
 */
export function QuizLoadingScreen() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#FF7F50" />
      <Text style={styles.loadingText}>Loading quiz...</Text>
    </View>
  );
}

/**
 * Error screen component
 */
export function QuizErrorScreen({ message }: { message: string }) {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

/**
 * Waiting screen when quiz hasn't started yet
 */
export function QuizWaitingScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.waitingText}>Waiting for the host to start the quiz...</Text>
      <Text style={styles.subtleText}>Get ready to answer questions!</Text>
    </View>
  );
}

/**
 * Component to display the active question
 */
interface QuizQuestionProps {
  participation: any; // Using 'any' to avoid dependency on adapter types
  quiz: any; // Using 'any' to avoid dependency on adapter types
  questionNumber: number;
  hidden: boolean;
}

export function QuizQuestionScreen({
  quiz,
  participation,
  questionNumber,
  hidden
}: QuizQuestionProps) {
  if (!quiz || !participation) {
    return <QuizErrorScreen message="Quiz data is unavailable" />;
  }

  // Find the current question (previously used getCurrentQuestion adapter)
  const currentQuestion = quiz.questions?.find((q: { order: number }) => q.order === questionNumber);

  if (!currentQuestion) {
    return <QuizErrorScreen message={`Question ${questionNumber} not found`} />;
  }

  return (
    <View style={styles.questionContainer}>
      <PlayerQuestion
        participation={participation}
        currentQuestionNumber={questionNumber}
        hidden={hidden}
        quiz={quiz}
        quizError={null}
        quizIsLoading={false}
      />
    </View>
  );
}

/**
 * Component to display quiz results
 */
export function QuizCompletedScreen({ participation }: { participation: any }) {
  if (!participation) {
    return <QuizErrorScreen message="Participation data is unavailable" />;
  }

  return (
    <View style={styles.completedContainer}>
      <FinalScore userParticipation={participation} />
    </View>
  );
}

/**
 * Component to display quiz winners
 */
export function QuizWinnersScreen({ quizId }: { quizId: string | undefined }) {
  if (!quizId) {
    return <QuizErrorScreen message="Quiz ID is unavailable" />;
  }

  return (
    <View style={styles.winnersContainer}>
      <Winners quizId={quizId} />
    </View>
  );
}

/**
 * Component that renders the video stream
 */
export function MediaStreamView() {
  const mediaStream = useAppSelector(state => state.mediaStreamSlice.mediaStream);

  if (!mediaStream) return null;

  return (
    <RTCView
      streamURL={mediaStream.toURL()}
      objectFit="cover"
      style={styles.videoStream}
    />
  );
}

/**
 * Container component that handles quiz state and renders the appropriate screen
 */
interface QuizContainerProps {
  participation: any; // Using 'any' to avoid dependency on adapter types
  quiz: any; // Using 'any' to avoid dependency on adapter types 
  isLoading: boolean;
  error: Error | string | null;
  children?: React.ReactNode;
}

export function QuizContainer({
  quiz,
  participation,
  isLoading,
  error,
  children
}: QuizContainerProps) {
  const { quizStarted, currentQuestionNumber, questionHidden } = useAppSelector(state => state.quizSlice);

  if (isLoading) {
    return <QuizLoadingScreen />;
  }

  if (error) {
    const errorMessage = typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : 'An error occurred';

    return <QuizErrorScreen message={errorMessage} />;
  }

  if (!quiz || !participation) {
    return <QuizErrorScreen message="Quiz data is unavailable" />;
  }

  // Render the appropriate screen based on quiz state
  let content;
  if (!quizStarted) {
    content = <QuizWaitingScreen />;
  } else if (currentQuestionNumber < 11) {
    content = (
      <QuizQuestionScreen
        quiz={quiz}
        participation={participation}
        questionNumber={currentQuestionNumber}
        hidden={questionHidden}
      />
    );
  } else if (currentQuestionNumber === 11) {
    content = <QuizCompletedScreen participation={participation} />;
  } else {
    content = <QuizWinnersScreen quizId={participation.QuizId} />;
  }

  return (
    <View style={styles.container}>
      <MediaStreamView />
      <View style={styles.contentContainer}>
        {content}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoStream: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  questionContainer: {
    flex: 1,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  winnersContainer: {
    flex: 1,
  },
  loadingText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    marginTop: 10,
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
  }
});