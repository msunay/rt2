import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/global/header';
import PlayNextQuizBtn from '@/components/homeScreen/playNextQuizBtn';
import HomeDiscover from '@/components/homeScreen/homeDiscover';
import HomeCatagories from '@/components/homeScreen/homeCatagories';
import { useGetUserDetailsQuery } from '@/services/backendApi';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { setCurrentUser } from '@/features/userSlice';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { data, isSuccess } = useGetUserDetailsQuery(
    useAppSelector((state) => state.userIdSlice.id)
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) dispatch(setCurrentUser(data));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Header />
          </View>
          <View style={styles.mainArea}>
            <View style={styles.playNextQuizBtnContainer}>
              <PlayNextQuizBtn />
            </View>
            <View style={styles.discoverContainer}>
              <HomeDiscover />
            </View>
            <View style={styles.catagoriesContainer}>
              <HomeCatagories />
            </View>
          </View>
          <StatusBar style="auto" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  background: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  container: {
    flex: 1,
    // marginHorizontal: 12,
    marginHorizontal: '3%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerContainer: {
    flex: 1,
    width: '100%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  mainArea: {
    flex: 10,
    width: '100%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  playNextQuizBtnContainer: {
    flex: 1,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  discoverContainer: {
    flex: 2,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  catagoriesContainer: {
    flex: 1,
    marginBottom: 40,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
});
