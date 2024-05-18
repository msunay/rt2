import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const SkeletonLoader = () => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.mainArea}>
        <Skeleton
          LinearGradientComponent={LinearGradient}
          animation='wave'
          style={styles.playNextQuizBtnContainerSkeleton}
        />
        <Skeleton
          LinearGradientComponent={LinearGradient}
          animation='wave'
          style={styles.discoverContainerSkeleton}
        />
        <Skeleton
          LinearGradientComponent={LinearGradient}
          animation='wave'
          style={styles.catagoriesContainerSkeleton}
        />
        <Skeleton
          LinearGradientComponent={LinearGradient}
          animation='wave'
          style={styles.footerSpace}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#E0E0E0', // Placeholder color
  },
  mainArea: {
    width: '93%',
    flex: 10,
  },
  playNextQuizBtnContainerSkeleton: {
    marginBottom: 15,
    // height: 400,
    borderRadius: 20,
    flex: 1,
  },
  discoverContainerSkeleton: {
    borderRadius: 20,
    flex: 1.5,
    marginBottom: 15,
  },
  catagoriesContainerSkeleton: {
    flex: 1,
    borderRadius: 20,
    marginBottom: 15,
  },
  footerSpace: {
    borderRadius: 20,
    flex: 0.7,
  },
});

export default SkeletonLoader;
