import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useFonts, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useGetAllQuizzesQuery } from '@/services/apiService';
import { Quiz } from '@/types/Types';
import { FlashList } from '@shopify/flash-list';

export default function HomeDiscover() {
  const { data, error, isLoading } = useGetAllQuizzesQuery();

  let [fontsLoaded, fontError] = useFonts({
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.discoverTitleLine}>
        <Text style={styles.h1}>Discover</Text>
        <View>
          <Text style={styles.h2}>View All {'->'}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.cardContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {/* <FlashList
          data={data}
          estimatedItemSize={48}
          renderItem={({item}) => {
            return (
              <View key={item.id} style={styles.quizCard}>
                <Text>{item.quizName}</Text>
                <Text>{item.category}</Text>
                <Image
                  style={styles.images}
                  source={require('../../assets/images/tech.png')}
                />
              </View>
            )
          }}
        /> */}
        {error ? (
          <Text>Oh no, there was an error</Text>
        ) : isLoading ? (
          <Text>Loading...</Text>
        ) : data ? (
          data.map((quiz: Quiz) => (
            <View key={quiz.id} style={styles.quizCardContainer}>
              <View style={styles.quizCard}>
                <Image
                  style={styles.images}
                  source={require('../../assets/images/tech.png')}
                  contentFit='contain'
                />
                <Text>{quiz.quizName}</Text>
                <Text>{quiz.category}</Text>
                <Text>{quiz.quizOwner}</Text>
              </View>
            </View>
          ))
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '103.5%',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  discoverTitleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  h1: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
  },
  h2: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#FF7F50',
  },
  quizCardContainer: {
    width: 190,
    height: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 8,
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
  quizCard: {
    flex: 1,
    height: '100%',
    margin: 10,
  //   borderColor: '#FF0000',
  //   borderWidth: 1,
  },
  cardContainer: {
    overflow: 'scroll',
    height: '60%',
    paddingVertical: 10,
    flexDirection: 'row',
  },
  images: {
    flex: 1,
    width: '100%',
    // margin: 9,
    borderRadius: 10,
  },
});
