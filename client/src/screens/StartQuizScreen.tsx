import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import ParticipationQuizCard from '@/components/cards/participationQuizCard';
import { useAppSelector } from '@/utils/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StartQuizScreen() {
  // Selector to retrieve the list of quizzes the user is participating in from the Redux state.
  const participationList = useAppSelector(
    (state) => state.participatingSlice.value
  );

  // State to hold the sorted list of participation quizzes.
  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  // Function to render a quiz item.
  const renderItem = ({ item }: { item: Quiz }) => {
    return <ParticipationQuizCard quiz={item} />;
  };

  // Effect hook to sort the participation quizzes by their dateTime in ascending order once the participationList updates.
  useEffect(() => {
    if (participationList) {
      // Clone the participation list to avoid mutating the original array.
      const sorted = [...participationList];
      // Sort the cloned array based on the dateTime of each quiz.
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime()
      );
      // Update the sortedList state with the sorted quizzes.
      setSortedList(sorted);
    }
  }, [participationList]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.mainArea}>
          {sortedList.length ? (
            <FlashList
              data={sortedList}
              renderItem={renderItem}
              estimatedItemSize={108}
              ListFooterComponent={<View style={styles.listFooter}></View>}
            />
          ) : (
            <View style={styles.emptyList}>
              <Text>You're not signed up to any Quizzes</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
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
    height: 100,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
});
