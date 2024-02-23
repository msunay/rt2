import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/global/header';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { useGetAllQuizzesQuery, useGetUserParticipationsQuery } from '@/services/backendApi';
import { useEffect } from 'react';
import { setParticipationsList } from '@/features/participatingSlice';

export default function TabsLayout() {
  const id = useAppSelector((state) => state.userIdSlice.id);

  const dispatch = useAppDispatch();

  // Fetch all quizzes.
  const { data: quizzes, error, isFetching, refetch } = useGetAllQuizzesQuery();
  // Fetch user participations
  const { data: userParticipations } = useGetUserParticipationsQuery(id);

  useEffect(() => {
    if (userParticipations)
      dispatch(setParticipationsList(userParticipations.quizzes));
    if (quizzes) dispatch()
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Header />
      </View>
      <View style={styles.stackContainer}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginHorizontal: '3%',
  },
  headerContainer: {
    flex: 1,
    width: '100%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  stackContainer: {
    flex: 10,
  },
});
