import UserStream from '@/components/streaming/userStream';
import { QUIZ_BACKGROUND } from '@/utils/images';
import { useLocalSearchParams } from 'expo-router';
import { ImageBackground, StyleSheet } from 'react-native';

export default function UserStreamPage() {
  const { partId } = useLocalSearchParams<{ partId: string }>();
  console.log('PARTICIPATION ID IN THE PAGE::', partId);
  return (
    <ImageBackground
      source={QUIZ_BACKGROUND.background}
      style={styles.background}
    >
      <UserStream partId={partId!} />
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
