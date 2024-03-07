import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/utils/hooks';
import HostingQuizCard from '@/components/cards/hostingQuizCard';
import CreateQuizBtn from '@/components/user/createQuizBtn';

export default function HostingScreen() {
  // Fetch all quizzes.
  const { data, error, isFetching, isSuccess, refetch } =
    useGetAllQuizzesQuery();
  // Retrieves the current user's ID from the Redux state, to filter quizzes by the quiz owner.
  const id = useAppSelector((state) => state.userIdSlice.id);

  // State to hold the sorted list of quizzes that the current user is hosting.
  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  // Function to render a quiz item.
  const renderItem = ({ item }: { item: Quiz }) => {
    return <HostingQuizCard quiz={item} />;
  };

  // Effect hook to sort and filter quizzes once the data is successfully fetched.
  // It sorts quizzes by dateTime and filters them to include only those hosted by the current user.
  useEffect(() => {
    if (data && isSuccess) {
      // Copy fetched quizzes to sort as data is immutable.
      const sorted = [...data];
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime() // Sorting by ascending date and time.
      );
      // Filter sorted quizzes to include only those hosted by the current user and update state.
      sorted.forEach((quiz) => {
        if (quiz.quizOwner === id) {
          setSortedList((prevList) => [...prevList, quiz]);
        }
      });
    }
  }, [data, id, isSuccess]);

  return (
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Your Upcoming Quizzes</Text>
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
          <View style={styles.rightColumn}>
            <CreateQuizBtn />
          </View>
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
  mainArea: {
    flex: 10,
    width: '100%',
    flexDirection: 'column-reverse'
  },
  listFooter: {
    height: 100,
  },
  listContainer: {
    flex: 2,
    // justifyContent: 'center',
  },
  listTitle: {
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    marginBottom: 10,
    textDecorationLine: 'underline'
  },
  rightColumn: {
    flex: 1
  }
});
