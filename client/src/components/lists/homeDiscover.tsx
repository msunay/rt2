import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import HomeDiscoverCard from '../cards/homeDiscoverCard';

export default function HomeDiscover() {
  // Fetch all quizzes.
  const { data, error, isFetching, isLoading, refetch } =
    useGetAllQuizzesQuery();

  // State to hold the sorted list of quizzes.
  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  // Effect hook to sort quizzes by their dateTime when the data is fetched or updated.
  useEffect(() => {
    if (data) {
      // Copy the fetched data to a new array as data from RTK is immutable.
      const sorted = [...data];
      // Sort the quizzes by dateTime in ascending order.
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime()
      );
      // Update the state with the sorted quiz list.
      setSortedList(sorted);
    }
  }, [data]);

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
        <FlatList
          data={sortedList}
          renderItem={renderItem}
          horizontal
          onRefresh={() => refetch()}
          refreshing={isFetching}
        />
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
    // height: '100%',
    height: '80%',
    width: Dimensions.get('window').width,
  },

  cardContainer: {
    overflow: 'scroll',
    height: '60%',
    paddingVertical: 10,
    flexDirection: 'row',
  },
});
