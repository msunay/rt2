import { RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useGetAllQuizzesQuery } from '@/services/backendApi';
import { Quiz } from '@/types/Types';
import DiscoverQuizCard from '@/components/cards/discoverQuizCard';
import { useEffect, useState } from 'react';

export default function DiscoverScreen() {
  // Fetch all quizzes.
  const { data, error, isFetching, refetch } = useGetAllQuizzesQuery();

  // State for managing sorted list of quizzes.
  const [sortedList, setSortedList] = useState<Quiz[]>([]);
  // State for managing the search query input by the user.
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Parameters to include in the search.
  const [searchParams] = useState(['quizName', 'category']);

  // Function to render a quiz item.
  const renderItem = ({ item }: { item: Quiz }) => {
    return <DiscoverQuizCard quiz={item} />;
  };

  // Sort quizzes by their dateTime on fetch or when data changes.
  useEffect(() => {
    if (data) {
      const sorted = [...data]; // Create a copy to as data is immutable.
      sorted.sort(
        (quizA, quizB) =>
          new Date(quizA.dateTime).getTime() -
          new Date(quizB.dateTime).getTime() // Sort by ascending date and time.
      );
      setSortedList(sorted); // Update state with sorted quizzes.
    }
  }, [data]);

  // Function to filter quizzes based on the search query.
  function search(data: Quiz[]) {
    return data.filter((elem) =>
      searchParams.some((param) => {
        // Check if any of the search parameters in a quiz includes the search query.
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
