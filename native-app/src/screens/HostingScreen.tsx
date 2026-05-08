import { RefetchQuizzesContext } from '@/app/(app)/(tabs)/_layout';
import HostingQuizCard from '@/src/components/cards/hostingQuizCard';
import Header from '@/src/components/header';
import CreateQuizBtn from '@/src/components/createQuizBtn';
import { useAppSelector } from '@/src/hooks/reduxHooks';
import type { Quiz } from '@/src/types/Types';
import { FlashList } from '@shopify/flash-list';
import { useContext, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function HostingScreen() {
  const refetchAllQuizzes = useContext(RefetchQuizzesContext);
  // Fetch all quizzes.
  const { allQuizzes, isFetchingQuizzes } = useAppSelector(store => store.quizzesSlice);
  // Retrieves the current user's ID from the Redux state, to filter quizzes by the quiz owner.
  const id = useAppSelector(state => state.userIdSlice.id);

  // State to hold the sorted list of quizzes that the current user is hosting.
  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  // Function to render a quiz item.
  const renderItem = ({ item }: { item: Quiz }) => {
    return <HostingQuizCard quiz={item} />;
  };

  // Effect hook to sort and filter quizzes once the data is successfully fetched.
  // It sorts quizzes by dateTime and filters them to include only those hosted by the current user.
  useEffect(() => {
    if (allQuizzes) {
      // Copy fetched quizzes to sort as data is immutable.
      // Filter sorted quizzes to include only those hosted by the current user and update state.
      const userHostingQuizzes = allQuizzes.filter(quiz => quiz.quizOwner === id);
      setSortedList(userHostingQuizzes);
    }
  }, [allQuizzes, id]);

  return (
    <>
      <Header />
      <View style={styles.container}>
        <View style={styles.mainArea}>
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Your Upcoming Quizzes</Text>
            {refetchAllQuizzes && (
              <FlashList
                data={sortedList}
                renderItem={renderItem}
                estimatedItemSize={108}
                refreshControl={
                  <RefreshControl
                    onRefresh={() => refetchAllQuizzes()}
                    refreshing={isFetchingQuizzes}
                  />
                }
                ListFooterComponent={<View style={styles.listFooter} />}
              />
            )}
          </View>
          <View style={styles.rightColumn}>
            <CreateQuizBtn />
          </View>
        </View>
      </View>
    </>
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
    flexDirection: 'column-reverse',
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
    textDecorationLine: 'underline',
  },
  rightColumn: {
    flex: 1,
  },
});
