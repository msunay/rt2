import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import type { MediaStream } from 'react-native-webrtc';
import { useQuizContext } from './QuizContext';
import { 
  QuizViewData, 
  QuestionViewData, 
  ParticipationViewData,
  getCurrentQuestion
} from './quizDataAdapters';
import PlayerQuestion from '../question/playerQuestion';
import FinalScore from '../quiz/finalScore';
import Winners from '../quiz/winners';

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
  quiz: QuizViewData | null;
  participation: ParticipationViewData | null;
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
  
  const currentQuestion = getCurrentQuestion(quiz, questionNumber);
  
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
export function QuizCompletedScreen({ participation }: { participation: ParticipationViewData | null }) {
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
export function MediaStreamView({ mediaStream }: { mediaStream: MediaStream | null }) {
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
  quiz: QuizViewData | null;
  participation: ParticipationViewData | null;
  isLoading: boolean;
  error: Error | null;
  children?: React.ReactNode;
}

export function QuizContainer({ 
  quiz, 
  participation, 
  isLoading, 
  error,
  children 
}: QuizContainerProps) {
  const { 
    state, 
    mediaStream
  } = useQuizContext();
  
  if (isLoading) {
    return <QuizLoadingScreen />;
  }
  
  if (error) {
    return <QuizErrorScreen message={error.message} />;
  }
  
  if (!quiz || !participation) {
    return <QuizErrorScreen message="Quiz data is unavailable" />;
  }
  
  // Render the appropriate screen based on quiz state
  let content;
  if (!state.quizStarted) {
    content = <QuizWaitingScreen />;
  } else if (state.currentQuestionNumber < 11) {
    content = (
      <QuizQuestionScreen
        quiz={quiz}
        participation={participation}
        questionNumber={state.currentQuestionNumber}
        hidden={state.questionHidden}
      />
    );
  } else if (state.currentQuestionNumber === 11) {
    content = <QuizCompletedScreen participation={participation} />;
  } else {
    content = <QuizWinnersScreen quizId={participation.quizId} />;
  }
  
  return (
    <View style={styles.container}>
      <MediaStreamView mediaStream={mediaStream} />
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