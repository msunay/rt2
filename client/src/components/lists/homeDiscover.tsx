import { Dimensions, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import type { Quiz } from '@/types/Types';
import { useContext, useEffect, useState } from 'react';
import HomeDiscoverCard from '../cards/homeDiscoverCard';
import { FlashList } from '@shopify/flash-list';
import { useAppSelector } from '@/hooks/reduxHooks';
import { RefetchQuizzesContext } from '@/app/(app)/(tabs)/_layout';

export default function HomeDiscover() {
  // Fetch all quizzes.
  const { allQuizzes, isFetchingQuizzes } = useAppSelector(store => store.quizzesSlice)

  const refetchAllQuizzes = useContext(RefetchQuizzesContext);

  // State to hold the sorted list of quizzes.
  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  // Effect hook to sort quizzes by their dateTime when the data is fetched or updated.
  // useEffect(() => {
  //   if (allQuizzes) {
  //     // Copy the fetched data to a new array as data from RTK is immutable.
  //     const sorted = [...data];
  //     // Sort the quizzes by dateTime in ascending order.
  //     sorted.sort(
  //       (quizA, quizB) =>
  //         new Date(quizA.dateTime).getTime() -
  //         new Date(quizB.dateTime).getTime()
  //     );
  //     // Update the state with the sorted quiz list.
  //     setSortedList(sorted);
  //   }
  // }, [data]);

  // Function to render each item in the list, utilizing a custom card component.
  const renderItem = ({ item }: { item: Quiz }) => (
    <HomeDiscoverCard quiz={item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.discoverTitleLine}>
        <Text style={styles.h1}>Discover</Text>
        <View>
          <Text style={styles.h2}>View All {'->'}</Text>
        </View>
      </View>
      <View style={styles.listContainer}>
      {
        refetchAllQuizzes &&
          <FlatList
            data={allQuizzes}
            renderItem={renderItem}
            horizontal
            // style={styles.list}
            onRefresh={() => refetchAllQuizzes()}
            refreshing={isFetchingQuizzes}
            contentContainerStyle={{maxHeight: '100%'}}
          // refreshControl={
            //   <RefreshControl onRefresh={() => refetch()} refreshing={isFetching} />
            // }
            // estimatedItemSize={198}
            showsHorizontalScrollIndicator={false}
          />
      }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: '100%',
    // width: '103.5%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
    overflow: 'visible',
  },
  discoverTitleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  h1: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
  },
  h2: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: '#FF7F50',
  },
  listContainer: {
    // flex: 1
    height: '80%',
    // width: Dimensions.get('window').width,
  },
  cardContainer: {
    overflow: 'scroll',
    height: '60%',
    paddingVertical: 10,
    flexDirection: 'row',
  },
});
