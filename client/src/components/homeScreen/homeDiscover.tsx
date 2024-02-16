import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import { CATEGORY_IMAGES } from '@/utils/images';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/utils/consts';

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
    <View key={item.id} style={styles.quizCardContainer}>
      <View style={styles.quizCard}>
        <Image
          style={styles.images}
          source={CATEGORY_IMAGES[item.category]}
          contentFit="cover"
        />
        <Text style={styles.cardTextTitle}>{item.quizName}</Text>
        <Text style={styles.cardText}>{CATEGORIES[item.category]}</Text>
      </View>
    </View>
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
  // scrollView: {
  //   height: '100%',
  // },
  // listContainer: {
  // },
  listContainer: {
    // height: '100%',
    height: '80%',
    width: Dimensions.get('window').width
  },
  quizCardContainer: {
    // flex: 1,
    // width: 290,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 8,
  },
  quizCard: {
    flex: 1,
    height: '100%',
    margin: 10,
  },
  cardTextTitle: {
    // flex: 1,
    fontFamily: 'Nunito-Black',
    // maxHeight: 25,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  cardText: {
    fontFamily: 'Nunito-Regular',
  },
  cardContainer: {
    overflow: 'scroll',
    height: '60%',
    paddingVertical: 10,
    flexDirection: 'row',
  },
  images: {
    // flex: 1,
    width: 170,
    height: 100,
    borderRadius: 10,
  },
});
