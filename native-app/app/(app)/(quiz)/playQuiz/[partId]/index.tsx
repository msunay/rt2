import React from 'react';
import ParticipantStream from '@/src/components/participantStream';
import { QUIZ_BACKGROUND } from '@/src/utils/images';
import { useLocalSearchParams } from 'expo-router';
import { ImageBackground, StyleSheet, Text } from 'react-native';

export default function UserStreamPage() {
  // Get participation id from route slug.
  const { partId } = useLocalSearchParams<{ partId: string }>();
  return (
    <>
      {/* <ImageBackground source={QUIZ_BACKGROUND.background} style={styles.background}> */}
        {partId && <ParticipantStream partId={partId} />}
      {/* </ImageBackground> */}
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    // resizeMode: 'cover',
    justifyContent: 'center',
    zIndex: -1
  },
});
