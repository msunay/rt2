import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import ParticipationQuizCard from '@/components/cards/participationQuizCard';
import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetUserParticipationsQuery } from '@/services/backendApi';
import { setParticipationsList } from '@/features/participatingSlice';

export default function StartQuizScreen() {
  // Select User ID
  const id = useAppSelector((state) => state.userIdSlice.id);
  // Select participations array from store
  const participatingStore = useAppSelector(
    (state) => state.participatingSlice
  );
  // Hook to dispatch actions to Redux store.
  const dispatch = useAppDispatch();

  // Fetch User Participations if participations array from store has not been set
  const { data: userParticipations } = useGetUserParticipationsQuery(id);

  // State to hold the sorted list of participation quizzes.
  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  // Fetch User Participations if participations array from store has not been set
  useEffect(() => {
    if (!participatingStore.initialized) {
      if (userParticipations) {
        dispatch(setParticipationsList(userParticipations.quizzes));
      }
    }
  }, []);

  // Effect hook to sort the participation quizzes by their dateTime in ascending order once the participationList updates.
  useEffect(() => {
    // Clone the participation list to avoid mutating the original array.
    const sorted = [...participatingStore.value];
    // Sort the cloned array based on the dateTime of each quiz.
    sorted.sort(
      (quizA, quizB) =>
        new Date(quizA.dateTime).getTime() - new Date(quizB.dateTime).getTime()
    );
    // Update the sortedList state with the sorted quizzes.
    setSortedList(sorted);
  }, [participatingStore.value]);

  // Function to render a quiz item.
  const renderItem = ({ item }: { item: Quiz }) => {
    return <ParticipationQuizCard quiz={item} />;
  };

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
