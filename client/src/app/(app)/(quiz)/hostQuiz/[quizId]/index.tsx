import HostStream from '@/components/streaming/hostStream';
import { QUIZ_BACKGROUND } from '@/utils/images';
import { useLocalSearchParams } from 'expo-router';
import { ImageBackground, StyleSheet } from 'react-native';

export default function HostStreamPage() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  return (
    <ImageBackground
      source={QUIZ_BACKGROUND.background}
      style={styles.background}
    >
      <HostStream quizId={quizId!} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});
