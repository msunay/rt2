import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import { useEffect, useState } from 'react';
import HomeDiscoverCard from '../cards/homeDiscoverCard';

export default function HomeDiscover() {
  const { data, error, isFetching, isLoading, refetch } =
    useGetAllQuizzesQuery();

  const [sortedList, setSortedList] = useState<Quiz[]>([]);

  useEffect(() => {
    if (data) {
      const sorted = [...data];
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime()
      );
      setSortedList(sorted);
    }
  }, [data]);

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
    overflow: 'visible'
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
    width: Dimensions.get('window').width
  },

  cardContainer: {
    overflow: 'scroll',
    height: '60%',
    paddingVertical: 10,
    flexDirection: 'row',
  },
});
