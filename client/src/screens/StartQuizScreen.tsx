import { RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/global/header';
import { FlashList } from '@shopify/flash-list';
import { useGetAllQuizzesQuery, useGetUserParticipationsQuery } from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import ParticipationQuizCard from '@/components/quiz/participationQuizCard';
import { useAppSelector } from '@/utils/hooks';

export default function StartQuizScreen() {
  const { data, error, isFetching, isLoading, refetch } = useGetAllQuizzesQuery();
  const id = useAppSelector((state) => state.userIdSlice.id);


  const { data: participations } = useGetUserParticipationsQuery(id)
  const [participationList, setParticipationList] = useState<Quiz[]>([]);


  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  const renderItem = ({ item }: { item: Quiz }) => {
    return <ParticipationQuizCard quiz={item} />;
  };


  useEffect(() => {
    console.log(participations);
    if (data && participations) {
      const sorted = [...data]
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime()
      )
      sorted.forEach((quiz) => {
        participations?.quizzes.forEach((partQuiz) => {
          if (quiz.id === partQuiz.id) {
            setSortedList(prevList => [...prevList, quiz])
          }

        })
      })
      // setSortedList(sorted)
    }
  }, [data, participations]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Header />
          </View>
          <View style={styles.mainArea}>
            <FlashList
              data={sortedList}
              renderItem={renderItem}
              estimatedItemSize={108}
              refreshControl={
                <RefreshControl onRefresh={() => refetch()} refreshing={isFetching} />
              }
            />
          </View>
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
  },
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
