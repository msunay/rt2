import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { createContext, useEffect } from 'react';
import { setIsFetching, setQuizzes /* setRefetch */ } from '@/features/quizzesSlice';
import type { RefetchQuizzes } from '@/types/Types';

export const RefetchQuizzesContext = createContext<RefetchQuizzes | null>(null);

export default function TabsLayout() {
  const dispatch = useAppDispatch();

  const {
    data: quizzes,
    refetch: refetchAllQuizzes,
    isFetching: isFetchingQuizzes,
  } = useGetAllQuizzesQuery();

  useEffect(() => {
    if (quizzes) {
      // dispatch(setRefetch(refetchAllQuizzes))
      dispatch(setQuizzes([...quizzes]));
    }
  }, [dispatch, quizzes /*refetchAllQuizzes*/]);

  useEffect(() => {
    dispatch(setIsFetching(isFetchingQuizzes));
  }, [isFetchingQuizzes, dispatch]);

  return (
    <RefetchQuizzesContext.Provider value={refetchAllQuizzes}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </SafeAreaView>
    </RefetchQuizzesContext.Provider>
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
  },
  stackContainer: {
    flex: 10,
  },
});
