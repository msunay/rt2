import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import PlayNextQuizBtn from '@/components/homeScreen/playNextQuizBtn';
import HomeDiscover from '@/components/lists/homeDiscover';
import HomeCatagories from '@/components/lists/homeCatagories';
import { useGetUserDetailsQuery } from '@/services/backendApi';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { setCurrentUser } from '@/features/userSlice';

export default function HomeScreen() {
  const id = useAppSelector((state) => state.userIdSlice.id);
  const { data, isSuccess } = useGetUserDetailsQuery(id);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isSuccess) dispatch(setCurrentUser(data));
  }, []);

  return (
    <View style={styles.container}>
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
        <View style={styles.footerSpace}></View>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerContainer: {
    flex: 1,
    width: '100%',
  },
  mainArea: {
    flex: 10,
    width: '100%',
  },
  playNextQuizBtnContainer: {
    flex: 1,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 15
  },
  discoverContainer: {
    flex: 1.5,
  },
  catagoriesContainer: {
    flex: 1,
    // borderColor: '#FF0000',
    // borderWidth: 1,
    // marginBottom: 40,
  },
  footerSpace: {
    flex: 0.7,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
});
