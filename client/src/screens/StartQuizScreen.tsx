import { RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/global/header';
import { FlashList } from '@shopify/flash-list';
import {
  useGetAllQuizzesQuery,
  useGetUserParticipationsQuery,
} from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import ParticipationQuizCard from '@/components/quiz/participationQuizCard';
import { useAppSelector } from '@/utils/hooks';

export default function StartQuizScreen() {
  const participationList = useAppSelector(
    (state) => state.participatingSlice.value
  );

  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  const renderItem = ({ item }: { item: Quiz }) => {
    return <ParticipationQuizCard quiz={item} />;
  };

  useEffect(() => {
    if (participationList) {
      const sorted = [...participationList];
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime()
      );
      setSortedList(sorted);
    }
  }, [participationList]);

  return (
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <FlashList
          data={sortedList}
          renderItem={renderItem}
          estimatedItemSize={108}
          // refreshControl={
          //   <RefreshControl onRefresh={() => refetch()} refreshing={isFetching} />
          // }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 12,
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
});
