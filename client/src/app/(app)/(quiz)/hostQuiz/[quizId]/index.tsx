import HostStream from '@/components/streaming/hostStream';
import HostVideoStream from '@/components/streaming/hostVideoStream';
import { useGetOneQuizQuery } from '@/services/backendApi';
import { QUIZ_BACKGROUND } from '@/utils/images';
import { useLocalSearchParams } from 'expo-router';
import { ImageBackground, StyleSheet, View } from 'react-native';

export default function HostStreamPage() {
  // Get quizId from route slug.
  const { quizId } = useLocalSearchParams<{ quizId: string }>();

  // Find if quiz is video quiz
  const { data: quiz } = useGetOneQuizQuery(quizId || '');

  return (
    <ImageBackground source={QUIZ_BACKGROUND.background} style={styles.background}>
      {quiz?.hasVideo
        ? quizId && <HostVideoStream quizId={quizId} />
        : null/* quizId && <HostStream quizId={quizId} />*/}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
    // paddingBottom: 50,
    // borderWidth: 1,
  },
  camera: {
    flex: 1,
  },
});
