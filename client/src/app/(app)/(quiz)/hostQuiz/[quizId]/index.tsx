import HostStream from '@/components/streaming/hostStream';
import HostVideoStream from '@/components/streaming/hostVideoStream';
import { QUIZ_BACKGROUND } from '@/utils/images';
import { useLocalSearchParams } from 'expo-router';
import { ImageBackground, StyleSheet, View, Button, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera/next';
import { useState } from 'react';

export default function HostStreamPage() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  return (
    <ImageBackground
      source={QUIZ_BACKGROUND.background}
      style={styles.background}
    >
      <HostStream quizId={quizId!} />
    </ImageBackground>

    // <View style={styles.container}>
    //   <CameraView
    //     style={styles.camera}
    //     // facing={facing}
    //   >
    //     <HostVideoStream quizId={quizId!} />
    //   </CameraView>
    // </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
});
