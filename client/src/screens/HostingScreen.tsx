import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/utils/hooks';
import HostingQuizCard from '@/components/quiz/hostingQuizCard';

export default function HostingScreen() {
  const { data, error, isFetching, isSuccess, refetch } =
    useGetAllQuizzesQuery();
  const id = useAppSelector((state) => state.userIdSlice.id);

  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  const renderItem = ({ item }: { item: Quiz }) => {
    return <HostingQuizCard quiz={item} />;
  };

  useEffect(() => {
    if (data && isSuccess) {
      const sorted = [...data];
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime()
      );
      sorted.forEach((quiz) => {
        if (quiz.quizOwner === id) {
          setSortedList((prevList) => [...prevList, quiz]);
        }
      });
    }
  }, [data]);

  return (
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <FlashList
          data={sortedList}
          renderItem={renderItem}
          estimatedItemSize={108}
          refreshControl={
            <RefreshControl
              onRefresh={() => refetch()}
              refreshing={isFetching}
            />
          }
          ListFooterComponent={<View style={styles.listFooter}></View>}
        />
      </View>
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
  listFooter: {
    height: 100
  }
});
