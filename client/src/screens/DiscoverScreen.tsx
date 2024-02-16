import { RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import DiscoverQuizCard from '@/components/cards/discoverQuizCard';
import { useEffect, useState } from 'react';

export default function DiscoverScreen() {
  const { data, error, isFetching, refetch } = useGetAllQuizzesQuery();

  const [sortedList, setSortedList] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchParams] = useState(['quizName', 'category']);

  const renderItem = ({ item }: { item: Quiz }) => {
    return <DiscoverQuizCard quiz={item} />;
  };

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

  function search(data: Quiz[]) {
    return data.filter((elem) =>
      searchParams.some((param) => {
        return elem[param]
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      })
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainArea}>
        <View>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <FlashList
          data={search(sortedList)}
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
  searchBar: {
    height: 50,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 10,
    paddingLeft: 15,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
  },
  listFooter: {
    height: 100,
  },
});
