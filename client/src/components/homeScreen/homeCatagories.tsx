import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CategoryQuizCard from './categoryQuizCard';
import { FlashList } from '@shopify/flash-list';

export default function HomeCatagories() {
  const [topCategories, setTopCategories] = useState([
    'general-knowledge',
    'culture',
    'music',
  ]);

  const renderItem = ({ item }: { item: string }) => {
    return <CategoryQuizCard category={item} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.catagoriesTitleLine}>
        <Text style={styles.h1}>Top Catagories</Text>
        <View>
          <Text style={styles.h2}>View All {'->'}</Text>
        </View>
      </View>
      <View style={styles.listContainer}>
        {topCategories.map((cat, i) => (
          <CategoryQuizCard key={i} category={cat} />
        ))
        }
      </View>
      {/* <FlatList
        data={topCategories}
        renderItem={renderItem}
        horizontal
        // estimatedItemSize={187}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  catagoriesTitleLine: {
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
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    // borderColor: '#FF0000',
    // borderWidth: 1
  }
});
